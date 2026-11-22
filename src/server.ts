import express from "express";
import { readFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";

const PORT = Number(process.env.PORT ?? 8081);
const DATA_DIR = process.env.CATALOG_DATA_DIR ?? path.resolve("./catalog-data");
const CATALOG_JSON = path.join(DATA_DIR, "catalog.json");
const FILES_DIR = path.join(DATA_DIR, "files");

interface CatalogEntry {
  id: string;
  title: string;
  version: string;
  description: string;
  filename: string;
  size_bytes: number;
}

function loadCatalog(): CatalogEntry[] {
  if (!existsSync(CATALOG_JSON)) return [];
  return JSON.parse(readFileSync(CATALOG_JSON, "utf8"));
}

const app = express();

/**
 * GET /api/catalog
 * Returns the list of apps available for download. Edit catalog-data/catalog.json
 * and drop the matching .ipa files into catalog-data/files/ to publish something.
 */
app.get("/api/catalog", (_req, res) => {
  res.json(loadCatalog());
});

/**
 * GET /api/ipa/:id
 * Streams the .ipa file for one catalog entry.
 */
app.get("/api/ipa/:id", (req, res) => {
  const entry = loadCatalog().find((e) => e.id === req.params.id);
  if (!entry) return res.status(404).json({ error: "not-found" });

  const filePath = path.join(FILES_DIR, entry.filename);
  if (!existsSync(filePath)) {
    return res.status(404).json({ error: "file-missing-on-server" });
  }

  const stat = statSync(filePath);
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment; filename="${entry.filename}"`);
  res.setHeader("Content-Length", stat.size.toString());
  res.sendFile(path.resolve(filePath));
});

/**
 * GET /api/updates?id=<catalog_id>&current_version=<x.y.z>
 * Tells the client whether a newer version exists.
 */
app.get("/api/updates", (req, res) => {
  const id = String(req.query.id ?? "");
  const currentVersion = String(req.query.current_version ?? "");
  const entry = loadCatalog().find((e) => e.id === id);
  if (!entry) return res.status(404).json({ error: "not-found" });

  res.json({
    update_available: entry.version !== currentVersion,
    latest_version: entry.version,
  });
});

app.listen(PORT, () => {
  console.log(`Catalog backend listening on http://localhost:${PORT}`);
  console.log(`Serving catalog from ${CATALOG_JSON}`);
  console.log(`Serving files from ${FILES_DIR}`);
});
