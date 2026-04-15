import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectMongo } from "../../config/mongodb.js";
import { analyzePosts } from "../layers/analyzePosts.js";
import { scrapeReddit } from "../scrapers/redditScraper.js";

let pipelineRunning = false;

export async function runPipeline() {
  await connectMongo();
  await scrapeReddit();
  await analyzePosts();
}

export function isPipelineRunning() {
  return pipelineRunning;
}

export function triggerPipelineRun(trigger = "manual") {
  if (pipelineRunning) {
    return false;
  }

  pipelineRunning = true;

  (async () => {
    try {
      console.log(`[pipeline] started (${trigger})`);
      await runPipeline();
      console.log(`[pipeline] finished (${trigger})`);
    } catch (error) {
      console.error(`[pipeline] failed (${trigger})`, error);
    } finally {
      pipelineRunning = false;
    }
  })();

  return true;
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  runPipeline()
    .then(() => {
      console.log("Pipeline completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Pipeline failed", error);
      process.exit(1);
    });
}