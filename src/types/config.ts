export interface ExchangeConfig {
  url: string;
  username: string;
  password: string;
}

export interface AuthConfig {
  bearerToken: string;
}

export interface CalendarConfig {
  exchange: ExchangeConfig;
  auth: AuthConfig;
}
