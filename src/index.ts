import express from 'express';
import { Router } from 'express';
import { ConfigService } from './services/config';
import { ExchangeCalendarService } from './services/exchange_calendar';
import { calendarRouter } from './routes/calendar';
import { authMiddleware } from './middleware/auth';

const config = ConfigService.loadConfig();

// Initialize the express application
const app = express();
const PORT = process.env.PORT || 3000;

// Apply auth middleware to all routes
app.use(authMiddleware(config.getAuthConfig()));

// Middleware for JSON parsing
app.use(express.json());

// Create a router for API routes
const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
apiRouter.get('/', (req, res) => {
  res.json({ message: 'Welcome to the TypeScript REST API' });
});

// Calendar routes
const exchangeService = new ExchangeCalendarService(config.getExchangeConfig());
apiRouter.use('/calendar', calendarRouter(exchangeService));

// Mount the API router
app.use('/api', apiRouter);

// Default route
app.get('/', (req, res) => {
  res.send('Hello from Express + TypeScript!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`Calendar API available at: http://localhost:${PORT}/api/calendar/:date`);
});

