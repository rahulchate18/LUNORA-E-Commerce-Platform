/**
 * context/cart-context.tsx — Shopping Cart State
 *
 * Client-only context. Persists to localStorage so cart survives page refresh.
 * Provides: CartContext, CartProvider, useCart hook.
 *
 * State: CartItem[] + AppliedCoupon | null
 * Actions: addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon
 */
"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CartItem, CartState, AppliedCoupon, Product, ProductColor } from "@/types";

// ─── Mock coupon codes (Phase 3: backend validates these) ─────────────────────
const VALID_COUPONS: Record<string, AppliedCoupon> = {
  LUNORA10: { code: "LUNORA10", discount: 10, type: "percent" },
  WELCOME200: { code: "WELCOME200", discount: 200, type: "flat" },
  FESTIVE15: { code: "FESTIVE15", discount: 15, type: "percent" },
};

// ─── Actions ──────────────────────────────────────────────────────────────────
type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity: number; color?: ProductColor }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "APPLY_COUPON"; coupon: AppliedCoupon }
  | { type: "REMOVE_COUPON" }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE"; state: CartState };

// ─── Reducer ──────────────────────────────────────────────────────────────────
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.product.id === action.product.id
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: Math.min(i.quantity + action.quantity, 10) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            product: action.product,
            quantity: action.quantity,
            selectedColor: action.color,
          },
        ],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.product.id !== action.productId),
      };

    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.product.id !== action.productId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId
            ? { ...i, quantity: Math.min(action.quantity, 10) }
            : i
        ),
      };
    }

    case "APPLY_COUPON":
      return { ...state, coupon: action.coupon };

    case "REMOVE_COUPON":
      return { ...state, coupon: null };

    case "CLEAR_CART":
      return { items: [], coupon: null };

    default:
      return state;
  }
}

// ─── Computed values ──────────────────────────────────────────────────────────
export interface CartComputedValues {
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  total: number;
  itemCount: number;
}

function computeCart(state: CartState): CartComputedValues {
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  let discountAmount = 0;
  if (state.coupon) {
    discountAmount =
      state.coupon.type === "flat"
        ? state.coupon.discount
        : Math.round((subtotal * state.coupon.discount) / 100);
  }
  const deliveryCharge = subtotal >= 999 ? 0 : 99;
  const total = Math.max(0, subtotal - discountAmount) + deliveryCharge;
  const itemCount = state.items.reduce((n, i) => n + i.quantity, 0);
  return { subtotal, discountAmount, deliveryCharge, total, itemCount };
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface CartContextValue {
  state: CartState;
  computed: CartComputedValues;
  addToCart: (product: Product, quantity?: number, color?: ProductColor) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = "lunora_cart";
const INITIAL_STATE: CartState = { items: [], coupon: null };

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, INITIAL_STATE);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartState;
        dispatch({ type: "HYDRATE", state: parsed });
      }
    } catch {
      // Ignore parse errors — start with empty cart
    }
  }, []);

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage might be full or unavailable
    }
  }, [state]);

  const addToCart = useCallback(
    (product: Product, quantity = 1, color?: ProductColor) => {
      dispatch({ type: "ADD_ITEM", product, quantity, color });
    },
    []
  );

  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: "REMOVE_ITEM", productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", productId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const applyCoupon = useCallback(
    (code: string): { success: boolean; message: string } => {
      const coupon = VALID_COUPONS[code.toUpperCase()];
      if (!coupon) {
        return { success: false, message: "Invalid coupon code." };
      }
      dispatch({ type: "APPLY_COUPON", coupon });
      return { success: true, message: `Coupon applied! You saved ${coupon.type === "flat" ? `₹${coupon.discount}` : `${coupon.discount}%`}.` };
    },
    []
  );

  const removeCoupon = useCallback(() => {
    dispatch({ type: "REMOVE_COUPON" });
  }, []);

  const isInCart = useCallback(
    (productId: string) => state.items.some((i) => i.product.id === productId),
    [state.items]
  );

  const computed = computeCart(state);

  return (
    <CartContext.Provider
      value={{
        state,
        computed,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
