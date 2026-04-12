import axios from "axios";
import { ProcessingLog } from "../../models/ProcessingLog.js";
import { RawPost } from "../../models/RawPost.js";
import { ThreatSource } from "../../models/ThreatSource.js";
import { redditQueries } from "./redditThreadQueries.js";

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
    { upsert: true, new: true }
  );

  await logProcessing("running", "[LIVE] Starting Reddit scraping cycle");

  for (const query of redditQueries) {
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
          { upsert: true, new: true }
        );
      }

      await logProcessing("success", `[COMPLETED] Reddit query processed: ${query} | posts: ${posts.length}`);
    } catch (error) {
      await logProcessing("failed", `[ERROR] Reddit query failed: ${query} | ${error.message}`);
    }
  }
}