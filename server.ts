import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Payment Integration (Payme/Click)
  // These are placeholders for actual integration logic.
  // In a real app, you'd use your merchant ID and secret keys.
  app.post("/api/payment/generate-link", (req, res) => {
    const { provider, amount, planId } = req.body;
    const orderId = `ORDER_${Date.now()}`;
    
    // Placeholder logic for generating payment links
    let paymentUrl = "";
    if (provider === "payme") {
      // Payme link format: https://checkout.paycom.uz/{base64_encoded_params}
      const params = Buffer.from(`m=YOUR_MERCHANT_ID;ac.order_id=${orderId};a=${amount * 100}`).toString('base64');
      paymentUrl = `https://checkout.paycom.uz/${params}`;
    } else if (provider === "click") {
      // Click link format: https://my.click.uz/services/pay?service_id=YOUR_SERVICE_ID&merchant_id=YOUR_MERCHANT_ID&amount=${amount}&transaction_param=${orderId}
      paymentUrl = `https://my.click.uz/services/pay?service_id=YOUR_SERVICE_ID&merchant_id=YOUR_MERCHANT_ID&amount=${amount}&transaction_param=${orderId}`;
    }

    res.json({ url: paymentUrl, orderId });
  });

  app.post("/api/payment/webhook", (req, res) => {
    // Handle payment confirmation from Payme/Click
    // Update user plan in database (e.g., Firestore)
    console.log("Payment webhook received:", req.body);
    res.json({ status: "success" });
  });

  // Vite middleware for development
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

startServer();
