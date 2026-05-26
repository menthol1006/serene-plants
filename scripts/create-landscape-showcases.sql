CREATE TABLE IF NOT EXISTS landscape_showcases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  "productIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "updatedAt" TEXT NOT NULL
);

ALTER PUBLICATION supabase_realtime ADD TABLE landscape_showcases;
