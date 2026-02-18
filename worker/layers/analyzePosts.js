import { supabase } from "../supabaseClient.js";
import { containsThreatWords } from "./filterThread.js";
import { calculateThreatScore, isHighRisk } from "./scoring.js";
import { model } from "../geminiClient.js";

export async function analyzePosts() {
  console.log("🧠 Starting analysis pipeline...");

  // 1️⃣ Fetch posts not processed yet
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

        await supabase
          .from("raw_posts")
          .update({ processed: true })
          .eq("id", post.id);

        continue;
      }

      console.log("Layer2 ✅ Threat detected:", post.id);

      // ==============================
      // 🟧 LAYER 3 — Threat Scoring
      // ==============================
      const score = calculateThreatScore(post.content);

      // Save score in DB
      await supabase
        .from("raw_posts")
        .update({ threat_score: score })
        .eq("id", post.id);

      console.log("Layer3 Score:", score);

      if (!isHighRisk(post.content)) {
        console.log("Layer3 ❌ Low score:", post.id);

        await supabase
          .from("raw_posts")
          .update({ processed: true })
          .eq("id", post.id);

        continue;
      }

      console.log("Layer3 ✅ High risk post:", post.id);

      // ==============================
      // 🟥 LAYER 4 — Gemini AI Analysis
      // ==============================
      const prompt = `
Analyze this forum post for cyber threat intelligence.

POST:
"${post.content}"

Return STRICT JSON ONLY:
{
  "is_threat": true/false,
  "threat_type": "",
  "sector": "",
  "severity_score": 1-10,
  "credibility_score": 1-10,
  "impact_level": "low|medium|high",
  "organizations_mentioned": [],
  "summary": ""
}
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const cleanText = text.replace(/```json|```/g, "").trim();
      const analysis = JSON.parse(cleanText);

      if (!analysis.is_threat) {
        console.log("AI ❌ Not a real threat:", post.id);

        await supabase
          .from("raw_posts")
          .update({ processed: true })
          .eq("id", post.id);

        continue;
      }

      console.log("AI ✅ Threat confirmed:", post.id);

      // ==============================
      // Insert into threats table
      // ==============================
      const { data: threat } = await supabase
        .from("threats")
        .insert({
          raw_post_id: post.id,
          threat_type: analysis.threat_type,
          sector: analysis.sector,
          severity_score: analysis.severity_score,
          credibility_score: analysis.credibility_score,
          impact_level: analysis.impact_level,
          organizations_mentioned: analysis.organizations_mentioned,
          summary: analysis.summary,
          ai_confidence: 0.9
        })
        .select()
        .single();

      console.log("Threat stored:", threat.id);

      // ==============================
      // 🚨 Create alerts for organizations
      // ==============================
      const { data: orgs } = await supabase
        .from("organizations")
        .select("*")
        .eq("sector", analysis.sector);

      for (const org of orgs) {
        await supabase.from("alerts").insert({
          organization_id: org.id,
          threat_id: threat.id
        });
      }

      console.log("Alerts created");

      // ==============================
      // Mark raw post processed
      // ==============================
      await supabase
        .from("raw_posts")
        .update({ processed: true })
        .eq("id", post.id);

    } catch (err) {
      console.log("Error processing post:", err.message);
    }
  }

  console.log("🎉 Full pipeline finished");
}
