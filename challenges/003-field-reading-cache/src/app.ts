import express from 'express';

export interface Reading {
  id: string;
  fieldId: string;
  moisture: number;
  recordedAt: string;
}

interface CachedData {
  reading: Reading;
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


export class Cache {
  private cache
  public ttl: number
  public publicReadings: Reading[]

  constructor(readings: Reading[], ttl?: number) {
    this.cache = new Map<string, CachedData[]>()
    this.ttl = ttl ? ttl*60 : 2*60
    this.publicReadings = readings
    this.publicReadings.forEach((x: Reading) => this.add(x,  Math.floor(Date.now()/1000)))
  }

  add(data: Reading, time: number) {
    let id = data.fieldId
    let cacheData: CachedData = {reading: data, insertedAt: time}
    let existingList = this.cache.get(id)

    if(existingList) {
      existingList.push(cacheData)
      this.cache.set(id, existingList)
      return
    }

    this.cache.set(id, [cacheData])
  }

  reload(id: string, time: number) {
    const refreshed = this.publicReadings
      .filter((reading) => reading.fieldId === id)
      .map((reading) => ({ reading, insertedAt: time }))
    this.cache.set(id, refreshed)
    return refreshed
  }

  delete(id: string) {
    this.cache.delete(id)
    return 0
  }

  removeExpired(id: string) {
    const readings = this.cache.get(id)
    const time = Math.floor(Date.now() / 1000)
    const expired = time - this.ttl

    if (!readings || readings.length === 0 || readings.some((reading) => reading.insertedAt < expired)) {
      return this.reload(id, time)
    }

    return readings
  }

  get(id: string) {
    return this.removeExpired(id).map(({ reading }) => reading)
  }
}

let ttl: number = 5

const cache = new Cache(readings, ttl)

export const app = express();

app.use(express.json());

app.get('/health', (_request, response) => response.json({ status: 'ok' }));

app.get('/api/fields', (_request, response) => response.json(fields));

app.get('/api/fields/:fieldId/readings', (request, response) => {
  const field = fields.find(({ id }) => id === request.params.fieldId);
  if (!field) return response.status(404).json({ error: 'Field not found' });

  let readings = cache.get(field.id)

  return response.json(readings)
});

app.post('/api/fields/:fieldId/readings', (request, response) => {
  const time =  Math.floor(Date.now()/1000)
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
  readings.push(reading)
  cache.add(reading, time)
  return response.status(201).json(reading);
});
