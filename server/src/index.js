import "dotenv/config";

import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import cron from "node-cron";
import express from "express";
import { connectMongo } from "./config/mongodb.js";
import apiRouter from "./routes/index.js";
import { triggerPipelineRun } from "./workers/jobs/runPipeline.js";

const app = express();
const port = Number(process.env.PORT ?? 5000);
const startedAt = new Date().toISOString();

let mongoConnected = false;
let mongoConnectError = null;
let backgroundJobsStarted = false;

const parsedMongoRetryMs = Number(process.env.MONGO_CONNECT_RETRY_MS ?? 10000);
const mongoRetryMs = Number.isFinite(parsedMongoRetryMs) && parsedMongoRetryMs > 0
  ? parsedMongoRetryMs
  : 10000;

function healthPayload() {
  return {
    ok: true,
    service: "rakshakai-backend",
    startedAt,
    uptimeSeconds: Math.floor(process.uptime()),
    dependencies: {
      mongo: mongoConnected ? "up" : "down",
    },
  };
}

function readinessPayload() {
  return {
    ok: mongoConnected,
    service: "rakshakai-backend",
    status: mongoConnected ? "ready" : "not-ready",
    startedAt,
    uptimeSeconds: Math.floor(process.uptime()),
    dependencies: {
      mongo: mongoConnected ? "up" : "down",
    },
    error: mongoConnected ? null : mongoConnectError,
  };
}

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/health", (_req, res) => {
  res.json(healthPayload());
});

app.get("/api/health", (_req, res) => {
  res.json(healthPayload());
});

app.get("/ready", (_req, res) => {
  const payload = readinessPayload();
  res.status(payload.ok ? 200 : 503).json(payload);
});

app.get("/api/ready", (_req, res) => {
  const payload = readinessPayload();
  res.status(payload.ok ? 200 : 503).json(payload);
});
app.use(express.json({ limit: "1mb" }));
app.use(clerkMiddleware());

app.use("/api", apiRouter);

app.use((error, _req, res, _next) => {
  console.error("[backend] unhandled error", error);
  res.status(500).json({ error: "Internal server error" });
});

function startBackgroundJobs() {
  if (backgroundJobsStarted) {
    return;
  }

  backgroundJobsStarted = true;

  if (process.env.RUN_PIPELINE_ON_START === "true") {
    triggerPipelineRun("startup");
  }

  if (process.env.PIPELINE_CRON) {
    cron.schedule(process.env.PIPELINE_CRON, () => {
      triggerPipelineRun("schedule");
    });
  }
}

async function connectMongoWithRetry() {
  try {
    await connectMongo();
    mongoConnected = true;
    mongoConnectError = null;
    console.log("[backend] MongoDB connected");
    startBackgroundJobs();
  } catch (error) {
    mongoConnected = false;
    mongoConnectError = error instanceof Error ? error.message : String(error);
    console.error(
      `[backend] MongoDB connection failed; retrying in ${mongoRetryMs}ms`,
      error
    );
    setTimeout(connectMongoWithRetry, mongoRetryMs);
  }
}

async function bootstrap() {
  app.listen(port, () => {
    console.log(`Rakshak backend listening on port ${port}`);
  });

  void connectMongoWithRetry();
}

bootstrap().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});