import mongoose from "mongoose";

const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  throw new Error("MONGO_URI 환경 변수가 설정되어 있지 않습니다.");
}

declare global {
  var mongooseConnection: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

let cached = global.mongooseConnection;

if (!cached) {
  cached = global.mongooseConnection = { conn: null, promise: null };
}

export async function connectMongo() {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    cached!.promise = mongoose.connect(MONGO_URI!, {
      dbName: process.env.DB_NAME,
    });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}