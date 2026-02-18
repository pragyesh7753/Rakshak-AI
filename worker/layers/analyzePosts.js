import { supabase } from "../supabaseClient.js";
import { containsThreatWords } from "./filterThread.js";
import { calculateThreatScore, isHighRisk } from "./scoring.js";

export async function analyzePosts() {
  console.log("🧠 Starting analysis pipeline...");

  // 1️⃣ Fetch posts that are not processed yet
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
      // ==============================
      // 🟨 LAYER 2 — Threat Phrase Filter
      // ==============================
      if (!containsThreatWords(post.content)) {
        console.log("Layer2 ❌ Not a threat:", post.id);

        // Mark as processed so we never check again
        await supabase
          .from("raw_posts")
          .update({ processed: true })
          .eq("id", post.id);

        continue;
      }

      console.log("Layer2 ✅ Threat detected:", post.id);

      // ==============================
      // 🟧 LAYER 3 — Threat Scoring Engine
      // ==============================
      const score = calculateThreatScore(post.content);

      // ⭐ Save threat_score in DB
      await supabase
        .from("raw_posts")
        .update({ threat_score: score })
        .eq("id", post.id);

      console.log("Layer3 Score:", score);

      // If score is low → stop pipeline
      if (!isHighRisk(post.content)) {
        console.log("Layer3 ❌ Low score → Skipped:", post.id);

        await supabase
          .from("raw_posts")
          .update({ processed: true })
          .eq("id", post.id);

        continue;
      }

      console.log("Layer3 ✅ High risk post:", post.id);

      // ⏳ DO NOT mark processed here
      // High-risk posts now move to Layer 4 (AI)

    } catch (err) {
      console.log("Error processing post:", err.message);
    }
  }

  console.log("✅ Layer 2 + 3 pipeline finished");
}
