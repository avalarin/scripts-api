import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createCalendarMcpServer } from './services/mcp';
import { ConfigService } from './services/config';
import { ExchangeCalendarService } from './services/exchange_calendar';

const config = ConfigService.loadConfig();
const exchangeService = new ExchangeCalendarService(config.getExchangeConfig());
const server = createCalendarMcpServer(exchangeService);

const transport = new StdioServerTransport();
server.connect(transport);
