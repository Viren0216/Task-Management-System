import express, { Application, Request, Response } from 'express';
// Allows us to avoid writing standard Try/Catch blocks in all async controller functions
// It automatically catches async exceptions and passes them to our Express `next()` error chain
import 'express-async-errors';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import { NotFoundError } from './errors/NotFoundError';
import appRoutes from './routes';

const app: Application = express();

/** -------- BASE MIDDLEWARE -------- */
// Restrict Cross-Origin access — allow Vite dev server origin with credentials
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));
// Parse incoming JSON request body payload streams
app.use(express.json());
// Log incoming HTTP requests
app.use(requestLogger);

/** -------- API ENDPOINTS -------- */
// Mount central application router under /api/v1
app.use('/api/v1', appRoutes);

// Simple service ping to verify container health or availability status (at root level)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Task Manager Backend is healthy' });
});

/** -------- NOT FOUND / CATCH ALL -------- */
// Catch any client requesting an unknown path endpoint anywhere internally
app.all('*', (req: Request, res: Response) => {
  throw new NotFoundError(`HTTP endpoint ${req.method} ${req.originalUrl} not found`);
});

/** -------- GLOBAL ERROR INTERCEPTOR -------- */
// Must be registered absolute last to intercept all next/throws
app.use(errorHandler);

export default app;
