import express from "express";
import cors from "cors";
import helmet from "helmet";

import routes from "./routes/index.js";

import {
  errorMiddleware
} from "./middleware/error.middleware.js";
import roleRoutes from "./routes/role.routes.js";

import publicAcceptanceRoutes from "./routes/public.acceptance.routes.js";


const app = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Body parsers
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({
  extended: true,
  limit: "5mb"
}));

// Health check
app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Travel CRM API is running",
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use("/api", routes);
app.use("/api/roles", roleRoutes);
app.use(
  "/api/public",
  publicAcceptanceRoutes
);

// 404
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Global error handler
app.use(errorMiddleware);

export default app;