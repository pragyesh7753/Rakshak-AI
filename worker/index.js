import { scrapeReddit } from "./scrappers/redditScrapper.js";
import { analyzePosts } from "./layers/analyzePosts.js";
import { isHighRisk } from "./layers/scoring.js";


async function runPipeline() {
  await scrapeReddit(); // Layer 1
  await analyzePosts(); // Layer 2
  await isHighRisk(); // Layer 3
}

runPipeline();
