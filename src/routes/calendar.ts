import { Router, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ExchangeCalendarService } from '../services/exchange_calendar';

// Define interface for request params
interface CalendarParams extends ParamsDictionary {
  date: string;
  username: string;
}

export function calendarRouter(exchangeService: ExchangeCalendarService): Router {
  // Create a router instance
  const router = Router();

  // GET route for calendar events by date
  const getCalendarEvents: RequestHandler<CalendarParams> = async (req, res) => {
    const { date, username } = req.params;

    const timezone = req.headers['x-timezone'] as string || 'UTC';
    const eventDate = new Date(date);
    
    // Check if the date is valid
    if (isNaN(eventDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD.' });
      return;
    }

    try {
      // Only pass username if it's not the default route
      const events = await exchangeService.getEventsForDate(
        eventDate,
        username
      );
      
      // Convert event times to specified timezone in ISO format
      const eventsWithTimezone = events.map(event => {
        const startDate = new Date(event.startTime);
        const endDate = new Date(event.endTime);
        
        return {
          ...event,
          startTime: startDate.toLocaleString('sv', { timeZone: timezone }),
          endTime: endDate.toLocaleString('sv', { timeZone: timezone })
        };
      });

      res.json({
        items: eventsWithTimezone
      });
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
  };

  // Route for getting events from a specific user's calendar
  router.get('/:username/:date', getCalendarEvents);
  // Route for getting events from the current user's calendar
  router.get('/:date', getCalendarEvents);

  return router;
}

