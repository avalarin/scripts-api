import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ExchangeCalendarService } from './exchange_calendar';
import { CalendarEvent } from '../types/calendar';
import { parseDateFromString } from '../presentation/datetime';

export const createCalendarMcpServer = (calendarService: ExchangeCalendarService) => {
  const server = new McpServer({
    name: 'Microsoft Exchange Calendar',
    version: '1.0.0',
  });

  server.tool(
    'listCalendarEvents',
    'List calendar events for a given date and username',
    {
      username: z.string(),
      date: z.string(),
    },
    {
      readOnlyHint: true,
    },
    async ({ username, date }) => {
      const parsedDate = parseDateFromString(date);

      const events = await calendarService.getEventsForDate(parsedDate, username);

      return {
        content: [{ type: 'text', text: prepareCalendarEvents(events) }],
      };
    }
  );

  return server;
};

const prepareCalendarEvents = (events: CalendarEvent[]) => {
  return JSON.stringify(events, null, 2);
};
