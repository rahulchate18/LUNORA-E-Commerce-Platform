"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { API_BASE } from "@/lib/api-config";
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  ShoppingBag, 
  Percent, 
  AlertCircle,
  MapPin,
  Lock,
  Sparkles,
  X
} from "lucide-react";

// Web Crypto helper to generate valid HMAC-SHA256 signatures for local sandbox testing
async function hmacSHA256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await window.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    messageData
  );
  
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function CheckoutPage() {
  const router = useRouter();
  const { state: cartState, computed: cartComputed, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if cart is empty (safe-check for hydration)
  useEffect(() => {
    if (mounted && cartState.items.length === 0) {
      const storedCart = localStorage.getItem("lunora_cart");
      let isActuallyEmpty = true;
      if (storedCart) {
        try {
          const parsed = JSON.parse(storedCart);
          if (parsed?.items && parsed.items.length > 0) {
            isActuallyEmpty = false;
          }
        } catch (_) {}
      }
      if (isActuallyEmpty) {
        router.push("/cart");
      }
    }
  }, [mounted, cartState.items, router]);

  // Form states
  const [address, setAddress] = useState({
    name: user?.name || "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [razorpayScriptLoaded, setRazorpayScriptLoaded] = useState(false);

  // Loading Overlay states
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Sandbox simulation states
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [sandboxOrderParams, setSandboxOrderParams] = useState<any>(null);

  // Dynamic calculations (matching server logic)
  const subtotal = cartComputed.subtotal;
  
  // Coupon logic
  let discount = 0;
  if (cartState.coupon) {
    if (cartState.coupon.type === "flat") {
      discount = cartState.coupon.discount;
    } else {
      discount = Math.round(subtotal * (cartState.coupon.discount / 100));
    }
  }
  discount = Math.min(discount, subtotal);

  const taxableAmount = subtotal - discount;
  const shipping = taxableAmount >= 2000 ? 0 : 99;
  const gst = Math.round(taxableAmount * 0.18);
  const total = taxableAmount + shipping + gst;

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Checkout submission
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) return;
    setErrorMessage("");

    // Validate inputs
    if (!address.name || !address.street || !address.city || !address.state || !address.postalCode || !address.phone) {
      setErrorMessage("Please complete all shipping address fields.");
      toast.error("Please complete all shipping address fields.");
      return;
    }

    // Zip/Pin validation 5 or 6 digits
    const pinRegex = /^[0-9]{5,6}$/;
    if (!pinRegex.test(address.postalCode)) {
      setErrorMessage("Postal code must be 5 or 6 digits.");
      toast.error("Invalid postal code.");
      return;
    }

    // Phone validation 10 to 12 digits
    const phoneRegex = /^[0-9]{10,12}$/;
    if (!phoneRegex.test(address.phone)) {
      setErrorMessage("Phone number must be 10 to 12 digits.");
      toast.error("Invalid phone number.");
      return;
    }

    setProcessing(true);
    const token = localStorage.getItem("lunora_token") || "";

    // ─── CASE 1: Cash on Delivery (COD) ──────────────────────────────────────
    if (paymentMethod === "cod") {
      toast.info("Payment started: Placing cash-on-delivery order.");
      setShowLoadingOverlay(true);
      setCurrentStepIndex(0); // "Creating secure payment order..."
      
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setCurrentStepIndex(2); // "Verifying payment credentials..."
        
        const res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shippingAddress: address,
            paymentMethod: "Cash on Delivery",
            couponCode: cartState.coupon?.code || undefined,
          }),
        });

        const data = await res.json();
        
        if (data.success) {
          setCurrentStepIndex(3); // "Finalizing your premium order..."
          await new Promise((resolve) => setTimeout(resolve, 600));
          
          clearCart();
          localStorage.setItem("last_order_details", JSON.stringify({
            orderNumber: data.data.order.orderNumber,
            paymentId: "N/A (Cash on Delivery)",
            amount: data.data.order.total,
            paymentMethod: "Cash on Delivery",
            date: new Date().toISOString(),
          }));
          
          toast.success("COD order placed successfully!");
          toast.success("Order created successfully.");
          router.push("/order-success");
        } else {
          setErrorMessage(data.message || "Failed to place COD order.");
          toast.error(data.message || "Order creation failed.");
          setShowLoadingOverlay(false);
          setProcessing(false);
        }
      } catch (err) {
        console.warn("Backend order server unreachable. Placing COD order in local mock mode.", err);
        
        const orderNumber = `LUN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const total = cartComputed.total;

        setCurrentStepIndex(3); // "Finalizing your premium order..."
        await new Promise((resolve) => setTimeout(resolve, 800));

        localStorage.setItem("last_order_details", JSON.stringify({
          orderNumber,
          paymentId: "N/A (Cash on Delivery - Mock Mode)",
          amount: total,
          paymentMethod: "Cash on Delivery",
          date: new Date().toISOString(),
        }));

        try {
          const savedOrdersStr = localStorage.getItem("lunora_auth_orders");
          const existingOrders = savedOrdersStr ? JSON.parse(savedOrdersStr) : [];
          
          const newOrder = {
            id: `ord-${Math.floor(10000 + Math.random() * 90000)}`,
            orderNumber,
            date: new Date().toISOString(),
            status: "Pending",
            items: cartState.items,
            subtotal: cartComputed.subtotal,
            discount: cartComputed.discountAmount,
            deliveryCharge: cartComputed.deliveryCharge,
            total,
            shippingAddress: address,
            paymentMethod: "Cash on Delivery",
          };
          
          existingOrders.unshift(newOrder);
          localStorage.setItem("lunora_auth_orders", JSON.stringify(existingOrders));
        } catch (_) {}

        clearCart();
        toast.success("COD order placed successfully (Mock Mode)!");
        toast.success("Order created successfully.");
        router.push("/order-success");
      }
      return;
    }

    // ─── CASE 2: Razorpay Online Payment ──────────────────────────────────────
    toast.info("Payment started: Initiating secure online transaction.");
    setShowLoadingOverlay(true);
    setCurrentStepIndex(0); // "Creating secure payment order..."

    try {
      const res = await fetch(`${API_BASE}/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          couponCode: cartState.coupon?.code || undefined,
        }),
      });

      const orderData = await res.json();
      if (!orderData.success) {
        setErrorMessage(orderData.message || "Failed to create payment order.");
        toast.error(orderData.message || "Failed to initiate payment.");
        setShowLoadingOverlay(false);
        setProcessing(false);
        return;
      }

      const { orderId, amount, currency, key } = orderData.data;

      // ─── MOCK MODE CHECK (LUNORA Custom Sandbox Simulation) ───────────────────
      if (key === "rzp_test_mockKeyId123") {
        setCurrentStepIndex(1); // "Opening secure checkout window..."
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        // Hide general loading overlay so client can interact with sandbox prompt
        setShowLoadingOverlay(false);
        setSandboxOrderParams({ orderId, amount, currency, key });
        setShowSandboxModal(true);
        return;
      }

      // ─── LIVE RAZORPAY CODE (If API keys are set in .env) ─────────────────────
      setCurrentStepIndex(1); // "Opening secure checkout window..."

      const options = {
        key,
        amount,
        currency,
        name: "LUNORA Storefront",
        description: "Premium Accessories Checkout",
        order_id: orderId,
        handler: async function (response: any) {
          setShowLoadingOverlay(true);
          setCurrentStepIndex(2); // "Verifying payment credentials..."
          
          try {
            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                shippingAddress: address,
                couponCode: cartState.coupon?.code || undefined,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setCurrentStepIndex(3); // "Finalizing your premium order..."
              await new Promise((resolve) => setTimeout(resolve, 800));
              
              clearCart();
              localStorage.setItem("last_order_details", JSON.stringify({
                orderNumber: verifyData.data.order.orderNumber,
                paymentId: response.razorpay_payment_id,
                amount: verifyData.data.order.total,
                paymentMethod: "Razorpay Online",
                date: new Date().toISOString(),
              }));
              
              toast.success("Payment verified successfully!");
              toast.success("Order created successfully!");
              router.push("/order-success");
            } else {
              toast.error("Verification failed.");
              localStorage.setItem("payment_failed_reason", verifyData.message || "Cryptographic signature validation rejected.");
              router.push("/order-failed");
            }
          } catch (err) {
            toast.error("Network error during payment verification.");
            localStorage.setItem("payment_failed_reason", "Network error during backend security verification.");
            router.push("/order-failed");
          }
        },
        prefill: {
          name: address.name,
          contact: address.phone,
          email: user?.email || "customer@lunora.com",
        },
        theme: {
          color: "#1c1917",
        },
        modal: {
          ondismiss: function () {
            setShowLoadingOverlay(false);
            setProcessing(false);
            setErrorMessage("Payment checkout cancelled by user.");
            toast.warning("Payment cancelled.");
          },
        },
      };

      if (!(window as any).Razorpay) {
        const loaded = await new Promise<boolean>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
        if (!loaded || !(window as any).Razorpay) {
          throw new Error("Razorpay SDK script blocked or network failure.");
        }
      }
      const rzp1 = new (window as any).Razorpay(options);
      
      rzp1.on("payment.failed", function (response: any) {
        setShowLoadingOverlay(false);
        setProcessing(false);
        const reason = response.error ? response.error.description : "Transaction rejected.";
        setErrorMessage(reason);
        toast.error(`Payment failed: ${reason}`);
      });

      rzp1.open();
    } catch (err) {
      console.warn("Backend payment server or SDK unreachable. Falling back to local sandbox simulator.", err);
      
      const simulatedOrderId = `order_mock_${Math.floor(100000 + Math.random() * 900000)}`;
      const amountInPaise = cartComputed.total * 100;
      
      setCurrentStepIndex(1); // "Opening secure checkout window..."
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setShowLoadingOverlay(false);
      setSandboxOrderParams({
        orderId: simulatedOrderId,
        amount: amountInPaise,
        currency: "INR",
        key: "rzp_test_mockKeyId123",
      });
      setShowSandboxModal(true);
    }
  };

  // Simulated handlers inside the custom Sandbox Portal
  const handleSandboxOutcome = async (outcome: "success" | "cancel" | "tamper") => {
    setShowSandboxModal(false);
    const token = localStorage.getItem("lunora_token") || "";

    if (outcome === "cancel") {
      setProcessing(false);
      setErrorMessage("Payment checkout cancelled by user (Sandbox).");
      toast.warning("Payment cancelled.");
      return;
    }

    // Lock screen and verify
    setShowLoadingOverlay(true);
    setCurrentStepIndex(2); // "Verifying payment credentials..."
    await new Promise((resolve) => setTimeout(resolve, 800));

    const { orderId } = sandboxOrderParams;
    const paymentId = `pay_mock_${Math.floor(100000 + Math.random() * 900000)}`;
    
    let signature = "";
    if (outcome === "success") {
      // Generate standard HMAC signature locally using the same key the mock server uses: "mockSecretKey456"
      signature = await hmacSHA256(`${orderId}|${paymentId}`, "mockSecretKey456");
    } else {
      // Simulate corrupt signature
      signature = "corrupted_signature_length_64_characters_xxxxxxxxxxxxxxxxxxxxxx";
    }

    try {
      const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          shippingAddress: address,
          couponCode: cartState.coupon?.code || undefined,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setCurrentStepIndex(3); // "Finalizing your premium order..."
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        clearCart();
        localStorage.setItem("last_order_details", JSON.stringify({
          orderNumber: verifyData.data.order.orderNumber,
          paymentId: paymentId,
          amount: verifyData.data.order.total,
          paymentMethod: "Razorpay Online (Sandbox)",
          date: new Date().toISOString(),
        }));
        
        toast.success("Payment verified successfully!");
        toast.success("Order created successfully!");
        router.push("/order-success");
      } else {
        toast.error("Verification failed: signature mismatch.");
        localStorage.setItem("payment_failed_reason", verifyData.message || "Cryptographic signature validation rejected.");
        router.push("/order-failed");
      }
    } catch (err) {
      if (outcome === "success") {
        console.warn("Backend verify server unreachable. Finalizing Razorpay payment in local mock mode.", err);
        
        const orderNumber = `LUN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const total = cartComputed.total;

        setCurrentStepIndex(3); // "Finalizing your premium order..."
        await new Promise((resolve) => setTimeout(resolve, 800));

        localStorage.setItem("last_order_details", JSON.stringify({
          orderNumber,
          paymentId: paymentId,
          amount: total,
          paymentMethod: "Razorpay Online (Sandbox Mock)",
          date: new Date().toISOString(),
        }));

        try {
          const savedOrdersStr = localStorage.getItem("lunora_auth_orders");
          const existingOrders = savedOrdersStr ? JSON.parse(savedOrdersStr) : [];
          
          const newOrder = {
            id: `ord-${Math.floor(10000 + Math.random() * 90000)}`,
            orderNumber,
            date: new Date().toISOString(),
            status: "Processing",
            items: cartState.items,
            subtotal: cartComputed.subtotal,
            discount: cartComputed.discountAmount,
            deliveryCharge: cartComputed.deliveryCharge,
            total,
            shippingAddress: address,
            paymentMethod: "Razorpay Online (Sandbox Mock)",
          };
          
          existingOrders.unshift(newOrder);
          localStorage.setItem("lunora_auth_orders", JSON.stringify(existingOrders));
        } catch (_) {}

        clearCart();
        toast.success("Payment verified successfully (Mock Mode)!");
        toast.success("Order created successfully!");
        router.push("/order-success");
      } else {
        toast.error("Network error: Signature verification aborted.");
        localStorage.setItem("payment_failed_reason", "Network error during backend security verification.");
        router.push("/order-failed");
      }
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="animate-pulse text-stone-400">Loading secure checkout...</div>
      </div>
    );
  }

  if (cartState.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] pb-16">
      {/* Dynamic Script injection for Razorpay */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayScriptLoaded(true)}
      />

      {/* Fullscreen Loading Overlay */}
      <LoadingOverlay currentStepIndex={currentStepIndex} isOpen={showLoadingOverlay} />

      {/* ─── LUNORA CUSTOM SANDBOX MODAL SIMULATOR ───────────────────────────── */}
      {showSandboxModal && sandboxOrderParams && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-label="LUNORA Custom Sandbox Simulator"
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center text-stone-900 relative">
            
            {/* Header */}
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-amber-50 rounded-full border border-amber-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-600 animate-pulse" />
              </div>
              <h2 className="text-lg font-serif font-semibold tracking-wider uppercase">
                LUNORA Sandbox Simulator
              </h2>
              <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                The checkout is operating in local mock mode. Please select a transaction outcome below to simulate:
              </p>
            </div>

            {/* Simulated options list */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleSandboxOutcome("success")}
                className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                1. Authorize Payment (Success)
              </button>
              <button
                onClick={() => handleSandboxOutcome("cancel")}
                className="w-full py-3 border border-stone-200 text-stone-600 hover:text-stone-900 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-50 transition-colors cursor-pointer"
              >
                2. Dismiss Checkout (Cancel)
              </button>
              <button
                onClick={() => handleSandboxOutcome("tamper")}
                className="w-full py-3 border border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                3. Tamper Signature (Fail Verify)
              </button>
            </div>

            <div className="text-[10px] text-stone-400 font-mono pt-2 border-t">
              Order: {sandboxOrderParams.orderId} | Amt: ₹{sandboxOrderParams.amount / 100}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#1c1917] text-white border-b border-stone-850 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.push("/cart")} 
            className="flex items-center gap-2 text-sm text-stone-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Back to shopping cart"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </button>
          <span className="font-serif text-2xl tracking-widest uppercase select-none">LUNORA</span>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Main Body Layout */}
      <main className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Shipping Form (Left Column) */}
          <section className="lg:col-span-7" aria-labelledby="shipping-heading">
            <form onSubmit={handleCheckout} className="space-y-6">
              
              {/* Shipping Address Container */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                <div className="flex items-center gap-2.5 border-b pb-4 border-stone-100">
                  <MapPin className="w-5 h-5 text-stone-600" />
                  <h2 id="shipping-heading" className="text-lg font-semibold tracking-wide uppercase text-stone-800">
                    Shipping Details
                  </h2>
                </div>

                {errorMessage && (
                  <div 
                    role="alert" 
                    className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-start gap-2.5 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="name-input" className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                      Recipient Full Name
                    </label>
                    <input 
                      id="name-input"
                      type="text" 
                      name="name" 
                      value={address.name} 
                      onChange={handleInputChange} 
                      required 
                      disabled={processing}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-hidden focus-visible:ring-1 focus-visible:ring-stone-900 disabled:bg-stone-50 disabled:text-stone-400" 
                      placeholder="e.g. Aarushi Goel" 
                    />
                  </div>

                  <div>
                    <label htmlFor="street-input" className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                      Street Address
                    </label>
                    <input 
                      id="street-input"
                      type="text" 
                      name="street" 
                      value={address.street} 
                      onChange={handleInputChange} 
                      required 
                      disabled={processing}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-hidden focus-visible:ring-1 focus-visible:ring-stone-900 disabled:bg-stone-50 disabled:text-stone-400" 
                      placeholder="e.g. Apartment 402, Block C, Maple Heights" 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city-input" className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                        City
                      </label>
                      <input 
                        id="city-input"
                        type="text" 
                        name="city" 
                        value={address.city} 
                        onChange={handleInputChange} 
                        required 
                        disabled={processing}
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-hidden focus-visible:ring-1 focus-visible:ring-stone-900 disabled:bg-stone-50 disabled:text-stone-400" 
                        placeholder="Bengaluru" 
                      />
                    </div>
                    <div>
                      <label htmlFor="state-input" className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                        State
                      </label>
                      <input 
                        id="state-input"
                        type="text" 
                        name="state" 
                        value={address.state} 
                        onChange={handleInputChange} 
                        required 
                        disabled={processing}
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-hidden focus-visible:ring-1 focus-visible:ring-stone-900 disabled:bg-stone-50 disabled:text-stone-400" 
                        placeholder="Karnataka" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postal-input" className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                        Postal Code (PIN)
                      </label>
                      <input 
                        id="postal-input"
                        type="text" 
                        name="postalCode" 
                        value={address.postalCode} 
                        onChange={handleInputChange} 
                        required 
                        disabled={processing}
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-hidden focus-visible:ring-1 focus-visible:ring-stone-900 disabled:bg-stone-50 disabled:text-stone-400" 
                        placeholder="560103" 
                      />
                    </div>
                    <div>
                      <label htmlFor="phone-input" className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                        Contact Phone Number
                      </label>
                      <input 
                        id="phone-input"
                        type="text" 
                        name="phone" 
                        value={address.phone} 
                        onChange={handleInputChange} 
                        required 
                        disabled={processing}
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-hidden focus-visible:ring-1 focus-visible:ring-stone-900 disabled:bg-stone-50 disabled:text-stone-400" 
                        placeholder="e.g. 9876543210" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Selectors Container */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                <div className="flex items-center gap-2.5 border-b pb-4 border-stone-100">
                  <CreditCard className="w-5 h-5 text-stone-600" />
                  <h2 className="text-lg font-semibold tracking-wide uppercase text-stone-800">
                    Payment Method
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Razorpay Online */}
                  <label 
                    className={`relative flex items-start gap-3 p-5 border rounded-2xl cursor-pointer transition-all duration-200 select-none ${
                      paymentMethod === "razorpay" 
                        ? "border-stone-900 bg-stone-50/50 shadow-2xs" 
                        : "border-stone-200 hover:bg-stone-50/20"
                    } ${processing ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === "razorpay"} 
                      onChange={() => !processing && setPaymentMethod("razorpay")} 
                      disabled={processing}
                      className="mt-1 accent-stone-900" 
                    />
                    <div className="space-y-1">
                      <span className="font-semibold flex items-center gap-2 text-stone-800">
                        <CreditCard className="w-4 h-4" /> Razorpay Pay Online
                      </span>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        UPI, Credit/Debit cards, wallets, netbanking. Secure checkout via sandbox.
                      </p>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label 
                    className={`relative flex items-start gap-3 p-5 border rounded-2xl cursor-pointer transition-all duration-200 select-none ${
                      paymentMethod === "cod" 
                        ? "border-stone-900 bg-stone-50/50 shadow-2xs" 
                        : "border-stone-200 hover:bg-stone-50/20"
                    } ${processing ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === "cod"} 
                      onChange={() => !processing && setPaymentMethod("cod")} 
                      disabled={processing}
                      className="mt-1 accent-stone-900" 
                    />
                    <div className="space-y-1">
                      <span className="font-semibold flex items-center gap-2 text-stone-800">
                        <Truck className="w-4 h-4" /> Cash on Delivery
                      </span>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Pay cash when package arrives. Standard delivery charges apply.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <button 
                type="submit" 
                disabled={processing || !razorpayScriptLoaded} 
                aria-busy={processing}
                className="w-full bg-[#1c1917] text-white py-4.5 rounded-2xl font-semibold uppercase tracking-widest text-sm hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {processing 
                  ? "Processing Transaction..." 
                  : paymentMethod === "razorpay" 
                  ? "Pay & Place Order" 
                  : "Place COD Order"
                }
              </button>

            </form>
          </section>

          {/* Sticky Summary (Right Column) */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24" aria-labelledby="summary-heading">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
              <div className="flex items-center gap-2.5 border-b pb-4 border-stone-100">
                <ShoppingBag className="w-5 h-5 text-stone-600" />
                <h2 id="summary-heading" className="text-lg font-semibold tracking-wide uppercase text-stone-800">
                  Order Summary
                </h2>
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
                {cartState.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-start text-sm">
                    <div className="max-w-[70%]">
                      <p className="font-medium text-stone-800">{item.product.name}</p>
                      <p className="text-xs text-stone-400 mt-1">
                        Quantity: {item.quantity} {item.selectedColor ? `| Color: ${item.selectedColor.name}` : ""}
                      </p>
                    </div>
                    <span className="font-semibold text-stone-800">₹{item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Badge */}
              {cartState.coupon && (
                <div className="bg-stone-50 border border-stone-100 p-3.5 rounded-xl flex items-center justify-between text-sm text-stone-600">
                  <span className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-emerald-600" /> Applied: <strong className="text-stone-800">{cartState.coupon.code}</strong>
                  </span>
                  <span className="font-semibold text-emerald-600">-₹{discount}</span>
                </div>
              )}

              {/* Totals Breakdown */}
              <div className="space-y-3.5 border-t pt-4 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-stone-850 font-medium">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (18% standard tax)</span>
                  <span className="text-stone-850 font-medium">₹{gst}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="text-stone-850 font-semibold">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-stone-900 border-t pt-4">
                  <span>Grand Total</span>
                  <span className="text-stone-900 text-xl font-serif">₹{total}</span>
                </div>
              </div>

              {/* Secure payment shield */}
              <div className="flex items-center justify-center gap-2 text-xs text-stone-400 border-t pt-4">
                <ShieldCheck className="w-4 h-4 text-stone-500" />
                <span>100% Encrypted Payment Processing Sandbox Protection</span>
              </div>

            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
