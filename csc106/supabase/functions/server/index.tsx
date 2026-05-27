import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
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

// Helper to create Supabase client
const getSupabaseClient = () => createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Helper to verify user authentication
const verifyAuth = async (authHeader: string | null) => {
  if (!authHeader) {
    return { error: "Missing authorization header" };
  }

  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { error: "Unauthorized" };
  }

  return { user };
};

// Health check endpoint
app.get("/make-server-d4b37e4c/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Sign Up with Email/Password
app.post("/make-server-d4b37e4c/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, firstName, middleName, lastName, mobileNumber, address, role } = body;

    if (!email || !password || !firstName || !lastName || !role) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const supabase = getSupabaseClient();

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server isn't configured
      user_metadata: {
        firstName,
        middleName,
        lastName,
        mobileNumber,
        address,
        role: role || 'user'
      }
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      firstName,
      middleName,
      lastName,
      mobileNumber,
      address,
      role: role || 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    });

    return c.json({
      success: true,
      user: data.user,
      message: "Account created successfully"
    });
  } catch (error) {
    console.log(`Signup error during user creation: ${error}`);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

// Get Current User Profile
app.get("/make-server-d4b37e4c/auth/profile", async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));

    if (authResult.error) {
      return c.json({ error: authResult.error }, 401);
    }

    const profile = await kv.get(`user:${authResult.user.id}`);

    return c.json({
      user: authResult.user,
      profile: profile || authResult.user.user_metadata
    });
  } catch (error) {
    console.log(`Profile fetch error: ${error}`);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// ============================================
// FUNERAL PLAN ROUTES
// ============================================

// Create Funeral Plan (Admin Only)
app.post("/make-server-d4b37e4c/plans/create", async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));

    if (authResult.error) {
      return c.json({ error: authResult.error }, 401);
    }

    const userProfile = await kv.get(`user:${authResult.user.id}`);

    if (userProfile?.role !== 'admin') {
      return c.json({ error: "Admin access required" }, 403);
    }

    const body = await c.req.json();
    const planId = `plan:${crypto.randomUUID()}`;

    const plan = {
      id: planId,
      planNumber: body.planNumber || `ART5-${Date.now()}`,
      customerName: body.customerName,
      assignedUserId: body.assignedUserId,
      contactNumber: body.contactNumber,
      address: body.address,
      packageType: body.packageType,
      servicesIncluded: body.servicesIncluded || [],
      totalAmount: body.totalAmount,
      downPayment: body.downPayment || 0,
      monthlyInstallment: body.monthlyInstallment,
      remainingBalance: body.totalAmount - (body.downPayment || 0),
      duration: body.duration,
      startDate: body.startDate,
      dueDate: body.dueDate,
      paymentStatus: body.paymentStatus || 'pending',
      beneficiaries: body.beneficiaries || [],
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: authResult.user.id
    };

    await kv.set(planId, plan);

    // Add plan to user's plan list
    if (body.assignedUserId) {
      const userPlans = await kv.get(`user:${body.assignedUserId}:plans`) || [];
      userPlans.push(planId);
      await kv.set(`user:${body.assignedUserId}:plans`, userPlans);
    }

    return c.json({ success: true, plan });
  } catch (error) {
    console.log(`Plan creation error: ${error}`);
    return c.json({ error: "Failed to create plan" }, 500);
  }
});

// Get All Plans (Admin Only)
app.get("/make-server-d4b37e4c/plans/all", async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));

    if (authResult.error) {
      return c.json({ error: authResult.error }, 401);
    }

    const userProfile = await kv.get(`user:${authResult.user.id}`);

    if (userProfile?.role !== 'admin') {
      return c.json({ error: "Admin access required" }, 403);
    }

    const plans = await kv.getByPrefix('plan:');

    return c.json({ plans });
  } catch (error) {
    console.log(`Fetch all plans error: ${error}`);
    return c.json({ error: "Failed to fetch plans" }, 500);
  }
});

// Get User's Plans
app.get("/make-server-d4b37e4c/plans/my-plans", async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));

    if (authResult.error) {
      return c.json({ error: authResult.error }, 401);
    }

    const planIds = await kv.get(`user:${authResult.user.id}:plans`) || [];
    const plans = [];

    for (const planId of planIds) {
      const plan = await kv.get(planId);
      if (plan) {
        plans.push(plan);
      }
    }

    return c.json({ plans });
  } catch (error) {
    console.log(`Fetch user plans error: ${error}`);
    return c.json({ error: "Failed to fetch plans" }, 500);
  }
});

// Update Funeral Plan (Admin Only)
app.put("/make-server-d4b37e4c/plans/:planId", async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));

    if (authResult.error) {
      return c.json({ error: authResult.error }, 401);
    }

    const userProfile = await kv.get(`user:${authResult.user.id}`);

    if (userProfile?.role !== 'admin') {
      return c.json({ error: "Admin access required" }, 403);
    }

    const planId = c.req.param('planId');
    const existingPlan = await kv.get(planId);

    if (!existingPlan) {
      return c.json({ error: "Plan not found" }, 404);
    }

    const body = await c.req.json();

    const updatedPlan = {
      ...existingPlan,
      ...body,
      remainingBalance: (body.totalAmount || existingPlan.totalAmount) - (body.downPayment || existingPlan.downPayment),
      updatedAt: new Date().toISOString()
    };

    await kv.set(planId, updatedPlan);

    return c.json({ success: true, plan: updatedPlan });
  } catch (error) {
    console.log(`Plan update error: ${error}`);
    return c.json({ error: "Failed to update plan" }, 500);
  }
});

// Delete Funeral Plan (Admin Only)
app.delete("/make-server-d4b37e4c/plans/:planId", async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));

    if (authResult.error) {
      return c.json({ error: authResult.error }, 401);
    }

    const userProfile = await kv.get(`user:${authResult.user.id}`);

    if (userProfile?.role !== 'admin') {
      return c.json({ error: "Admin access required" }, 403);
    }

    const planId = c.req.param('planId');
    await kv.del(planId);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Plan deletion error: ${error}`);
    return c.json({ error: "Failed to delete plan" }, 500);
  }
});

// Get All Customers (Admin Only)
app.get("/make-server-d4b37e4c/customers/all", async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));

    if (authResult.error) {
      return c.json({ error: authResult.error }, 401);
    }

    const userProfile = await kv.get(`user:${authResult.user.id}`);

    if (userProfile?.role !== 'admin') {
      return c.json({ error: "Admin access required" }, 403);
    }

    const users = await kv.getByPrefix('user:');
    const customers = users.filter((user: any) => !user.id?.includes(':plans'));

    return c.json({ customers });
  } catch (error) {
    console.log(`Fetch customers error: ${error}`);
    return c.json({ error: "Failed to fetch customers" }, 500);
  }
});

// Add Payment Record
app.post("/make-server-d4b37e4c/payments/add", async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));

    if (authResult.error) {
      return c.json({ error: authResult.error }, 401);
    }

    const body = await c.req.json();
    const { planId, amount, paymentDate, paymentMethod, notes } = body;

    const plan = await kv.get(planId);

    if (!plan) {
      return c.json({ error: "Plan not found" }, 404);
    }

    const paymentId = `payment:${crypto.randomUUID()}`;
    const payment = {
      id: paymentId,
      planId,
      amount,
      paymentDate: paymentDate || new Date().toISOString(),
      paymentMethod: paymentMethod || 'cash',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    await kv.set(paymentId, payment);

    // Update plan balance
    const newBalance = plan.remainingBalance - amount;
    const updatedPlan = {
      ...plan,
      remainingBalance: newBalance,
      paymentStatus: newBalance <= 0 ? 'paid' : newBalance < plan.totalAmount ? 'partial' : 'pending',
      updatedAt: new Date().toISOString()
    };

    await kv.set(planId, updatedPlan);

    return c.json({ success: true, payment, updatedPlan });
  } catch (error) {
    console.log(`Payment addition error: ${error}`);
    return c.json({ error: "Failed to add payment" }, 500);
  }
});

// Get Plan Payments
app.get("/make-server-d4b37e4c/payments/:planId", async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));

    if (authResult.error) {
      return c.json({ error: authResult.error }, 401);
    }

    const planId = c.req.param('planId');
    const allPayments = await kv.getByPrefix('payment:');
    const planPayments = allPayments.filter((payment: any) => payment.planId === planId);

    return c.json({ payments: planPayments });
  } catch (error) {
    console.log(`Fetch payments error: ${error}`);
    return c.json({ error: "Failed to fetch payments" }, 500);
  }
});

// Delete/Deactivate User or Admin (Admin Only)
app.delete("/make-server-d4b37e4c/users/:userId", async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));

    if (authResult.error) {
      return c.json({ error: authResult.error }, 401);
    }

    const userProfile = await kv.get(`user:${authResult.user.id}`);

    if (userProfile?.role !== 'admin') {
      return c.json({ error: "Admin access required" }, 403);
    }

    const userId = c.req.param('userId');
    const targetUser = await kv.get(`user:${userId}`);

    if (!targetUser) {
      return c.json({ error: "User not found" }, 404);
    }

    // Delete all user's plans first
    const userPlans = await kv.get(`user:${userId}:plans`) || [];
    for (const planId of userPlans) {
      // Delete all payments associated with this plan
      const allPayments = await kv.getByPrefix('payment:');
      const planPayments = allPayments.filter((payment: any) => payment.planId === planId);
      for (const payment of planPayments) {
        await kv.del(payment.id);
      }

      // Delete the plan
      await kv.del(planId);
    }

    // Delete user's plan list
    await kv.del(`user:${userId}:plans`);

    // Delete user profile from KV store
    await kv.del(`user:${userId}`);

    // Delete from Supabase Auth
    const supabase = getSupabaseClient();
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.log(`Error deleting user from auth: ${authError.message}`);
    }

    return c.json({ success: true, message: "User and all associated records deleted successfully" });
  } catch (error) {
    console.log(`User deletion error: ${error}`);
    return c.json({ error: "Failed to delete user" }, 500);
  }
});

// Get All Admins (Admin Only)
app.get("/make-server-d4b37e4c/admins/all", async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));

    if (authResult.error) {
      return c.json({ error: authResult.error }, 401);
    }

    const userProfile = await kv.get(`user:${authResult.user.id}`);

    if (userProfile?.role !== 'admin') {
      return c.json({ error: "Admin access required" }, 403);
    }

    const users = await kv.getByPrefix('user:');
    const admins = users.filter((user: any) => user.role === 'admin' && !user.id?.includes(':plans'));

    return c.json({ admins });
  } catch (error) {
    console.log(`Fetch admins error: ${error}`);
    return c.json({ error: "Failed to fetch admins" }, 500);
  }
});

Deno.serve(app.fetch);