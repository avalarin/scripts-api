import { Router, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ExchangeCalendarService } from '../services/exchange_calendar';

// Define interface for request params
interface CalendarParams extends ParamsDictionary {
  date: string;
}

export function calendarRouter(exchangeService: ExchangeCalendarService): Router {
  // Create a router instance
  const router = Router();

  // GET route for calendar events by date
  const getCalendarEvents: RequestHandler<CalendarParams> = async (req, res) => {
    const { date } = req.params;
    const eventDate = new Date(date);
    
    // Check if the date is valid
    if (isNaN(eventDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD.' });
      return;
    }

    try {
      const events = await exchangeService.getEventsForDate(eventDate);
      res.json({
        items: events
      });
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
  };

  router.get('/:date', getCalendarEvents);

  return router;
}

