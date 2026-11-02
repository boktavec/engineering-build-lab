import express from "express";
import { authenticate, requireRole } from "./auth.js";
import type { JWTPayload } from "jose";

const projects = [
  { id: "PRJ-101", name: "Atlas Search", owner: "Platform", classification: "internal" },
  { id: "PRJ-202", name: "Orchard Migration", owner: "Data Systems", classification: "confidential" }
];

export function createApp(verify?: (token: string) => Promise<JWTPayload>) {
  const app = express();
  app.use(express.json());
  app.use(express.static(new URL("../public", import.meta.url).pathname));
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  const auth = authenticate(verify);
  app.get("/api/me", auth, (req, res) => res.json({
    username: req.user!.username,
    roles: req.user!.roles
  }));
  app.get("/api/projects", auth, (req, res) => {
    const visible = req.user!.roles.includes("project-manager")
      ? projects
      : projects.filter((project) => project.classification === "internal");
    res.json({ projects: visible });
  });
  app.post("/api/projects", auth, requireRole("project-manager"), (req, res) => {
    const name = req.body?.name;
    if (typeof name !== "string" || !name.trim()) return res.status(400).json({ error: "name must be a non-empty string" });
    const project = { id: `PRJ-${Date.now()}`, name: name.trim(), owner: "New", classification: "internal" };
    projects.push(project);
    res.status(201).json({ project });
  });
  return app;
}
