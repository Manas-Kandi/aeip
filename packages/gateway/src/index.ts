import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { CapabilityTokenSchema, ProvenanceRecordSchema, signCT, verifyCT } from '@avs/core';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.post('/mint-ct', async (req, res) => {
  try {
    const { sub, act, res: resource, scope, limits, ttl } = req.body;

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + (ttl || 3600); // default 1 hour expiry
    const jti = Math.random().toString(36).substring(2);

    const ctPayload = {
      iss: 'avs-gateway',
      sub,
      act,
      res: resource,
      scope,
      limits,
      iat,
      exp,
      ver: 'aiep-ct-1',
      jti,
    };

    const parsed = CapabilityTokenSchema.parse(ctPayload);
    const signedJwt = await signCT(parsed);

    res.status(200).json({ token: signedJwt });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/introspect-ct', async (req, res) => {
  try {
    const { token } = req.body;
    const { payload } = await verifyCT(token);
    res.status(200).json({ valid: true, payload });
  } catch (error: any) {
    res.status(400).json({ valid: false, error: error.message });
  }
});

app.post('/ingest-pr', async (req, res) => {
  try {
    const pr = ProvenanceRecordSchema.parse(req.body);
    await prisma.provenanceRecord.create({ data: pr });
    res.status(200).send('Provenance Record ingested');
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Gateway listening on port ${PORT}`);
});
