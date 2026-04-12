import "dotenv/config";
import { connectMongo } from "../../config/mongodb.js";
import { analyzePosts } from "../layers/analyzePosts.js";
import { scrapeReddit } from "../scrapers/redditScraper.js";

export async function runPipeline() {
  await connectMongo();
  await scrapeReddit();
  await analyzePosts();
}

if (import.meta.url === `file://${process.argv[1]}`) {
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