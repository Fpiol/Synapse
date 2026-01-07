import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-e9343d87/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== PRODUCTS API =====

// Get all products
app.get("/make-server-e9343d87/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    return c.json(products || []);
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

// Get single product
app.get("/make-server-e9343d87/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await kv.get(`product:${id}`);
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }
    return c.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return c.json({ error: "Failed to fetch product" }, 500);
  }
});

// Create product
app.post("/make-server-e9343d87/products", async (c) => {
  try {
    const body = await c.req.json();
    const id = Date.now().toString();
    const product = {
      id,
      ...body,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`product:${id}`, product);
    return c.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return c.json({ error: "Failed to create product" }, 500);
  }
});

// Update product
app.put("/make-server-e9343d87/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`product:${id}`);
    if (!existing) {
      return c.json({ error: "Product not found" }, 404);
    }
    const product = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`product:${id}`, product);
    return c.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({ error: "Failed to update product" }, 500);
  }
});

// Delete product
app.delete("/make-server-e9343d87/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`product:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return c.json({ error: "Failed to delete product" }, 500);
  }
});

// ===== CATEGORIES API =====

// Get all categories
app.get("/make-server-e9343d87/categories", async (c) => {
  try {
    const categories = await kv.getByPrefix("category:");
    return c.json(categories || []);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

// Create category
app.post("/make-server-e9343d87/categories", async (c) => {
  try {
    const body = await c.req.json();
    const id = Date.now().toString();
    const category = {
      id,
      ...body,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`category:${id}`, category);
    return c.json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    return c.json({ error: "Failed to create category" }, 500);
  }
});

// Update category
app.put("/make-server-e9343d87/categories/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`category:${id}`);
    if (!existing) {
      return c.json({ error: "Category not found" }, 404);
    }
    const category = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`category:${id}`, category);
    return c.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return c.json({ error: "Failed to update category" }, 500);
  }
});

// Delete category
app.delete("/make-server-e9343d87/categories/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`category:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return c.json({ error: "Failed to delete category" }, 500);
  }
});

// ===== ORDERS API =====

// Get all orders
app.get("/make-server-e9343d87/orders", async (c) => {
  try {
    const orders = await kv.getByPrefix("order:");
    // Sort by date, newest first
    const sorted = (orders || []).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return c.json(sorted);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

// Get single order
app.get("/make-server-e9343d87/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const order = await kv.get(`order:${id}`);
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }
    return c.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return c.json({ error: "Failed to fetch order" }, 500);
  }
});

// Create order
app.post("/make-server-e9343d87/orders", async (c) => {
  try {
    const body = await c.req.json();
    const id = Date.now().toString();
    const order = {
      id,
      ...body,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    await kv.set(`order:${id}`, order);
    return c.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return c.json({ error: "Failed to create order" }, 500);
  }
});

// Update order status
app.put("/make-server-e9343d87/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`order:${id}`);
    if (!existing) {
      return c.json({ error: "Order not found" }, 404);
    }
    const order = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`order:${id}`, order);
    return c.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return c.json({ error: "Failed to update order" }, 500);
  }
});

// ===== AUTH API =====

// Signup endpoint
app.post("/make-server-e9343d87/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return c.json({ error: "缺少必填字段" }, 400);
    }

    // Create Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: { 
        full_name: fullName,
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error("Supabase signup error:", error);
      // Check for specific error codes
      if (error.code === 'email_exists' || error.message.includes('already registered')) {
        return c.json({ error: "该邮箱已被注册" }, 400);
      }
      if (error.message.includes('password')) {
        return c.json({ error: "密码格式不符合要求" }, 400);
      }
      return c.json({ error: `注册失败: ${error.message}` }, 400);
    }

    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: fullName
      }
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return c.json({ error: "注册失败，请稍后重试" }, 500);
  }
});

// ===== SITE SETTINGS API =====

// Get site settings
app.get("/make-server-e9343d87/settings", async (c) => {
  try {
    const settings = await kv.get("site:settings");
    // Return default settings if none exist
    return c.json(settings || {
      title: "World Peas",
      description: "新鲜健康的农产品直送到家",
    });
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return c.json({ error: "Failed to fetch site settings" }, 500);
  }
});

// Update site settings
app.put("/make-server-e9343d87/settings", async (c) => {
  try {
    const body = await c.req.json();
    const settings = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await kv.set("site:settings", settings);
    return c.json(settings);
  } catch (error) {
    console.error("Error updating site settings:", error);
    return c.json({ error: "Failed to update site settings" }, 500);
  }
});

// ===== PAGES CONTENT API =====

// Get pages content
app.get("/make-server-e9343d87/pages", async (c) => {
  try {
    const pages = await kv.get("site:pages");
    // Return default pages if none exist
    return c.json(pages || {
      newsstand: {
        title: "新闻厅",
        content: "欢迎来到新闻厅！这里将展示最新的新闻和资讯。",
      },
      about: {
        title: "关于我们",
        content: "欢迎了解我们！我们致力于提供优质的产品和服务。",
      },
    });
  } catch (error) {
    console.error("Error fetching pages content:", error);
    return c.json({ error: "Failed to fetch pages content" }, 500);
  }
});

// Update pages content
app.put("/make-server-e9343d87/pages", async (c) => {
  try {
    const body = await c.req.json();
    const pages = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await kv.set("site:pages", pages);
    return c.json(pages);
  } catch (error) {
    console.error("Error updating pages content:", error);
    return c.json({ error: "Failed to update pages content" }, 500);
  }
});

Deno.serve(app.fetch);