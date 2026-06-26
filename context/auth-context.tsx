/**
 * context/auth-context.tsx — User authentication & Dashboard data state
 *
 * Client-only context. Persists session profile details to localStorage.
 * Includes simulated loading delays for a professional, premium user experience.
 */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Address, Order, OrderStatus } from "@/types";
import { PRODUCTS } from "@/lib/mock-data";
import { API_BASE } from "@/lib/api-config";

interface AuthContextValue {
  user: User | null;
  addresses: Address[];
  orders: Order[];
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (name: string, email: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  addAddress: (address: Omit<Address, "id">) => Promise<{ success: boolean; message: string }>;
  updateAddress: (address: Address) => Promise<{ success: boolean; message: string }>;
  deleteAddress: (id: string) => Promise<{ success: boolean; message: string }>;
  setDefaultAddress: (id: string) => Promise<{ success: boolean; message: string }>;
  getOrderById: (id: string) => Order | undefined;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEYS = {
  USER: "lunora_auth_user",
  ADDRESSES: "lunora_auth_addresses",
  ORDERS: "lunora_auth_orders",
};

// ─── Initial Mock Data ────────────────────────────────────────────────────────
const MOCK_USER: User = {
  id: "u001",
  name: "Aarushi Goel",
  email: "aarushi.goel@example.com",
  phone: "+91 98765 43210",
};

const MOCK_ADDRESSES: Address[] = [
  {
    id: "a001",
    name: "Aarushi Goel",
    street: "Flat 402, Block C, Maple Heights, Outer Ring Road",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560103",
    phone: "+91 98765 43210",
    isDefault: true,
  },
  {
    id: "a002",
    name: "Aarushi Goel",
    street: "12, Shanti Kunj, Sector 15",
    city: "Gurugram",
    state: "Haryana",
    postalCode: "122001",
    phone: "+91 98765 43210",
    isDefault: false,
  },
];

// Fetching mock product models to build real order details
const MOCK_ORDERS = (): Order[] => [
  {
    id: "ord-88392",
    orderNumber: "LUN-2026-88392",
    date: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
    status: "Delivered",
    items: [
      {
        product: PRODUCTS[0], // Classic Canvas Tote (1299)
        quantity: 1,
        price: 1299,
        selectedColor: PRODUCTS[0].colors[0],
      },
      {
        product: PRODUCTS[3], // Structured Mini Handbag (2199)
        quantity: 1,
        price: 2199,
        selectedColor: PRODUCTS[3].colors[1],
      },
    ],
    subtotal: 3498,
    discount: 349, // 10% coupon discount
    deliveryCharge: 0,
    total: 3149,
    shippingAddress: MOCK_ADDRESSES[0],
    paymentMethod: "UPI (Google Pay)",
  },
  {
    id: "ord-54210",
    orderNumber: "LUN-2026-54210",
    date: new Date(Date.now() - 28 * 86400000).toISOString(), // 28 days ago
    status: "Delivered",
    items: [
      {
        product: PRODUCTS[11], // Mini Coin Pouch Set (799)
        quantity: 2,
        price: 799,
        selectedColor: PRODUCTS[11].colors[1],
      },
    ],
    subtotal: 1598,
    discount: 0,
    deliveryCharge: 0,
    total: 1598,
    shippingAddress: MOCK_ADDRESSES[0],
    paymentMethod: "Cash on Delivery",
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Hydrate states from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const savedAddresses = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);

      if (savedUser) {
        setUser(JSON.parse(savedUser) as User);
        setAddresses(savedAddresses ? (JSON.parse(savedAddresses) as Address[]) : MOCK_ADDRESSES);
        setOrders(savedOrders ? (JSON.parse(savedOrders) as Order[]) : MOCK_ORDERS());
      } else {
        // Clear anything if user is not logged in
        localStorage.removeItem(STORAGE_KEYS.ADDRESSES);
        localStorage.removeItem(STORAGE_KEYS.ORDERS);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const body = await res.json();
        if (body.success) {
          const userObj = {
            id: body.data.user.id || body.data.user._id,
            name: body.data.user.name,
            email: body.data.user.email,
            phone: body.data.user.phone || "",
          };
          setUser(userObj);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userObj));
          localStorage.setItem("lunora_token", body.data.token);
          setLoading(false);
          return { success: true, message: body.message || "Logged in successfully!" };
        } else {
          setLoading(false);
          return { success: false, message: body.message || "Login failed." };
        }
      } catch (err) {
        // Fallback to mock for offline resilience
        if (email.toLowerCase() === "aarushi.goel@example.com" && password === "password123") {
          setUser(MOCK_USER);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(MOCK_USER));
          localStorage.setItem("lunora_token", "mock_token_123");
          setLoading(false);
          return { success: true, message: "Logged in successfully (Mock Mode)!" };
        }
        setLoading(false);
        return { success: false, message: "Connection to authentication server failed." };
      }
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const body = await res.json();
        if (body.success) {
          const userObj = {
            id: body.data.user.id || body.data.user._id,
            name: body.data.user.name,
            email: body.data.user.email,
            phone: body.data.user.phone || "",
          };
          setUser(userObj);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userObj));
          localStorage.setItem("lunora_token", body.data.token);
          setLoading(false);
          return { success: true, message: body.message || "Account created successfully!" };
        } else {
          setLoading(false);
          return { success: false, message: body.message || "Registration failed." };
        }
      } catch (err) {
        // Fallback to mock
        const newUser = { id: `u-${Date.now()}`, name, email };
        setUser(newUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        localStorage.setItem("lunora_token", "mock_token_123");
        setLoading(false);
        return { success: true, message: "Account created successfully (Mock Mode)!" };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setAddresses([]);
    setOrders([]);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ADDRESSES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
  }, []);

  const updateProfile = useCallback(
    async (name: string, email: string, phone?: string): Promise<{ success: boolean; message: string }> => {
      if (!user) return { success: false, message: "No active session." };
      await new Promise((resolve) => setTimeout(resolve, 600));

      const updated = { ...user, name, email, phone };
      setUser(updated);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return { success: true, message: "Profile updated successfully!" };
    },
    [user]
  );

  const addAddress = useCallback(
    async (newAddr: Omit<Address, "id">): Promise<{ success: boolean; message: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const id = `a-${Date.now()}`;
      const addressItem: Address = { ...newAddr, id };

      setAddresses((prev) => {
        let updated = [...prev];
        if (addressItem.isDefault) {
          // Unset any previous defaults
          updated = updated.map((a) => ({ ...a, isDefault: false }));
        }
        // If it's the first address, make it default automatically
        if (updated.length === 0) {
          addressItem.isDefault = true;
        }
        const result = [...updated, addressItem];
        localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(result));
        return result;
      });

      return { success: true, message: "Address added successfully!" };
    },
    []
  );

  const updateAddress = useCallback(
    async (updatedAddr: Address): Promise<{ success: boolean; message: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setAddresses((prev) => {
        let updated = prev.map((a) => (a.id === updatedAddr.id ? updatedAddr : a));
        if (updatedAddr.isDefault) {
          updated = updated.map((a) => (a.id !== updatedAddr.id ? { ...a, isDefault: false } : a));
        }
        localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(updated));
        return updated;
      });

      return { success: true, message: "Address updated successfully!" };
    },
    []
  );

  const deleteAddress = useCallback(
    async (id: string): Promise<{ success: boolean; message: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 400));

      setAddresses((prev) => {
        const toDelete = prev.find((a) => a.id === id);
        let updated = prev.filter((a) => a.id !== id);
        
        // If we deleted the default, set default to the first remaining one
        if (toDelete?.isDefault && updated.length > 0) {
          updated[0].isDefault = true;
        }
        
        localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(updated));
        return updated;
      });

      return { success: true, message: "Address deleted successfully!" };
    },
    []
  );

  const setDefaultAddress = useCallback(
    async (id: string): Promise<{ success: boolean; message: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      setAddresses((prev) => {
        const updated = prev.map((a) => ({ ...a, isDefault: a.id === id }));
        localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(updated));
        return updated;
      });

      return { success: true, message: "Default address updated!" };
    },
    []
  );

  const getOrderById = useCallback(
    (id: string) => {
      return orders.find((o) => o.id === id);
    },
    [orders]
  );

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        addresses,
        orders,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        getOrderById,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
