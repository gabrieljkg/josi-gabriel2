import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import "dotenv/config";

console.log("Server starting...");
console.log("Environment:", process.env.NODE_ENV);

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required (Settings > Environment)');
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const stripe = getStripe();
      const { gift } = req.body;
      const origin = req.get('origin') || `http://localhost:${PORT}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: gift.name,
                images: (gift.imageUrls && gift.imageUrls.length > 0 && gift.imageUrls[0].startsWith('http')) ? [gift.imageUrls[0]] : [],
              },
              unit_amount: Math.round(Number(gift.price || gift.value || 0) * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/pagamento-sucesso?session_id={CHECKOUT_SESSION_ID}&gift_id=${gift.id}`,
        cancel_url: `${origin}/presentes`,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/session-status", async (req, res) => {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(req.query.session_id as string);

      res.json({
        status: session.status,
        customer_email: session.customer_details?.email,
        payment_status: session.payment_status
      });
    } catch (error: any) {
      console.error(error);
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
