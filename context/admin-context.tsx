/**
 * context/admin-context.tsx — Admin dashboard state manager
 *
 * Client-only context. Persists products, orders, customers, and coupons
 * to localStorage. Includes mock data and latency simulations for premium UI.
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
import type { Product, Order, OrderStatus, Category, ProductColor } from "@/types";
import { PRODUCTS } from "@/lib/mock-data";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  status: "Active" | "Blocked";
  joinedDate: string;
}

export interface CouponRule {
  code: string;
  discount: number;
  type: "flat" | "percent";
  isActive: boolean;
  minSpend?: number;
}

interface AdminContextValue {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  coupons: CouponRule[];
  loading: boolean;
  addProduct: (product: Omit<Product, "id" | "slug" | "rating" | "reviewCount" | "reviews">) => Promise<{ success: boolean; message: string }>;
  updateProduct: (product: Product) => Promise<{ success: boolean; message: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; message: string }>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<{ success: boolean; message: string }>;
  toggleCustomerBlock: (id: string) => Promise<{ success: boolean; message: string }>;
  addCoupon: (coupon: CouponRule) => Promise<{ success: boolean; message: string }>;
  toggleCouponActive: (code: string) => Promise<{ success: boolean; message: string }>;
  deleteCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

const STORAGE_KEYS = {
  PRODUCTS: "lunora_admin_products",
  ORDERS: "lunora_admin_orders",
  CUSTOMERS: "lunora_admin_customers",
  COUPONS: "lunora_admin_coupons",
};

// ─── Initial Mock Data ────────────────────────────────────────────────────────
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "c001",
    name: "Aarushi Goel",
    email: "aarushi.goel@example.com",
    phone: "+91 98765 43210",
    ordersCount: 2,
    totalSpent: 4747,
    status: "Active",
    joinedDate: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: "c002",
    name: "Vikram Malhotra",
    email: "vikram.m@example.com",
    phone: "+91 99112 23344",
    ordersCount: 3,
    totalSpent: 8597,
    status: "Active",
    joinedDate: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: "c003",
    name: "Priyanka Sen",
    email: "priyanka.s@example.com",
    ordersCount: 1,
    totalSpent: 1899,
    status: "Blocked",
    joinedDate: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: "c004",
    name: "Rajesh Kumar",
    email: "rajesh.k@example.com",
    phone: "+91 98100 98100",
    ordersCount: 0,
    totalSpent: 0,
    status: "Active",
    joinedDate: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_COUPONS: CouponRule[] = [
  { code: "LUNORA10", discount: 10, type: "percent", isActive: true },
  { code: "WELCOME200", discount: 200, type: "flat", isActive: true, minSpend: 999 },
  { code: "FESTIVE15", discount: 15, type: "percent", isActive: true },
  { code: "CLEARANCE50", discount: 50, type: "percent", isActive: false },
];

const INITIAL_ORDERS = (): Order[] => {
  // Mock customer shipping addresses
  const mockAddr = {
    id: "a-mock-01",
    name: "Vikram Malhotra",
    street: "B-12, Green Park Extension",
    city: "New Delhi",
    state: "Delhi",
    postalCode: "110016",
    phone: "+91 99112 23344",
    isDefault: true,
  };
  
  return [
    {
      id: "ord-88392",
      orderNumber: "LUN-2026-88392",
      date: new Date(Date.now() - 5 * 86400000).toISOString(),
      status: "Delivered",
      items: [
        {
          product: PRODUCTS[0], // Classic Canvas Tote
          quantity: 1,
          price: 1299,
          selectedColor: PRODUCTS[0].colors[0],
        },
        {
          product: PRODUCTS[3], // Structured Mini Handbag
          quantity: 1,
          price: 2199,
          selectedColor: PRODUCTS[3].colors[1],
        },
      ],
      subtotal: 3498,
      discount: 349,
      deliveryCharge: 0,
      total: 3149,
      shippingAddress: {
        id: "a001",
        name: "Aarushi Goel",
        street: "Flat 402, Block C, Maple Heights, Outer Ring Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560103",
        phone: "+91 98765 43210",
        isDefault: true,
      },
      paymentMethod: "UPI (Google Pay)",
    },
    {
      id: "ord-54210",
      orderNumber: "LUN-2026-54210",
      date: new Date(Date.now() - 28 * 86400000).toISOString(),
      status: "Delivered",
      items: [
        {
          product: PRODUCTS[11], // Mini Coin Pouch Set
          quantity: 2,
          price: 799,
          selectedColor: PRODUCTS[11].colors[1],
        },
      ],
      subtotal: 1598,
      discount: 0,
      deliveryCharge: 0,
      total: 1598,
      shippingAddress: {
        id: "a001",
        name: "Aarushi Goel",
        street: "Flat 402, Block C, Maple Heights, Outer Ring Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560103",
        phone: "+91 98765 43210",
        isDefault: true,
      },
      paymentMethod: "Cash on Delivery",
    },
    {
      id: "ord-90112",
      orderNumber: "LUN-2026-90112",
      date: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
      status: "Shipped",
      items: [
        {
          product: PRODUCTS[1], // Premium Leather Tote (3499)
          quantity: 1,
          price: 3499,
          selectedColor: PRODUCTS[1].colors[0],
        },
      ],
      subtotal: 3499,
      discount: 0,
      deliveryCharge: 0,
      total: 3499,
      shippingAddress: mockAddr,
      paymentMethod: "Credit Card",
    },
    {
      id: "ord-34821",
      orderNumber: "LUN-2026-34821",
      date: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
      status: "Processing",
      items: [
        {
          product: PRODUCTS[8], // Professional Laptop Bag (2999)
          quantity: 1,
          price: 2999,
          selectedColor: PRODUCTS[8].colors[1],
        },
        {
          product: PRODUCTS[11], // Mini Coin Pouch Set (799)
          quantity: 1,
          price: 799,
          selectedColor: PRODUCTS[11].colors[0],
        },
      ],
      subtotal: 3798,
      discount: 0,
      deliveryCharge: 0,
      total: 3798,
      shippingAddress: mockAddr,
      paymentMethod: "UPI (PhonePe)",
    },
    {
      id: "ord-11290",
      orderNumber: "LUN-2026-11290",
      date: new Date().toISOString(), // Today
      status: "Pending",
      items: [
        {
          product: PRODUCTS[6], // Crossbody Sling Bag (1499)
          quantity: 1,
          price: 1499,
          selectedColor: PRODUCTS[6].colors[0],
        },
      ],
      subtotal: 1499,
      discount: 150,
      deliveryCharge: 0,
      total: 1349,
      shippingAddress: mockAddr,
      paymentMethod: "UPI (Google Pay)",
    },
  ];
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<CouponRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const savedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      const savedCoupons = localStorage.getItem(STORAGE_KEYS.COUPONS);

      setProducts(savedProducts ? (JSON.parse(savedProducts) as Product[]) : PRODUCTS);
      setOrders(savedOrders ? (JSON.parse(savedOrders) as Order[]) : INITIAL_ORDERS());
      setCustomers(savedCustomers ? (JSON.parse(savedCustomers) as Customer[]) : INITIAL_CUSTOMERS);
      setCoupons(savedCoupons ? (JSON.parse(savedCoupons) as CouponRule[]) : INITIAL_COUPONS);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync products helper
  const saveProductsList = (newList: Product[]) => {
    setProducts(newList);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(newList));
  };

  // Sync orders helper
  const saveOrdersList = (newList: Order[]) => {
    setOrders(newList);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newList));
    // Also update order details database in customer AuthContext if needed
    localStorage.setItem("lunora_auth_orders", JSON.stringify(newList));
  };

  // Sync customers helper
  const saveCustomersList = (newList: Customer[]) => {
    setCustomers(newList);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(newList));
  };

  // Sync coupons helper
  const saveCouponsList = (newList: CouponRule[]) => {
    setCoupons(newList);
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(newList));
  };

  const addProduct = useCallback(
    async (p: Omit<Product, "id" | "slug" | "rating" | "reviewCount" | "reviews">): Promise<{ success: boolean; message: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      
      // Check duplicate slug
      if (products.some((item) => item.slug === slug)) {
        return { success: false, message: "A product with this name already exists." };
      }

      const newProduct: Product = {
        ...p,
        id: `p-${Date.now()}`,
        slug,
        rating: 5.0,
        reviewCount: 0,
        reviews: [],
      };

      saveProductsList([newProduct, ...products]);
      return { success: true, message: "Product created successfully!" };
    },
    [products]
  );

  const updateProduct = useCallback(
    async (p: Product): Promise<{ success: boolean; message: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const updated = products.map((item) =>
        item.id === p.id ? { ...p, slug } : item
      );
      saveProductsList(updated);
      return { success: true, message: "Product updated successfully!" };
    },
    [products]
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<{ success: boolean; message: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const filtered = products.filter((item) => item.id !== id);
      saveProductsList(filtered);
      return { success: true, message: "Product deleted successfully!" };
    },
    [products]
  );

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus): Promise<{ success: boolean; message: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const updated = orders.map((item) =>
        item.id === id ? { ...item, status } : item
      );
      saveOrdersList(updated);
      return { success: true, message: `Order status updated to ${status}!` };
    },
    [orders]
  );

  const toggleCustomerBlock = useCallback(
    async (id: string): Promise<{ success: boolean; message: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const updated = customers.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === "Active" ? "Blocked" : "Active";
          return { ...c, status: nextStatus as "Active" | "Blocked" };
        }
        return c;
      });
      saveCustomersList(updated);
      return { success: true, message: "Customer status updated successfully!" };
    },
    [customers]
  );

  const addCoupon = useCallback(
    async (coupon: CouponRule): Promise<{ success: boolean; message: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const codeUpper = coupon.code.toUpperCase().trim();
      if (coupons.some((c) => c.code === codeUpper)) {
        return { success: false, message: "Coupon code already exists." };
      }

      saveCouponsList([...coupons, { ...coupon, code: codeUpper }]);
      return { success: true, message: "Coupon added successfully!" };
    },
    [coupons]
  );

  const toggleCouponActive = useCallback(
    async (code: string): Promise<{ success: boolean; message: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const updated = coupons.map((c) =>
        c.code === code ? { ...c, isActive: !c.isActive } : c
      );
      saveCouponsList(updated);
      return { success: true, message: "Coupon status toggled successfully!" };
    },
    [coupons]
  );

  const deleteCoupon = useCallback(
    async (code: string): Promise<{ success: boolean; message: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const filtered = coupons.filter((c) => c.code !== code);
      saveCouponsList(filtered);
      return { success: true, message: "Coupon deleted successfully!" };
    },
    [coupons]
  );

  return (
    <AdminContext.Provider
      value={{
        products,
        orders,
        customers,
        coupons,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        toggleCustomerBlock,
        addCoupon,
        toggleCouponActive,
        deleteCoupon,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}
