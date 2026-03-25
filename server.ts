import express from "express";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./src/server/routes/auth";
import adminRoutes from "./src/server/routes/admin";
import recoveryRoutes from "./src/server/routes/recovery";
import { findUserByUid, updateUserProStatus, updateUserStripeCustomerId, findUserByStripeCustomerId, findUserByEmail } from "./src/server/auth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.socket.remoteAddress;
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip}`);
    next();
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/recovery", recoveryRoutes);

  app.post("/api/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not set');
      }
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err: any) {
      console.error('Webhook Error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const userId = session.client_reference_id;
      
      if (customerId) {
        try {
          if (userId) {
            const user = await findUserByUid(userId);
            if (user) {
              await updateUserStripeCustomerId(user.id, customerId);
            }
          } else {
            const user = await findUserByStripeCustomerId(customerId);
            if (user) {
              await updateUserProStatus(user.id, true, 'stripe');
              console.log(`Successfully updated user ${user.email} to Pro status via Stripe.`);
            }
          }
        } catch (error) {
          console.error(`Error updating user to Pro:`, error);
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      if (customerId) {
        try {
          const user = await findUserByStripeCustomerId(customerId);
          if (user) {
            await updateUserProStatus(user.id, false, null);
            console.log(`Successfully revoked Pro status for user ${user.email}.`);
          }
        } catch (error) {
          console.error(`Error revoking user Pro status:`, error);
        }
      }
    }

    res.json({ received: true });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { uid, email } = req.body;
      
      if (!uid || !email) {
        return res.status(400).json({ error: "UID e email são obrigatórios" });
      }

      const stripe = getStripe();
      const user = await findUserByUid(uid);
      
      let customerId = user?.stripe_customer_id;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: email,
          metadata: { uid }
        });
        customerId = customer.id;
        
        if (user) {
          await updateUserStripeCustomerId(user.id, customerId);
        }
      }
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        customer: customerId,
        client_reference_id: uid,
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID || "price_1TCMxMFrjzR2jSnBFi9xV37q",
            quantity: 1,
          },
        ],
        success_url: `${req.headers.origin || 'http://localhost:3000'}?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${req.headers.origin || 'http://localhost:3000'}?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

startServer().catch(console.error);
