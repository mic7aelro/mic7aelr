import { MongoClient, ServerApiVersion } from 'mongodb';

declare global {
  var writingMongoClient: Promise<MongoClient> | undefined;
}

export function isWritingConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

export async function getWritingDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured.');

  if (!global.writingMongoClient) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      maxIdleTimeMS: 10_000,
      serverSelectionTimeoutMS: 5_000,
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    });
    global.writingMongoClient = client.connect();
  }

  const client = await global.writingMongoClient;
  return client.db(process.env.MONGODB_DB || 'portfolio');
}
