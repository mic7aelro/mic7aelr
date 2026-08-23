import { MongoClient, ServerApiVersion } from 'mongodb';

declare global {
  var portfolioMongoClient: Promise<MongoClient> | undefined;
}

function isMongoConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

/** Connect to the shared portfolio database. Reuses one client across every feature. */
async function getDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured.');

  if (!global.portfolioMongoClient) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      maxIdleTimeMS: 10_000,
      serverSelectionTimeoutMS: 5_000,
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    });
    global.portfolioMongoClient = client.connect();
  }

  const client = await global.portfolioMongoClient;
  return client.db(process.env.MONGODB_DB || 'portfolio');
}

export function isWritingConfigured() {
  return isMongoConfigured();
}

export async function getWritingDatabase() {
  return getDatabase();
}

export function isFantasyConfigured() {
  return isMongoConfigured();
}

export async function getFantasyDatabase() {
  return getDatabase();
}
