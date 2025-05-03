import fs from 'fs';
import path from 'path';
import { CalendarConfig, ExchangeConfig, AuthConfig } from '../types/config';

export class ConfigService {
  private static instance: ConfigService;
  private config: CalendarConfig;

  private constructor() {
    const configPath = process.env.CONFIG_PATH || 'config.json';
    const absolutePath = path.resolve(process.cwd(), configPath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Configuration file not found at ${absolutePath}`);
    }

    const fileConfig = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

    // Override with environment variables if present
    this.config = {
      exchange: {
        url: process.env.EXCHANGE_URL || fileConfig.exchange.url,
        username: process.env.EXCHANGE_USERNAME || fileConfig.exchange.username,
        password: process.env.EXCHANGE_PASSWORD || fileConfig.exchange.password
      },
      auth: {
        bearerToken: process.env.AUTH_BEARER_TOKEN || fileConfig.auth.bearerToken
      }
    };
  }

  public static loadConfig(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public getExchangeConfig(): ExchangeConfig {
    return this.config.exchange;
  }

  public getAuthConfig(): AuthConfig {
    return this.config.auth;
  }
} 