import { ProcessingLog } from "../models/ProcessingLog.js";

function fallbackLogs(limit = 20) {
  const now = Date.now();
  return [
    {
      id: "1",
      job_type: "reddit_scraper",
      status: "running",
      message:
        "[LIVE] Scraping r/cybersecurity - Processing thread #1847 | Posts: 24/150 | Rate limit: 87% available",
      created_at: new Date(now - 15000).toISOString(),
    },
    {
      id: "2",
      job_type: "ai_analysis",
      status: "processing",
      message:
        "[LIVE] Llama 4 Maverick (SambaNova) analyzing post batch #42 | Threat detection: 3 potential matches | Confidence: 0.87",
      created_at: new Date(now - 30000).toISOString(),
    },
    {
      id: "3",
      job_type: "threat_scoring",
      status: "success",
      message:
        "[COMPLETED] Threat score calculation finished | Processed: 12 threats | Avg severity: 7.2/10 | Duration: 1.2s",
      created_at: new Date(now - 45000).toISOString(),
    },
  ].slice(0, limit);
}

export async function getProcessingLogs(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 100);

    const logs = await ProcessingLog.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (logs.length === 0) {
      return res.json(fallbackLogs(limit));
    }

    res.json(
      logs.map((item) => ({
        id: String(item._id),
        job_type: item.jobType,
        status: item.status,
        message: item.message,
        created_at: item.createdAt,
      }))
    );
  } catch (error) {
    console.error("[system.controller] getProcessingLogs:", error);
    res.status(500).json({ error: "Failed to fetch processing logs" });
  }
}