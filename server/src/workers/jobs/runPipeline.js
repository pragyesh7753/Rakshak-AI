import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectMongo } from "../../config/mongodb.js";
import { analyzePosts } from "../layers/analyzePosts.js";
import { scrapeReddit } from "../scrapers/redditScraper.js";

export async function runPipeline() {
  await connectMongo();
  await scrapeReddit();
  await analyzePosts();
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