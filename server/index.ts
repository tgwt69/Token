import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

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

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Create server instance
const setupServer = async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Check if running on Vercel
  const isVercel = process.env.VERCEL === '1';
  
  // Only setup Vite in development AND not on Vercel
  if (process.env.NODE_ENV === "development" && !isVercel) {
    await setupVite(app, server);
  } else if (!isVercel) {
    // Only try to serve static files when not on Vercel
    try {
      serveStatic(app);
    } catch (error) {
      console.warn("Could not serve static files. Running in API-only mode.");
      
      // Add fallback route to handle all non-API routes with a simple message
      app.use("*", (req, res, next) => {
        if (!req.path.startsWith("/api")) {
          res.status(200).send(`
            <html>
              <head><title>Discord Token Checker API</title></head>
              <body>
                <h1>Discord Token Checker API</h1>
                <p>This is the API server for Discord Token Checker. The frontend is not available in this environment.</p>
              </body>
            </html>
          `);
        } else {
          next();
        }
      });
    }
  }

  return { app, server };
};

// For local development
if (process.env.NODE_ENV !== "production") {
  (async () => {
    const { server } = await setupServer();
    const port = process.env.PORT || 5000;
    
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  })();
}

// Export for Vercel
export default async (req: Request, res: Response) => {
  const { app } = await setupServer();
  return app(req, res);
};
