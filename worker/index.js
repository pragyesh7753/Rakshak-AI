import { scrapeReddit } from "./scrappers/redditScrapper.js";
import { analyzePosts } from "./layers/analyzePosts.js";


async function runPipeline() {
  await scrapeReddit(); // Layer 1
  await analyzePosts(); // Layer 2
}

runPipeline();
