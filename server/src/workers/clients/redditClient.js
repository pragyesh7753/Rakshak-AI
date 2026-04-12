import snoowrap from "snoowrap";

export const reddit = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT ?? "rakshak-ai",
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
});