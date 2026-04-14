export function mapThreat(threatDoc) {
  if (!threatDoc) return null;

  const raw = threatDoc.rawPost;
  const source = raw?.threatSource;

  return {
    id: String(threatDoc._id),
    threat_type: threatDoc.threatType,
    sector: threatDoc.sector,
    severity_score: threatDoc.severityScore,
    credibility_score: threatDoc.credibilityScore,
    impact_level: threatDoc.impactLevel,
    priority: threatDoc.priority ?? "medium",
    indicators: threatDoc.indicators ?? [],
    recommended_action: threatDoc.recommendedAction ?? "",
    likely_timeframe: threatDoc.likelyTimeframe ?? "unknown",
    ai_confidence: threatDoc.aiConfidence ?? 0.5,
    summary: threatDoc.summary,
    raw_posts: raw
      ? {
          id: String(raw._id),
          title: raw.title,
          content: raw.content,
          url: raw.url,
          author: raw.author,
          source_id: raw.sourceId,
          threat_sources: source
            ? {
                id: String(source._id),
                name: source.name,
                type: source.type,
              }
            : null,
        }
      : null,
  };
}

export function mapAlert(alertDoc) {
  return {
    id: String(alertDoc._id),
    is_read: alertDoc.isRead,
    priority: alertDoc.priority ?? "medium",
    route_channel: alertDoc.routeChannel ?? "dashboard-digest",
    route_reason: alertDoc.routeReason ?? "",
    routed_at: alertDoc.routedAt ?? alertDoc.createdAt,
    created_at: alertDoc.createdAt,
    threats: alertDoc.threat
      ? {
          id: String(alertDoc.threat._id),
          threat_type: alertDoc.threat.threatType,
          sector: alertDoc.threat.sector,
          severity_score: alertDoc.threat.severityScore,
          priority: alertDoc.threat.priority ?? "medium",
        }
      : null,
  };
}

export function mapOrganization(orgDoc) {
  if (!orgDoc) return null;

  return {
    id: orgDoc.clerkUserId,
    org_name: orgDoc.orgName,
    sector: orgDoc.sector,
    domain: orgDoc.domain,
    keywords: orgDoc.keywords ?? [],
  };
}

export function mapDomain(domainDoc) {
  return {
    id: String(domainDoc._id),
    domain_name: domainDoc.domainName,
    similarity_score: domainDoc.similarityScore,
    registration_date: domainDoc.registrationDate
      ? new Date(domainDoc.registrationDate).toISOString().split("T")[0]
      : null,
    status: domainDoc.status,
  };
}

export function mapDomainActivity(activityDoc) {
  return {
    id: String(activityDoc._id),
    activity_type: activityDoc.activityType,
    description: activityDoc.description,
    severity: activityDoc.severity,
    is_suspicious: activityDoc.isSuspicious,
    detected_at: activityDoc.detectedAt,
  };
}