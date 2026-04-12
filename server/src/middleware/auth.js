import { getAuth, requireAuth } from "@clerk/express";

export const requireClerkAuth = requireAuth();

export function getUserId(req) {
  return getAuth(req).userId;
}