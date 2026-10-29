import express from "express";
import crypto from "crypto"
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const verifySignature = (secret: string, body: Buffer, receivedSignature: string): boolean => {
  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest()

  if (!/^[0-9a-f]{64}$/i.test(receivedSignature)) return false;

  const received = Buffer.from(receivedSignature, "hex");

  return crypto.timingSafeEqual(received, expectedSignature)
}

const isWebhook = (data: unknown): data is WebhookRequest => {

  if(typeof data != 'object' || data == null) {
    return false
  }

  const obj = data as Record<string, unknown>

  if (typeof obj.eventId != 'string') return false
  if (typeof obj.turbineId != 'string') return false
  if (typeof obj.status != 'string') return false
  if (typeof obj.reportedAt != 'string') return false
  if (typeof obj.windSpeedMps != 'number') return false

  return true

}

const updateInfo = (body: WebhookRequest, turbine: Turbine, events: WebhookRequest[]) => {
    events.push(body)
    turbine.status = body.status
    turbine.reportedAt = body.reportedAt
    turbine.windSpeedMps = body.windSpeedMps
}


export type Turbine = {
  id: string;
  site: string;
  status: string;
  reportedAt: string;
  windSpeedMps: number;
};

type RequestWithRawBody = { rawBody?: Buffer };

export type WebhookRequest = Omit<Turbine, "id" | "site"> & { eventId: string, turbineId: string }

export const turbines: Turbine[] = [
  { id: "T-1001", site: "North Ridge", status: "operational", reportedAt: "2025-04-03T10:15:00Z", windSpeedMps: 8.4 },
  { id: "T-1002", site: "North Ridge", status: "operational", reportedAt: "2025-04-03T10:12:00Z", windSpeedMps: 7.9 },
  { id: "T-2001", site: "Coastal Point", status: "maintenance", reportedAt: "2025-04-03T09:50:00Z", windSpeedMps: 0 },
];

export const events: WebhookRequest[] = []

export const app = express();
app.use(express.json({verify(req, _res, buf) {
     (req as typeof req & RequestWithRawBody).rawBody = Buffer.from(buf);
   }}));

app.get("/turbines", (_req, res) => res.json(turbines));

app.get("/turbines/:id", (req, res) => {
  const turbine = turbines.find(({ id }) => id === req.params.id);
  if (!turbine) return res.status(404).json({ error: "Turbine not found" });
  return res.json(turbine);
});

app.post("/webhooks/telemetry", (req, res) => {
  // validate signature
  const hmacSecret = process.env.HMAC_SECRET
  const headerSignature = req.header("x-telemetry-signature")
  const rawBody = (req as typeof req & RequestWithRawBody).rawBody;

  if(!(hmacSecret && headerSignature && rawBody)) {
    console.log("No HMAC Secret loaded to server or signature from payload is missing")
    return res.status(401).json({ err: "Missing webhook signature" })
  }

  if (!verifySignature(hmacSecret, rawBody, headerSignature)) {
    console.log("Signatures did not match - rejected payload")
    return res.status(401).json({ err: "Invalid webhook signature" })
  }

  // if signed but invalid payload or unknown turbine reject with server error
  if(!isWebhook(req.body)) {
    console.log("invalid payload")
    return res.status(400).json({ err: "Invalid webhook payload" })
  }

  const turbine = turbines.find(({ id }) => id === req.body.turbineId);
  if (!turbine) return res.status(404).json({ error: "Turbine not found" });

  // if duplicate event discard return 200
  const event = events.find(({eventId}) => eventId === req.body.eventId);
  if (event) return res.status(200).json({ msg: "Duplicate event acknowledged" })

  // new event but date old
  const isYounger = turbines.filter((x) => x.id == req.body.turbineId && x.reportedAt > req.body.reportedAt)
  if(isYounger.length > 0) return res.status(409).json({ err: "Stale reading" })

  // update turbine list
  updateInfo(req.body, turbine, events)
  res.status(200).json({ msg: "Telemetry accepted" })

})
