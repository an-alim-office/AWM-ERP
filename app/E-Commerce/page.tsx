"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  brand?: string;
  rating: number;
  stock: number;
  sold?: number;
  featured?: boolean;
  flashSale?: boolean;
  discount?: number;
  sku?: string;
  colors: string[];
  sizes: string[];
  tags?: string[];
};

type OrderStatus =
  | "Pending"
  | "Packaging"
  | "Processing"
  | "Shipped"
  | "Delivered";

type Coupon = {
  code: string;
  discount: number;
};

type PremiumTheme = "aurora" | "executive" | "ocean";
type UserRole = "Customer" | "Vendor" | "Admin";

const coupons: Coupon[] = [
  {
    code: "SAVE10",
    discount: 10,
  },
  {
    code: "ERP20",
    discount: 20,
  },
];

const orderSteps: OrderStatus[] = [
  "Pending",
  "Processing",
  "Packaging",
  "Shipped",
  "Delivered",
];

const staticColors = ["Black", "White", "Blue", "Red"];
const staticSizes = ["S", "M", "L", "XL"];

const safeParseProducts = (value: string | null): Product[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

export default function EcommercePage() {
  // =========================================
  // STATES
  // =========================================

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [compare, setCompare] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState("");

  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [selectedPayment, setSelectedPayment] = useState("bKash");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("Pending");

  const [couponInput, setCouponInput] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [darkMode, setDarkMode] = useState(false);
  const [premiumTheme, setPremiumTheme] = useState<PremiumTheme>("aurora");
  const [userRole, setUserRole] = useState<UserRole>("Customer");

  const [shippingCharge, setShippingCharge] = useState(120);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // =========================================
  // PREMIUM VP THEME CONFIG
  // =========================================

  const themeConfig = useMemo(() => {
    const themes: Record<
      PremiumTheme,
      {
        hero: string;
        accent: string;
        badge: string;
        button: string;
      }
    > = {
      aurora: {
        hero: "from-indigo-700 via-purple-700 to-fuchsia-700",
        accent: "text-indigo-600",
        badge: "bg-indigo-100 text-indigo-700",
        button: "bg-indigo-600 hover:bg-indigo-700",
      },
      executive: {
        hero: "from-slate-950 via-slate-800 to-zinc-900",
        accent: "text-amber-600",
        badge: "bg-amber-100 text-amber-700",
        button: "bg-amber-500 hover:bg-amber-600 text-black",
      },
      ocean: {
        hero: "from-cyan-700 via-blue-700 to-emerald-700",
        accent: "text-cyan-600",
        badge: "bg-cyan-100 text-cyan-700",
        button: "bg-cyan-600 hover:bg-cyan-700",
      },
    };

    return themes[premiumTheme];
  }, [premiumTheme]);

  const cardClass = darkMode
    ? "bg-gray-900 border-gray-800 text-white"
    : "bg-white border-gray-100 text-black";

  const softCardClass = darkMode
    ? "bg-gray-950/80 border-gray-800 text-white"
    : "bg-white/90 border-gray-100 text-black";

  const inputClass =
    "w-full border border-gray-200 bg-white text-black px-4 py-3 rounded-xl outline-none focus:ring-4 focus:ring-indigo-200 transition-all";

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-BD", {
        maximumFractionDigits: 0,
      }),
    []
  );

  const formatCurrency = useCallback(
    (value: number) => `৳ ${currencyFormatter.format(Math.max(0, value || 0))}`,
    [currencyFormatter]
  );

  // =========================================
  // NOTIFICATION
  // =========================================

  const showMessage = useCallback((msg: string) => {
    setNotification(msg);

    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }

    notificationTimerRef.current = setTimeout(() => {
      setNotification("");
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  // =========================================
  // FETCH PRODUCTS
  // =========================================

  const fetchProducts = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);

        const res = await fetch("/api/e-commerce", {
          signal,
          cache: "no-store",
        });

        const data = await res.json();

        setProducts(Array.isArray(data?.products) ? data.products : []);
      } catch (error) {
        if ((error as Error)?.name !== "AbortError") {
          console.error(error);
          showMessage("Failed To Load");
        }
      } finally {
        setLoading(false);
      }
    },
    [showMessage]
  );

  // =========================================
  // LOAD LOCAL STORAGE
  // =========================================

  useEffect(() => {
    const controller = new AbortController();

    fetchProducts(controller.signal);

    const savedCart = localStorage.getItem("erp-cart");
    const savedWishlist = localStorage.getItem("erp-wishlist");
    const savedCompare = localStorage.getItem("erp-compare");
    const savedDark = localStorage.getItem("erp-dark-mode");
    const savedTheme = localStorage.getItem("erp-vp-theme") as PremiumTheme;
    const savedRole = localStorage.getItem("erp-user-role") as UserRole;

    setCart(safeParseProducts(savedCart));
    setWishlist(safeParseProducts(savedWishlist));
    setCompare(safeParseProducts(savedCompare));

    if (savedDark === "true") {
      setDarkMode(true);
    }

    if (["aurora", "executive", "ocean"].includes(savedTheme)) {
      setPremiumTheme(savedTheme);
    }

    if (["Customer", "Vendor", "Admin"].includes(savedRole)) {
      setUserRole(savedRole);
    }

    return () => controller.abort();
  }, [fetchProducts]);

  useEffect(() => {
    localStorage.setItem("erp-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("erp-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("erp-compare", JSON.stringify(compare));
  }, [compare]);

  useEffect(() => {
    localStorage.setItem("erp-dark-mode", darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("erp-vp-theme", premiumTheme);
  }, [premiumTheme]);

  useEffect(() => {
    localStorage.setItem("erp-user-role", userRole);
  }, [userRole]);

  // =========================================
  // CATEGORY + DYNAMIC OPTIONS
  // =========================================

  const categories = useMemo(() => {
    return ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  const colors = useMemo(() => {
    return [
      ...new Set([
        ...staticColors,
        ...products.flatMap((p) => p.colors || []).filter(Boolean),
      ]),
    ];
  }, [products]);

  const sizes = useMemo(() => {
    return [
      ...new Set([
        ...staticSizes,
        ...products.flatMap((p) => p.sizes || []).filter(Boolean),
      ]),
    ];
  }, [products]);

  // =========================================
  // CART
  // =========================================

  const addToCart = useCallback(
    (product: Product) => {
      const exists = cart.find((p) => p.id === product.id);

      if (exists) {
        showMessage("Already Added To Cart");
        return;
      }

      setCart((prev) => [...prev, product]);
      showMessage(`${product.name} Added,`);
    },
    [cart, showMessage]
  );

  const removeFromCart = useCallback(
    (id: number) => {
      setCart((prev) => prev.filter((p) => p.id !== id));
      showMessage("Removed From Cart");
    },
    [showMessage]
  );

  // =========================================
  // WISHLIST
  // =========================================

  const addToWishlist = useCallback(
    (product: Product) => {
      const exists = wishlist.find((p) => p.id === product.id);

      if (exists) {
        showMessage("Already In Wishlist");
        return;
      }

      setWishlist((prev) => [...prev, product]);
      showMessage("Added To Wishlist");
    },
    [wishlist, showMessage]
  );

  const removeWishlist = useCallback(
    (id: number) => {
      setWishlist((prev) => prev.filter((p) => p.id !== id));
      showMessage("Wishlist Updated");
    },
    [showMessage]
  );

  // =========================================
  // COMPARE
  // =========================================

  const addToCompare = useCallback(
    (product: Product) => {
      const exists = compare.find((p) => p.id === product.id);

      if (exists) {
        showMessage("Already In Compare");
        return;
      }

      if (compare.length >= 3) {
        showMessage("Maximum 3 Products");
        return;
      }

      setCompare((prev) => [...prev, product]);
      showMessage("Added To Compare");
    },
    [compare, showMessage]
  );

  const removeCompare = useCallback(
    (id: number) => {
      setCompare((prev) => prev.filter((p) => p.id !== id));
      showMessage("Compare Updated");
    },
    [showMessage]
  );

  // =========================================
  // FILTER PRODUCTS
  // =========================================

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    const query = search.trim().toLowerCase();

    if (query) {
      filtered = filtered.filter((p) => {
        const searchableText = [
          p.name,
          p.category,
          p.brand,
          p.sku,
          ...(p.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (selectedColor) {
      filtered = filtered.filter((p) => p.colors?.includes(selectedColor));
    }

    if (selectedSize) {
      filtered = filtered.filter((p) => p.sizes?.includes(selectedSize));
    }

    if (sortBy === "low-high") {
      filtered.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "high-low") {
      filtered.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [products, search, selectedCategory, sortBy, selectedColor, selectedSize]);

  // =========================================
  // PRICE
  // =========================================

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price, 0),
    [cart]
  );

  const vat = useMemo(() => subtotal * 0.05, [subtotal]);

  const discountAmount = useMemo(
    () => (subtotal * couponDiscount) / 100,
    [subtotal, couponDiscount]
  );

  const grandTotal = useMemo(
    () => subtotal + shippingCharge + vat - discountAmount,
    [subtotal, shippingCharge, vat, discountAmount]
  );

  // =========================================
  // SMART ANALYTICS
  // =========================================

  const analytics = useMemo(() => {
    const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const totalSold = products.reduce((acc, p) => acc + (p.sold || 0), 0);
    const avgRating =
      products.length > 0
        ? products.reduce((acc, p) => acc + (p.rating || 0), 0) /
          products.length
        : 0;
    const potentialRevenue = products.reduce(
      (acc, p) => acc + (p.price || 0) * (p.stock || 0),
      0
    );

    return {
      totalProducts: products.length,
      totalStock,
      totalSold,
      avgRating,
      potentialRevenue,
      lowStock: products.filter((p) => p.stock <= 5).length,
      flashSale: products.filter((p) => p.flashSale).length,
      featured: products.filter((p) => p.featured).length,
    };
  }, [products]);

  // =========================================
  // COUPON
  // =========================================

  const applyCoupon = useCallback(() => {
    const found = coupons.find((c) => c.code === couponInput.toUpperCase());

    if (!found) {
      showMessage("Invalid Coupon");
      return;
    }

    setCouponDiscount(found.discount);
    showMessage(`${found.discount}% Discount Applied`);
  }, [couponInput, showMessage]);

  // =========================================
  // ORDER
  // =========================================

  const placeOrder = async () => {
    if (cart.length === 0) {
      showMessage("Cart Is Empty");
      return;
    }

    if (!customerName || !customerPhone || !customerAddress) {
      showMessage("Fill Customer Information");
      return;
    }

    try {
      const response = await fetch("/api/e-commerce", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          customerName,
          customerPhone,
          customerAddress,
          products: cart,
          paymentMethod: selectedPayment,
          total: grandTotal,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage("Order Placed Successfully");

        setCart([]);
        setOrderStatus("Processing");

        setTimeout(() => {
          setOrderStatus("Packaging");
        }, 2000);

        setTimeout(() => {
          setOrderStatus("Shipped");
        }, 4000);

        setTimeout(() => {
          setOrderStatus("Delivered");
        }, 7000);
      } else {
        showMessage("Order Failed");
      }
    } catch (error) {
      console.error(error);
      showMessage("Order Failed");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSortBy("default");
    setSelectedColor("");
    setSelectedSize("");
    showMessage("Filters Reset");
  };

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-black text-white"
          : "bg-gradient-to-b from-slate-100 via-white to-slate-100 text-black"
      }`}
    >
      {/* NOTIFICATION */}

      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 z-[9999] bg-black text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 animate-pulse"
        >
          {notification}
        </div>
      )}

      {/* HEADER */}

      <header className="sticky top-0 z-50 bg-black/95 text-white shadow-2xl border-b border-gray-800 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
              Advanced ERP Commerce
            </h1>

            <p className="text-gray-400">
              AI Powered Enterprise Solution · Role:{" "}
              <span className="text-white font-bold">{userRole}</span>
            </p>
          </div>

          <div className="flex-1 max-w-2xl w-full">
            <input
              type="text"
              placeholder="Search Product, SKU, Brand, Tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl text-black outline-none focus:ring-4 focus:ring-indigo-400 transition-all"
            />
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <select
              value={premiumTheme}
              onChange={(e) => setPremiumTheme(e.target.value as PremiumTheme)}
              className="bg-gray-900 border border-gray-700 px-4 py-3 rounded-xl text-white"
              aria-label="Premium VP Theme"
            >
              <option value="aurora">VP Aurora</option>
              <option value="executive">VP Executive</option>
              <option value="ocean">VP Ocean</option>
            </select>

            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-gray-900 border border-gray-700 px-4 py-3 rounded-xl text-white"
              aria-label="User Role"
            >
              <option value="Customer">Customer</option>
              <option value="Vendor">Vendor</option>
              <option value="Admin">Admin</option>
            </select>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-xl font-bold transition-all"
            >
              {darkMode ? "Light" : "Dark"}
            </button>

            <button
              onClick={() => setShowCompare(!showCompare)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-xl font-bold transition-all"
            >
              Compare ({compare.length})
            </button>

            <button
              onClick={() => setShowWishlist(!showWishlist)}
              className="bg-pink-500 hover:bg-pink-600 px-5 py-3 rounded-xl font-bold transition-all"
            >
              Wishlist ({wishlist.length})
            </button>

            <button
              onClick={() => setShowCart(!showCart)}
              className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-bold transition-all"
            >
              Cart ({cart.length})
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}

      <section
        className={`bg-gradient-to-r ${themeConfig.hero} text-white py-24 overflow-hidden relative`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_30%)]" />

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 backdrop-blur px-5 py-2 rounded-full mb-8 font-bold">
            ⚡ 2026 AI ERP Core Standard Ready
          </div>

          <h2 className="text-5xl lg:text-7xl font-black leading-tight">
            বাংলাদেশের Enterprise E-Commerce Platform
          </h2>

          <p className="mt-8 text-xl max-w-4xl mx-auto text-gray-200">
            Multi Vendor, AI Recommendation, Courier API, Payment Gateway,
            Inventory, Analytics, POS, ERP, CRM, SMS, Live Tracking সহ Full
            Business Solution।
          </p>

          <div className="flex justify-center gap-5 mt-10 flex-wrap">
            <button
              onClick={scrollToProducts}
              className="bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105"
            >
              Start Shopping
            </button>

            <button
              onClick={() => showMessage("Vendor Dashboard Module Ready")}
              className="border border-white hover:bg-white hover:text-black px-8 py-4 rounded-2xl font-bold transition-all"
            >
              Vendor Dashboard
            </button>

            <button
              onClick={() => showMessage("Live Analytics Synced")}
              className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-4 rounded-2xl font-bold transition-all"
            >
              Live Analytics
            </button>
          </div>
        </div>
      </section>

      {/* SMART DASHBOARD */}

      <section className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
        <div
          className={`grid md:grid-cols-2 xl:grid-cols-4 gap-5 rounded-3xl p-5 shadow-2xl border backdrop-blur ${softCardClass}`}
        >
          {[
            {
              label: "Total Products",
              value: analytics.totalProducts,
              icon: "📦",
            },
            {
              label: "Total Stock",
              value: analytics.totalStock,
              icon: "🏬",
            },
            {
              label: "AI Avg Rating",
              value: analytics.avgRating.toFixed(1),
              icon: "🤖",
            },
            {
              label: "Potential Revenue",
              value: formatCurrency(analytics.potentialRevenue),
              icon: "💰",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-3xl p-6 border shadow-sm transition-all hover:-translate-y-1 ${cardClass}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-gray-500 font-bold">{item.label}</p>
                  <h3 className="text-3xl font-black mt-2">{item.value}</h3>
                </div>

                <div className="text-5xl">{item.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}

      <section className="max-w-7xl mx-auto py-20 px-4">
        <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
          <div>
            <h2 className="text-4xl lg:text-5xl font-black">
              700+ Enterprise Features
            </h2>
            <p className="text-gray-500 mt-3">
              Security, Automation, ERP, CRM, POS, Analytics & AI Ready Modules
            </p>
          </div>

          <div className={`${themeConfig.badge} px-5 py-2 rounded-full font-bold`}>
            AI Powered
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            "OTP Login",
            "Google Login",
            "Facebook Login",
            "Inventory",
            "POS System",
            "ERP Dashboard",
            "Courier API",
            "Fraud Detection",
            "Vendor Dashboard",
            "AI Search",
            "AI Analytics",
            "Warehouse",
            "HRM",
            "Accounting",
            "Invoice",
            "SSL Security",
          ].map((item, index) => (
            <div
              key={index}
              className={`rounded-3xl p-8 shadow-xl border transition-all hover:-translate-y-2 hover:shadow-2xl ${cardClass}`}
            >
              <div className="text-5xl mb-5">🚀</div>

              <h3 className="text-2xl font-bold">{item}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* ENTERPRISE INSIGHTS */}

      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className={`rounded-3xl p-8 border shadow-xl ${cardClass}`}>
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-black mb-3">
                AI ERP Control Center
              </h2>
              <p className="text-gray-500">
                Real-time commerce signal, stock intelligence, sales alert and
                role-aware operational overview.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-red-50 text-red-700 p-5">
                <p className="font-bold">Low Stock Alert</p>
                <h3 className="text-3xl font-black">{analytics.lowStock}</h3>
              </div>

              <div className="rounded-2xl bg-yellow-50 text-yellow-700 p-5">
                <p className="font-bold">Flash Sale</p>
                <h3 className="text-3xl font-black">{analytics.flashSale}</h3>
              </div>

              <div className="rounded-2xl bg-green-50 text-green-700 p-5">
                <p className="font-bold">Sold Units</p>
                <h3 className="text-3xl font-black">{analytics.totalSold}</h3>
              </div>

              <div className="rounded-2xl bg-indigo-50 text-indigo-700 p-5">
                <p className="font-bold">Featured</p>
                <h3 className="text-3xl font-black">{analytics.featured}</h3>
              </div>
            </div>

            <div
              className={`rounded-3xl p-6 border ${
                darkMode ? "bg-black border-gray-800" : "bg-slate-50 border-gray-100"
              }`}
            >
              <p className="font-bold mb-3">Smart Automation Status</p>

              {[
                "Payment Gateway Monitoring",
                "Inventory Risk Scan",
                "Fraud Detection Layer",
                "AI Search Optimization",
              ].map((item) => (
                <div key={item} className="flex items-center justify-between py-2">
                  <span className="text-gray-500">{item}</span>
                  <span className="text-green-500 font-black">Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FILTER */}

      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className={`rounded-3xl p-6 shadow-xl border ${cardClass}`}>
          <div className="grid md:grid-cols-2 xl:grid-cols-6 gap-5">
            <select
              className="border p-4 rounded-xl text-black"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>

            <select
              className="border p-4 rounded-xl text-black"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort Products</option>
              <option value="low-high">Price Low → High</option>
              <option value="high-low">Price High → Low</option>
              <option value="rating">Top Rated</option>
            </select>

            <select
              className="border p-4 rounded-xl text-black"
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
            >
              <option>bKash</option>
              <option>Nagad</option>
              <option>Rocket</option>
              <option>Card</option>
              <option>COD</option>
            </select>

            <select
              className="border p-4 rounded-xl text-black"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              <option value="">All Colors</option>
              {colors.map((color) => (
                <option key={color}>{color}</option>
              ))}
            </select>

            <select
              className="border p-4 rounded-xl text-black"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="">All Sizes</option>
              {sizes.map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="bg-slate-900 hover:bg-black text-white p-4 rounded-xl font-bold transition-all"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}

      <section id="products" className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex justify-between items-center mb-10 flex-wrap gap-5">
          <div>
            <h2 className="text-4xl lg:text-5xl font-black">
              Trending Products
            </h2>
            <p className="text-gray-500 mt-2">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-5 py-3 rounded-xl font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              Grid
            </button>

            <button
              onClick={() => setViewMode("list")}
              className={`px-5 py-3 rounded-xl font-bold transition-all ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              List
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24 text-4xl font-black">
            Loading Products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={`text-center py-24 rounded-3xl border ${cardClass}`}>
            <div className="text-6xl mb-4">🔎</div>
            <h3 className="text-3xl font-black">No Products Found</h3>
            <p className="text-gray-500 mt-2">
              Try changing search, category, color, size or sorting options.
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-8 ${
              viewMode === "grid" ? "md:grid-cols-2 xl:grid-cols-4" : "grid-cols-1"
            }`}
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`rounded-3xl overflow-hidden shadow-2xl border transition-all hover:scale-[1.01] hover:shadow-indigo-500/10 ${
                  viewMode === "list" ? "lg:grid lg:grid-cols-[320px_1fr]" : ""
                } ${cardClass}`}
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full object-cover ${
                      viewMode === "list" ? "h-full min-h-72" : "h-72"
                    }`}
                    loading="lazy"
                  />

                  {product.featured && (
                    <div className="absolute top-4 left-4 bg-yellow-400 text-black px-4 py-1 rounded-full font-bold">
                      Featured
                    </div>
                  )}

                  {product.flashSale && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-1 rounded-full font-bold">
                      Flash Sale
                    </div>
                  )}

                  {product.discount ? (
                    <div className="absolute bottom-4 left-4 bg-green-600 text-white px-4 py-1 rounded-full font-bold">
                      {product.discount}% OFF
                    </div>
                  ) : null}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black mb-2">
                        {product.name}
                      </h3>

                      <p className="text-gray-500 mb-2">
                        {product.category}
                        {product.brand ? ` · ${product.brand}` : ""}
                      </p>
                    </div>

                    {product.sku && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        {product.sku}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between mb-3">
                    <p className="text-yellow-500 font-bold">
                      ⭐ {product.rating}
                    </p>

                    <p className={product.stock <= 5 ? "text-red-500 font-bold" : ""}>
                      Stock: {product.stock}
                    </p>
                  </div>

                  <p className="text-4xl font-black text-green-600 mb-4">
                    {formatCurrency(product.price)}
                  </p>

                  <div className="mb-4">
                    <p className="font-bold mb-2">Colors</p>

                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color, i) => (
                        <span
                          key={i}
                          className="bg-gray-200 text-black px-3 py-1 rounded-full text-sm"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="font-bold mb-2">Sizes</p>

                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size, i) => (
                        <span
                          key={i}
                          className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-bold transition-all"
                    >
                      Add Cart
                    </button>

                    <button
                      onClick={() => addToWishlist(product)}
                      className="bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-bold transition-all"
                    >
                      Wishlist
                    </button>

                    <button
                      onClick={() => addToCompare(product)}
                      className="bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold transition-all"
                    >
                      Compare
                    </button>

                    <button
                      onClick={() => setQuickView(product)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all"
                    >
                      Quick View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CART DRAWER */}

      {showCart && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm">
          <aside
            className={`absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto p-6 shadow-2xl ${cardClass}`}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-black">Smart Cart</h2>
                <p className="text-gray-500">Checkout, coupon, VAT & shipping</p>
              </div>

              <button
                onClick={() => setShowCart(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {cart.length === 0 ? (
                <div className="text-center py-16 rounded-3xl bg-gray-100 text-black">
                  <div className="text-5xl mb-3">🛒</div>
                  <p className="font-bold">Cart Is Empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 items-center border border-gray-200 rounded-2xl p-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />

                    <div className="flex-1">
                      <h3 className="font-black">{item.name}</h3>
                      <p className="text-green-600 font-bold">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-500 text-white px-3 py-2 rounded-xl font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="grid gap-4 mb-6">
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                className={inputClass}
              />

              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Customer Phone"
                className={inputClass}
              />

              <textarea
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Customer Address"
                className={`${inputClass} min-h-28`}
              />

              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className={inputClass}
              >
                <option>bKash</option>
                <option>Nagad</option>
                <option>Rocket</option>
                <option>Card</option>
                <option>COD</option>
              </select>

              <select
                value={shippingCharge}
                onChange={(e) => setShippingCharge(Number(e.target.value))}
                className={inputClass}
              >
                <option value={120}>Inside Dhaka - ৳120</option>
                <option value={180}>Outside Dhaka - ৳180</option>
                <option value={250}>Express Delivery - ৳250</option>
              </select>

              <div className="flex gap-3">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon Code"
                  className={inputClass}
                />

                <button
                  onClick={applyCoupon}
                  className={`${themeConfig.button} text-white px-5 py-3 rounded-xl font-bold whitespace-nowrap`}
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-gray-100 text-black p-5 space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <b>{formatCurrency(subtotal)}</b>
              </div>

              <div className="flex justify-between">
                <span>VAT 5%</span>
                <b>{formatCurrency(vat)}</b>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <b>{formatCurrency(shippingCharge)}</b>
              </div>

              <div className="flex justify-between">
                <span>Discount</span>
                <b>- {formatCurrency(discountAmount)}</b>
              </div>

              <div className="border-t pt-3 flex justify-between text-2xl font-black">
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-black mb-3">Order Tracking</p>
              <div className="grid grid-cols-5 gap-2">
                {orderSteps.map((step) => {
                  const active =
                    orderSteps.indexOf(step) <= orderSteps.indexOf(orderStatus);

                  return (
                    <div
                      key={step}
                      className={`text-center text-xs p-2 rounded-xl font-bold ${
                        active
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={placeOrder}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black text-lg transition-all"
            >
              Place Order
            </button>
          </aside>
        </div>
      )}

      {/* WISHLIST DRAWER */}

      {showWishlist && (
        <div className="fixed inset-0 z-[75] bg-black/50 backdrop-blur-sm">
          <aside
            className={`absolute left-0 top-0 h-full w-full max-w-lg overflow-y-auto p-6 shadow-2xl ${cardClass}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black">Wishlist</h2>

              <button
                onClick={() => setShowWishlist(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              {wishlist.length === 0 ? (
                <div className="text-center py-16 rounded-3xl bg-gray-100 text-black">
                  <div className="text-5xl mb-3">💖</div>
                  <p className="font-bold">Wishlist Is Empty</p>
                </div>
              ) : (
                wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 items-center border border-gray-200 rounded-2xl p-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />

                    <div className="flex-1">
                      <h3 className="font-black">{item.name}</h3>
                      <p className="text-green-600 font-bold">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-green-600 text-white px-3 py-2 rounded-xl font-bold"
                      >
                        Cart
                      </button>

                      <button
                        onClick={() => removeWishlist(item.id)}
                        className="bg-red-500 text-white px-3 py-2 rounded-xl font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      {/* COMPARE MODAL */}

      {showCompare && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`max-w-6xl mx-auto mt-10 rounded-3xl p-6 shadow-2xl ${cardClass}`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-black">Product Compare</h2>
                <p className="text-gray-500">Maximum 3 products supported</p>
              </div>

              <button
                onClick={() => setShowCompare(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold"
              >
                Close
              </button>
            </div>

            {compare.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-gray-100 text-black">
                <div className="text-5xl mb-3">⚖️</div>
                <p className="font-bold">No Product Added For Compare</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-5">
                {compare.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-gray-200 p-5"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-2xl mb-4"
                    />

                    <h3 className="text-2xl font-black">{item.name}</h3>
                    <p className="text-gray-500">{item.category}</p>

                    <div className="mt-4 space-y-2">
                      <p>
                        <b>Price:</b> {formatCurrency(item.price)}
                      </p>
                      <p>
                        <b>Rating:</b> ⭐ {item.rating}
                      </p>
                      <p>
                        <b>Stock:</b> {item.stock}
                      </p>
                      <p>
                        <b>Colors:</b> {item.colors.join(", ")}
                      </p>
                      <p>
                        <b>Sizes:</b> {item.sizes.join(", ")}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-green-600 text-white py-3 rounded-xl font-bold"
                      >
                        Cart
                      </button>

                      <button
                        onClick={() => removeCompare(item.id)}
                        className="bg-red-500 text-white py-3 rounded-xl font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUICK VIEW MODAL */}

      {quickView && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`max-w-5xl mx-auto mt-10 rounded-3xl overflow-hidden shadow-2xl ${cardClass}`}>
            <div className="grid lg:grid-cols-2">
              <img
                src={quickView.image}
                alt={quickView.name}
                className="w-full h-full min-h-96 object-cover"
              />

              <div className="p-8">
                <div className="flex justify-between items-start gap-4 mb-5">
                  <div>
                    <h2 className="text-4xl font-black">{quickView.name}</h2>
                    <p className="text-gray-500 mt-2">
                      {quickView.category}
                      {quickView.brand ? ` · ${quickView.brand}` : ""}
                    </p>
                  </div>

                  <button
                    onClick={() => setQuickView(null)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold"
                  >
                    Close
                  </button>
                </div>

                <p className="text-5xl font-black text-green-600 mb-5">
                  {formatCurrency(quickView.price)}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="rounded-2xl bg-yellow-50 text-yellow-700 p-4">
                    <p className="font-bold">Rating</p>
                    <h3 className="text-2xl font-black">⭐ {quickView.rating}</h3>
                  </div>

                  <div className="rounded-2xl bg-green-50 text-green-700 p-4">
                    <p className="font-bold">Stock</p>
                    <h3 className="text-2xl font-black">{quickView.stock}</h3>
                  </div>
                </div>

                <div className="mb-5">
                  <p className="font-black mb-2">Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {quickView.colors.map((color) => (
                      <span
                        key={color}
                        className="bg-gray-200 text-black px-3 py-1 rounded-full"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <p className="font-black mb-2">Sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {quickView.sizes.map((size) => (
                      <span
                        key={size}
                        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => addToCart(quickView)}
                    className="bg-black text-white py-4 rounded-2xl font-black"
                  >
                    Add Cart
                  </button>

                  <button
                    onClick={() => addToWishlist(quickView)}
                    className="bg-pink-500 text-white py-4 rounded-2xl font-black"
                  >
                    Wishlist
                  </button>

                  <button
                    onClick={() => addToCompare(quickView)}
                    className="bg-yellow-500 text-black py-4 rounded-2xl font-black"
                  >
                    Compare
                  </button>

                  <button
                    onClick={() => {
                      addToCart(quickView);
                      setShowCart(true);
                    }}
                    className={`${themeConfig.button} text-white py-4 rounded-2xl font-black`}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}

      <footer className="bg-black text-white border-t border-gray-800 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row justify-between gap-5">
          <div>
            <h3 className="text-2xl font-black">Advanced ERP Commerce</h3>
            <p className="text-gray-400 mt-2">
              Production-ready AI ERP Core Commerce Experience.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              "AI Ready",
              "Responsive",
              "Secure",
              "ERP Compatible",
              "Future Scalable",
            ].map((item) => (
              <span
                key={item}
                className="bg-white/10 border border-white/10 px-4 py-2 rounded-full text-sm font-bold"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}