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

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(clerkMiddleware());

app.use("/api", apiRouter);

app.use((error, _req, res, _next) => {
  console.error("[backend] unhandled error", error);
  res.status(500).json({ error: "Internal server error" });
});

async function bootstrap() {
  await connectMongo();

  if (process.env.RUN_PIPELINE_ON_START === "true") {
    triggerPipelineRun("startup");
  }

  if (process.env.PIPELINE_CRON) {
    cron.schedule(process.env.PIPELINE_CRON, () => {
      triggerPipelineRun("schedule");
    });
  }

  app.listen(port, () => {
    console.log(`Rakshak backend listening on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});