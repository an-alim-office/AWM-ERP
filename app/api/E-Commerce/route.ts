// app/api/e-commerce/route.ts

import { NextResponse } from "next/server";

// ==========================================
// TYPES
// ==========================================

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  stock: number;
  sold: number;
  featured: boolean;
  flashSale: boolean;
  discount: number;
  sku: string;
  colors: string[];
  sizes: string[];
  tags: string[];
};

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  total: number;
  products: Product[];
  status: string;
  createdAt: string;
};

// ==========================================
// DEMO PRODUCTS DATABASE
// ==========================================

const products: Product[] = [
  {
    id: 1,
    name: "Premium Hoodie",
    price: 2200,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200",
    category: "Fashion",
    brand: "Nike",
    rating: 4.8,
    stock: 40,
    sold: 210,
    featured: true,
    flashSale: true,
    discount: 10,
    sku: "SKU-HOODIE-001",
    colors: ["Black", "White", "Blue"],
    sizes: ["M", "L", "XL"],
    tags: ["hoodie", "winter", "fashion"],
  },

  {
    id: 2,
    name: "Gaming Headphone",
    price: 4500,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200",
    category: "Electronics",
    brand: "Razer",
    rating: 4.9,
    stock: 25,
    sold: 150,
    featured: true,
    flashSale: false,
    discount: 5,
    sku: "SKU-HEADPHONE-002",
    colors: ["Black", "Red"],
    sizes: ["Standard"],
    tags: ["gaming", "headphone"],
  },

  {
    id: 3,
    name: "Smart Watch",
    price: 7800,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200",
    category: "Gadgets",
    brand: "Apple",
    rating: 4.7,
    stock: 15,
    sold: 95,
    featured: false,
    flashSale: true,
    discount: 12,
    sku: "SKU-WATCH-003",
    colors: ["Silver", "Black"],
    sizes: ["42mm", "44mm"],
    tags: ["watch", "smart"],
  },

  {
    id: 4,
    name: "Sneakers",
    price: 3200,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200",
    category: "Shoes",
    brand: "Adidas",
    rating: 4.6,
    stock: 30,
    sold: 180,
    featured: true,
    flashSale: false,
    discount: 8,
    sku: "SKU-SHOE-004",
    colors: ["White", "Green"],
    sizes: ["40", "41", "42", "43"],
    tags: ["shoe", "sneakers"],
  },

  {
    id: 5,
    name: "Office Laptop",
    price: 65000,
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200",
    category: "Computers",
    brand: "Dell",
    rating: 4.9,
    stock: 12,
    sold: 70,
    featured: true,
    flashSale: false,
    discount: 15,
    sku: "SKU-LAPTOP-005",
    colors: ["Gray"],
    sizes: ["15 Inch"],
    tags: ["laptop", "office"],
  },

  {
    id: 6,
    name: "Bluetooth Speaker",
    price: 2900,
    image:
      "https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=1200",
    category: "Audio",
    brand: "JBL",
    rating: 4.5,
    stock: 22,
    sold: 130,
    featured: false,
    flashSale: true,
    discount: 20,
    sku: "SKU-SPEAKER-006",
    colors: ["Black", "Blue"],
    sizes: ["Portable"],
    tags: ["speaker", "bluetooth"],
  },
];

// ==========================================
// ORDERS TEMP DATABASE
// ==========================================

const orders: Order[] = [];

// ==========================================
// HELPERS
// ==========================================

const generateOrderId = () => {
  return `ORD-${Date.now()}`;
};

// ==========================================
// GET PRODUCTS
// ==========================================

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const category =
      searchParams.get("category");

    const search =
      searchParams.get("search");

    const featured =
      searchParams.get("featured");

    const flashSale =
      searchParams.get("flashSale");

    let filteredProducts = [...products];

    // SEARCH FILTER

    if (search) {
      filteredProducts =
        filteredProducts.filter((p) =>
          p.name
            .toLowerCase()
            .includes(search.toLowerCase())
        );
    }

    // CATEGORY FILTER

    if (
      category &&
      category !== "All"
    ) {
      filteredProducts =
        filteredProducts.filter(
          (p) =>
            p.category === category
        );
    }

    // FEATURED FILTER

    if (featured === "true") {
      filteredProducts =
        filteredProducts.filter(
          (p) => p.featured
        );
    }

    // FLASH SALE FILTER

    if (flashSale === "true") {
      filteredProducts =
        filteredProducts.filter(
          (p) => p.flashSale
        );
    }

    // RESPONSE

    return NextResponse.json({
      success: true,
      message:
        "Products Loaded Successfully",

      totalProducts:
        filteredProducts.length,

      products: filteredProducts,

      analytics: {
        totalSales: 2500000,
        totalOrders: 1540,
        activeCustomers: 1200,
        totalVendors: 80,
      },

      banners: [
        {
          id: 1,
          title:
            "Mega Fashion Sale",
        },

        {
          id: 2,
          title:
            "Electronics Offer",
        },
      ],

      paymentMethods: [
        "bKash",
        "Nagad",
        "Rocket",
        "Card",
        "COD",
      ],

      courierPartners: [
        "Pathao",
        "RedX",
        "Paperfly",
        "SteadFast",
      ],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed To Load Products",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// PLACE ORDER
// ==========================================

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    // VALIDATION

    if (
      !body.customerName ||
      !body.customerPhone ||
      !body.customerAddress
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer Information Missing",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body.products ||
      body.products.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No Products Selected",
        },
        {
          status: 400,
        }
      );
    }

    // CREATE ORDER

    const newOrder: Order = {
      id: generateOrderId(),

      customerName:
        body.customerName,

      customerPhone:
        body.customerPhone,

      customerAddress:
        body.customerAddress,

      paymentMethod:
        body.paymentMethod,

      total: body.total,

      products: body.products,

      status: "Pending",

      createdAt:
        new Date().toISOString(),
    };

    orders.push(newOrder);

    // RESPONSE

    return NextResponse.json({
      success: true,

      message:
        "Order Placed Successfully",

      order: newOrder,

      tracking: [
        {
          step: "Pending",
          completed: true,
        },

        {
          step: "Processing",
          completed: false,
        },

        {
          step: "Packaging",
          completed: false,
        },

        {
          step: "Shipped",
          completed: false,
        },

        {
          step: "Delivered",
          completed: false,
        },
      ],

      invoice: {
        invoiceNo: `INV-${Date.now()}`,
        subtotal: body.total,
        vat: body.total * 0.05,
        shipping: 120,
      },

      smsNotification:
        "Customer SMS Sent",

      emailNotification:
        "Email Sent",

      fraudCheck: "Passed",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Order Failed",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// UPDATE ORDER STATUS
// ==========================================

export async function PUT(
  req: Request
) {
  try {
    const body = await req.json();

    const order = orders.find(
      (o) => o.id === body.id
    );

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order Not Found",
        },
        {
          status: 404,
        }
      );
    }

    order.status = body.status;

    return NextResponse.json({
      success: true,

      message:
        "Order Updated Successfully",

      order,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Update Failed",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// DELETE ORDER
// ==========================================

export async function DELETE(
  req: Request
) {
  try {
    const body = await req.json();

    const orderIndex =
      orders.findIndex(
        (o) => o.id === body.id
      );

    if (orderIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order Not Found",
        },
        {
          status: 404,
        }
      );
    }

    orders.splice(orderIndex, 1);

    return NextResponse.json({
      success: true,

      message:
        "Order Deleted Successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Delete Failed",
      },
      {
        status: 500,
      }
    );
  }
}