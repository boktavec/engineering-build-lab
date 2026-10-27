import express from 'express';

export interface Reading {
  id: string;
  fieldId: string;
  moisture: number;
  recordedAt: string;
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
