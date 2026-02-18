import axios from "axios";
import { supabase } from "../supabaseClient.js";
import { redditQueries } from "./redditThreadQueries.js";

export async function scrapeReddit() {
  console.log("🔎 Searching Reddit using queries...");

  for (const query of redditQueries) {
    try {
      const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=10`;

      const res = await axios.get(url, {
        headers: { "User-Agent": "rakshak-ai" }
      });

      const posts = res.data.data.children;

      for (const p of posts) {
        const post = p.data;

        await supabase.from("raw_posts").insert({
          source_id: 1,
          title: post.title,
          content: post.selftext || post.title,
          url: `https://reddit.com${post.permalink}`,
          author: post.author,
          posted_at: new Date(post.created_utc * 1000),
          keyword_score: 3
        });
      }

      console.log(`Fetched posts for query: ${query}`);

    } catch (err) {
      console.log("Reddit error:", err.message);
    }
  }

  console.log("✅ Reddit search scraping finished");
}
