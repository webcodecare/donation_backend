// src/server.ts
import express from 'express';
import cors from 'cors';
// ... other imports

const app = express();

// Your middleware
app.use(cors());
app.use(express.json());
// ... your routes

// ✅ IMPORTANT: Export the app for Vercel
export default app;

// ✅ Only listen when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 9000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
