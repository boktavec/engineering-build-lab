import express from 'express';

export interface Reading {
  id: string;
  fieldId: string;
  moisture: number;
  recordedAt: string;
}

interface CachedData {
  readings: Reading[];
  insertedAt: number;
}

const fields = [
  { id: 'field-north', name: 'North Acre', crop: 'barley' },
  { id: 'field-south', name: 'South Acre', crop: 'oats' },
];

const readings: Reading[] = [
  { id: 'r-100', fieldId: 'field-north', moisture: 31.4, recordedAt: '2025-04-10T08:00:00Z' },
  { id: 'r-101', fieldId: 'field-north', moisture: 29.8, recordedAt: '2025-04-10T12:00:00Z' },
  { id: 'r-102', fieldId: 'field-south', moisture: 34.1, recordedAt: '2025-04-10T09:30:00Z' },
];


class Cache {
  private cache
  public ttl

  constructor(ttl: number) {
    this.cache = new Map<string, CachedData>()
    this.ttl = ttl
  }

  add(data: Reading) {
    data.insertedAt = Math.floor(Date.now()/1000)
    let existingList = this.cache.get(data.readings?.[0].id)
    let updateList = [data, existingList...]
    this.cache.set(data.id, data)
  }

  update(data: CachedData) {
    data.insertedAt = Math.floor(Date.now()/1000)
    this.cache.set(data.id, data)
  }

  delete(id: string) {
    this.cache.delete(id)
  }

  get(id: string) {
    let ttlInSecs = this.ttl*60
    let timeNow = Math.floor(Date.now()/1000)

    let reading = this.cache.get(id)

    if (!reading) {
      console.log("no entry for id")
      return 1
    }

    if ((timeNow-ttlInSecs) > reading.insertedAt) {
      console.log("ttl expired pull new one")
      return 2
    }

    return reading

  }


}

let ttl: number = 5

const cache = new Cache(ttl)

export const app = express();
app.use(express.json());

app.get('/health', (_request, response) => response.json({ status: 'ok' }));

app.get('/api/fields', (_request, response) => response.json(fields));

app.get('/api/fields/:fieldId/readings', (request, response) => {
  const field = fields.find(({ id }) => id === request.params.fieldId);
  if (!field) return response.status(404).json({ error: 'Field not found' });
  return response.json(readings.filter(({ fieldId }) => fieldId === field.id));
});

app.post('/api/fields/:fieldId/readings', (request, response) => {
  const field = fields.find(({ id }) => id === request.params.fieldId);
  if (!field) return response.status(404).json({ error: 'Field not found' });

  const { moisture, recordedAt } = request.body ?? {};
  if (typeof moisture !== 'number' || !Number.isFinite(moisture) || moisture < 0 || moisture > 100) {
    return response.status(400).json({ error: 'moisture must be a number from 0 to 100' });
  }
  if (typeof recordedAt !== 'string' || Number.isNaN(Date.parse(recordedAt))) {
    return response.status(400).json({ error: 'recordedAt must be a valid date string' });
  }

  const reading: Reading = {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fieldId: field.id,
    moisture,
    recordedAt: new Date(recordedAt).toISOString(),
  };
  readings.push(reading);
  return response.status(201).json(reading);
});
