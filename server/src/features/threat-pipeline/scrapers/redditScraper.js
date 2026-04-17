import axios from "axios";
import { ProcessingLog } from "../../../models/ProcessingLog.js";
import { RawPost } from "../../../models/RawPost.js";
import { ThreatSource } from "../../../models/ThreatSource.js";
import { getDynamicRedditQueries } from "../layers/keywordBank.js";

async function logProcessing(status, message) {
  await ProcessingLog.create({
    jobType: "reddit_scraper",
    status,
    message,
  });
}

export async function scrapeReddit() {
  await ThreatSource.findOneAndUpdate(
    { sourceId: "reddit" },
    { $set: { sourceId: "reddit", name: "Reddit Search", type: "forum", isActive: true } },
    { upsert: true, returnDocument: "after" }
  );

  await logProcessing("running", "[LIVE] Starting Reddit scraping cycle");

  const { queries, metadata } = await getDynamicRedditQueries();
  await logProcessing(
    "running",
    `[INFO] Reddit query plan | total: ${queries.length} | baseline: ${metadata.baselineCount} | dynamic: ${metadata.dynamicCount} | organizations: ${metadata.organizationCount}`
  );

  for (const query of queries) {
    try {
      const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=10`;
      const res = await axios.get(url, { headers: { "User-Agent": "rakshak-ai" } });

      const posts = res.data?.data?.children ?? [];

      for (const item of posts) {
        const post = item.data;
        const permalink = `https://reddit.com${post.permalink}`;

        await RawPost.findOneAndUpdate(
          { url: permalink },
          {
            $setOnInsert: {
              sourceId: "reddit",
              title: post.title,
              content: post.selftext || post.title,
              url: permalink,
              author: post.author,
              postedAt: new Date(post.created_utc * 1000),
              keywordScore: 3,
              processed: false,
              threatScore: 0,
            },
          },
          { upsert: true, returnDocument: "after" }
        );
      }

      await logProcessing("success", `[COMPLETED] Reddit query processed: ${query} | posts: ${posts.length}`);
    } catch (error) {
      await logProcessing("failed", `[ERROR] Reddit query failed: ${query} | ${error.message}`);
    }
  }
}