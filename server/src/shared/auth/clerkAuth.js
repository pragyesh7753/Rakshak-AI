import { getAuth } from "@clerk/express";

export function requireClerkAuth(req, res, next) {
  const { userId, sessionId } = getAuth(req);

  if (!userId || !sessionId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.userId = userId;
  req.sessionId = sessionId;
  return next();
}

export function getUserId(req) {
  return req.userId || getAuth(req).userId;
}

export function optionalClerkAuth(req, res, next) {
  const { userId, sessionId } = getAuth(req);
  if (userId && sessionId) {
    req.userId = userId;
    req.sessionId = sessionId;
  }
  return next();
}