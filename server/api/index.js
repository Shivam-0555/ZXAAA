// Vercel Serverless Function entry point.
// Imports the Express app and connects to MongoDB on every cold start.

import app, { connectDB } from '../server.js';

// Connect to DB (idempotent — safe to call on every cold start)
await connectDB();

export default app;
