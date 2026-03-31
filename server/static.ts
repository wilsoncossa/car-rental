import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Client build now emits directly into dist/
  const distPath = path.resolve(__dirname);
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  const uploadsPath = path.resolve(process.cwd(), "uploads");
  if (fs.existsSync(uploadsPath)) {
    app.use("/uploads", express.static(uploadsPath));
  }

  // Serve built public assets (images, icons, etc.) explicitly
  const imagesPath = path.resolve(distPath, "images");
  if (fs.existsSync(imagesPath)) {
    app.use("/images", express.static(imagesPath));
  }

  app.use(express.static(distPath, {
    maxAge: "1y",
    immutable: true,
    index: false,
  }));

  app.use("/{*path}", (_req, res) => {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
