import express, { type Request } from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const fixturePath = fileURLToPath(new URL('../data/consignments.json', import.meta.url));

export async function listConsignments() {
  let list = JSON.parse(await readFile(fixturePath, 'utf8')) as Array<{
    id: string;
    origin: string;
    destination: string;
    status: string;
    cars: number;
  }>;

  return list
}

type ConsignmentStatusQuery = Request['query']['status'] | null;

export const validateStatus = (status: ConsignmentStatusQuery): { err: string } | undefined => {
  if (status === null || status === undefined || status === '') {
    return { err: 'No status was provided.' };
  }

  const validStatuses = ['scheduled', 'loading', 'in_transit', 'yard', 'delayed', 'delivered', 'cancelled'];

  if (typeof status !== 'string' || !validStatuses.includes(status)) {
    return { err: `Invalid status '${status}'.` };
  }
}

export function createApp() {
  const app = express();

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.get('/consignments', async (_request, response) => {
    const paramStatus = _request.query.status
    let list = await listConsignments()

    if (paramStatus == undefined) {
      return response.json(list)
    }

    const isValid = validateStatus(paramStatus)
    if (isValid) {
      return response.status(400).json({error: isValid.err})
    }

    list = list.filter(list => list.status === paramStatus)
    if (list.length == 0) {
      return response.status(200).json([])
    }

    response.json(list);
  });

  app.get('/consignments/:id', async (request, response) => {
    const consignment = (await listConsignments()).find((item) => item.id === request.params.id);
    if (!consignment) {
      response.status(404).json({ error: 'Consignment not found' });
      return;
    }
    response.json(consignment);
  });

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 3000);
  createApp().listen(port, () => console.log(`Rail yard API listening on http://localhost:${port}`));
}
