import express, { Request, Response, NextFunction } from "express";
import { connection } from "./utils/database";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { rootRoute } from "./routes/Root.routes";
import cors from "cors";
import startSpinNotifierScheduler from "./schedulers/spinNotifier";

dotenv.config();

// Environment variable validation
function validateEnvironmentVariables() {
  // Only enforce critical backend variables
  const criticalVars = ["MONGO_URI", "JWT_SECRET"];
  const missingCritical = criticalVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingCritical.length > 0) {
    console.error(
      "❌ Critical environment variables missing:",
      missingCritical.join(", ")
    );
    console.error("   App cannot start without these variables.");
    process.exit(1);
  }
}

// Validate environment variables on startup
validateEnvironmentVariables();

// Removed Twitter integration enable flag; simple flow does not require it

const app = express();
// Middleware to parse JSON
app.use(express.json());
app.use(cookieParser());
// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8181",
  "https://rst6ljsx-5173.inc1.devtunnels.ms",
  "https://514jqvr0-5173.inc1.devtunnels.ms",
  "https://bfm-mini-app.vercel.app",
  "https://bfm-mini-app-zu82.vercel.app"
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Connect to the database:
const initializeDatabase = async () => {
  try {
    await connection();
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

// Log all API requests
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // short, colored logs
} else {
  // For production or log files, use 'combined'
  app.use(morgan("combined"));
}

// Basic test route
app.get("/", (req: Request, res: Response) => {
  res.send("✅ BFM mini App server is up and running!");
});

app.use("/api/v1", rootRoute);

// Global error handler (optional)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to database first
    await initializeDatabase();

    // Start server locally only
    if (process.env.NODE_ENV !== "production") {
      const PORT = process.env.PORT || 8181;
      app.listen(PORT, () => {
        console.log(`🚀 BFM Server listening on port ${PORT}`);
      });
    }

    // Start background scheduler for spin notifications only after DB is connected
    const SPIN_URL = process.env.SPIN_URL;
    if (SPIN_URL) {
      startSpinNotifierScheduler(SPIN_URL);
      console.log("✅ Spin notifier scheduler started");
    } else {
      console.warn(
        "⚠️ SPIN_URL not provided, spin notifier scheduler not started"
      );
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
