import Parser from "rss-parser";
import { supabase } from "../supabaseClient.js";

const parser = new Parser({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Accept": "application/rss+xml",
    "Referer": "https://www.reddit.com/",
  },
})
const subreddits = [
  "cybersecurity",
  "netsec",
  "hacking",
  "bugbounty"
];

export async function scrapeReddit() {
  console.log("🔎 Fetching Reddit RSS feeds...");

  for (const sub of subreddits) {
    try {
      const feed = await parser.parseURL(
        `https://www.reddit.com/r/${sub}/new/.rss`
      );

      for (const item of feed.items.slice(0, 10)) {
        await supabase.from("raw_posts").insert({
          source_id: 1,
          title: item.title,
          content: item.contentSnippet || item.title,
          url: item.link,
          author: item.creator || "reddit",
          posted_at: new Date(item.pubDate),
          keyword_score: 3
        });
      }

      console.log(`Fetched posts from r/${sub}`);
    } catch (err) {
      console.log("RSS error:", err.message);
    }
  }

  console.log("✅ Reddit RSS scraping finished");
}
