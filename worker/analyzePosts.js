import { supabase } from "./supabaseClient.js";
import { containsThreatWords } from "./filterThread.js";

export async function analyzePosts() {
  console.log("🧠 Starting analysis pipeline...");

  // 1️⃣ Fetch unprocessed posts
  const { data: posts, error } = await supabase
    .from("raw_posts")
    .select("*")
    .eq("processed", false);

  if (error) {
    console.log("DB error:", error.message);
    return;
  }

  if (!posts.length) {
    console.log("No new posts to analyze");
    return;
  }

  console.log(`Found ${posts.length} posts`);

  for (const post of posts) {
    try {

      // 🟨 LAYER 2 — Threat Phrase Filtering
      if (!containsThreatWords(post.content)) {
        console.log("Layer2 ❌ Skipped:", post.id);

        await supabase
          .from("raw_posts")
          .update({ processed: true })
          .eq("id", post.id);

        continue;
      }

      console.log("Layer2 ✅ Passed:", post.id);

      // ⏳ LAYER 3 + 4 coming next
      // For now we just mark as processed

      await supabase
        .from("raw_posts")
        .update({ processed: true })
        .eq("id", post.id);

    } catch (err) {
      console.log("Error processing post:", err.message);
    }
  }

  console.log("✅ Layer 2 processing finished");
}
