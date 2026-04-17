import { ProcessingLog } from "../models/ProcessingLog.js";
import { Organization } from "../models/Organization.js";
import { isPipelineRunning, triggerPipelineRun } from "../features/threat-pipeline/jobs/runPipeline.js";
import { getUserId } from "../shared/auth/clerkAuth.js";

function normalizeStatus(status) {
  const lower = String(status ?? "").toLowerCase();
  if (lower === "success" || lower === "completed") return "success";
  if (lower === "failed" || lower === "error") return "failed";
  if (lower === "running" || lower === "processing") return "running";
  return "other";
}

async function resolveOrganizationId(req) {
  const userId = getUserId(req);
  const organization = await Organization.findOne({ clerkUserId: userId }).select("_id").lean();
  return organization?._id ?? null;
}

export async function getProcessingLogs(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 100);
    const organizationId = await resolveOrganizationId(req);

    if (!organizationId) {
      return res.json([]);
    }

    const logs = await ProcessingLog.find({ organization: organizationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

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

export async function getProcessingLogSummary(req, res) {
  try {
    const hours = Math.min(Math.max(Number(req.query.hours ?? 24), 1), 168);
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const organizationId = await resolveOrganizationId(req);

    if (!organizationId) {
      return res.json({
        window_hours: hours,
        pipeline_running: isPipelineRunning(),
        totals: { total: 0, success: 0, failed: 0, running: 0 },
        by_job_type: [],
        recent: [],
      });
    }

    const [grouped, latestLogs] = await Promise.all([
      ProcessingLog.aggregate([
        { $match: { organization: organizationId, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { jobType: "$jobType", status: "$status" },
            count: { $sum: 1 },
            latestAt: { $max: "$createdAt" },
          },
        },
      ]),
      ProcessingLog.find({ organization: organizationId, createdAt: { $gte: since } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    if (grouped.length === 0) {
      return res.json({
        window_hours: hours,
        pipeline_running: isPipelineRunning(),
        totals: { total: 0, success: 0, failed: 0, running: 0 },
        by_job_type: [],
        recent: [],
      });
    }

    const totals = { total: 0, success: 0, failed: 0, running: 0 };
    const byJobTypeMap = new Map();

    for (const row of grouped) {
      const jobType = String(row?._id?.jobType ?? "unknown");
      const normalized = normalizeStatus(row?._id?.status);
      const count = Number(row?.count ?? 0);

      totals.total += count;
      if (normalized === "success") totals.success += count;
      if (normalized === "failed") totals.failed += count;
      if (normalized === "running") totals.running += count;

      const existing = byJobTypeMap.get(jobType) ?? {
        job_type: jobType,
        total: 0,
        success: 0,
        failed: 0,
        running: 0,
        latest_at: null,
      };

      existing.total += count;
      if (normalized === "success") existing.success += count;
      if (normalized === "failed") existing.failed += count;
      if (normalized === "running") existing.running += count;

      const latestAt = row?.latestAt ? new Date(row.latestAt).toISOString() : null;
      if (!existing.latest_at || (latestAt && latestAt > existing.latest_at)) {
        existing.latest_at = latestAt;
      }

      byJobTypeMap.set(jobType, existing);
    }

    const recent = latestLogs.map((item) => ({
      id: String(item._id),
      job_type: item.jobType,
      status: item.status,
      message: item.message,
      created_at: item.createdAt,
    }));

    res.json({
      window_hours: hours,
      pipeline_running: isPipelineRunning(),
      totals,
      by_job_type: Array.from(byJobTypeMap.values()).sort((a, b) => b.total - a.total),
      recent,
    });
  } catch (error) {
    console.error("[system.controller] getProcessingLogSummary:", error);
    res.status(500).json({ error: "Failed to fetch processing log summary" });
  }
}

export async function startPipeline(req, res) {
  try {
    const started = triggerPipelineRun("manual-api");
    if (!started) {
      return res.status(409).json({
        started: false,
        pipeline_running: true,
        message: "Pipeline is already running",
      });
    }

    res.status(202).json({
      started: true,
      pipeline_running: true,
      message: "Pipeline started",
      triggered_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[system.controller] startPipeline:", error);
    res.status(500).json({ error: "Failed to start pipeline" });
  }
}