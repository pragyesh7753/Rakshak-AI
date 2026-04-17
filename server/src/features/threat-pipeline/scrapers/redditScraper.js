import axios from "axios";
import { ProcessingLog } from "../../../models/ProcessingLog.js";
import { RawPost } from "../../../models/RawPost.js";
import { ThreatSource } from "../../../models/ThreatSource.js";
import { getDynamicRedditQueries } from "../layers/keywordBank.js";

async function logProcessing(status, message, options = {}) {
  await ProcessingLog.create({
    organization: options?.organizationId ?? null,
    jobType: "reddit_scraper",
    status,
    message,
  });
}

function uniqueOrganizationIds(values) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => String(value ?? "").trim())
        .filter(Boolean)
    ),
  ];
}

async function emitOrgLogs(status, message, organizationIds = []) {
  const scopedOrganizationIds = uniqueOrganizationIds(organizationIds);
  if (scopedOrganizationIds.length === 0) {
    return;
  }

  await Promise.all(
    scopedOrganizationIds.map((organizationId) =>
      logProcessing(status, `${message} | org=${organizationId}`, { organizationId })
    )
  );
}

export async function scrapeReddit() {
  await ThreatSource.findOneAndUpdate(
    { sourceId: "reddit" },
    { $set: { sourceId: "reddit", name: "Reddit Search", type: "forum", isActive: true } },
    { upsert: true, returnDocument: "after" }
  );

  const { queries, metadata, queryOrganizations = {} } = await getDynamicRedditQueries();

  const organizationQueryCounts = new Map();
  for (const organizationsForQuery of Object.values(queryOrganizations)) {
    for (const organizationId of uniqueOrganizationIds(organizationsForQuery)) {
      organizationQueryCounts.set(
        organizationId,
        Number(organizationQueryCounts.get(organizationId) ?? 0) + 1
      );
    }
  }

  await Promise.all(
    Array.from(organizationQueryCounts.entries()).map(([organizationId, queryCount]) =>
      Promise.all([
        logProcessing(
          "running",
          `[LIVE] Starting Reddit scraping cycle | org=${organizationId} | targeted_queries: ${queryCount}`,
          { organizationId }
        ),
        logProcessing(
          "running",
          `[INFO] Reddit query plan | org=${organizationId} | total: ${queries.length} | baseline: ${metadata.baselineCount} | dynamic: ${metadata.dynamicCount} | organizations: ${metadata.organizationCount} | organization_queries: ${queryCount}`,
          { organizationId }
        ),
      ])
    )
  );

  for (const query of queries) {
    const scopedOrganizationIds = queryOrganizations[query] ?? [];

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

      await emitOrgLogs(
        "success",
        `[COMPLETED] Reddit query processed: ${query} | posts: ${posts.length}`,
        scopedOrganizationIds
      );
    } catch (error) {
      await emitOrgLogs(
        "failed",
        `[ERROR] Reddit query failed: ${query} | ${error.message}`,
        scopedOrganizationIds
      );
    }
  }
}