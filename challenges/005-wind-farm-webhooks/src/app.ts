import express from "express";

export type Turbine = {
  id: string;
  site: string;
  status: string;
  reportedAt: string;
  windSpeedMps: number;
};

export const turbines: Turbine[] = [
  { id: "T-1001", site: "North Ridge", status: "operational", reportedAt: "2025-04-03T10:15:00Z", windSpeedMps: 8.4 },
  { id: "T-1002", site: "North Ridge", status: "operational", reportedAt: "2025-04-03T10:12:00Z", windSpeedMps: 7.9 },
  { id: "T-2001", site: "Coastal Point", status: "maintenance", reportedAt: "2025-04-03T09:50:00Z", windSpeedMps: 0 },
];

export const app = express();
app.use(express.json());

app.get("/turbines", (_req, res) => res.json(turbines));

app.get("/turbines/:id", (req, res) => {
  const turbine = turbines.find(({ id }) => id === req.params.id);
  if (!turbine) return res.status(404).json({ error: "Turbine not found" });
  return res.json(turbine);
});
