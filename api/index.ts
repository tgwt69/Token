import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

// Create an Express app for Vercel
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS headers for Vercel deployment
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Initialize the routes once
let routesInitialized = false;
let routedApp: express.Express | null = null;

async function getRoutedApp() {
  if (!routesInitialized) {
    const server = await registerRoutes(app);
    routedApp = app;
    routesInitialized = true;
  }
  return routedApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Adapt Vercel's request/response to Express
  const expressApp = await getRoutedApp();
  
  // Manually dispatch the request to the appropriate route handlers
  return new Promise((resolve, reject) => {
    // This is a workaround for TypeScript's type checking
    const expressAppAny = expressApp as any;
    expressAppAny(req as any, res as any, (err: any) => {
      if (err) {
        console.error("Error handling request:", err);
        res.status(500).json({ error: "Internal Server Error" });
        reject(err);
        return;
      }
      resolve(undefined);
    });
  });
}