import express from 'express';
import { Router } from 'express';
import { ConfigService } from './services/config';
import { ExchangeCalendarService } from './services/exchange_calendar';
import { calendarRouter } from './routes/calendar';
import { mcpRouter } from './routes/mcp';
import { authMiddleware } from './middleware/auth';

const config = ConfigService.loadConfig();

// Initialize the express application
const app = express();
const PORT = process.env.PORT || 3000;

// Apply auth middleware to all routes
app.use(authMiddleware(config.getAuthConfig()));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Add error logging middleware
app.use((err: Error, req: express.Request, res: express.Response, _: express.NextFunction) => {
  console.error(`Request error:`, err);
  res.status(500).json({ error: 'Internal server error' });
});

// Middleware for JSON parsing
app.use(express.json());

// Create a router for API routes
const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Calendar routes
const exchangeService = new ExchangeCalendarService(config.getExchangeConfig());
apiRouter.use('/calendar', calendarRouter(exchangeService));

// MCP route
apiRouter.use('/mcp', mcpRouter(exchangeService));

// Mount the API router
app.use('/api', apiRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`Calendar API available at: http://localhost:${PORT}/api/calendar/:date`);
  console.log(`MCP API available at: http://localhost:${PORT}/api/mcp`);
});
