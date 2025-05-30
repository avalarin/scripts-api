export interface ExchangeConfig {
  url: string;
  username: string;
  password: string;
  emailDomain: string;
}

export interface AuthConfig {
  bearerToken: string;
}

export interface CalendarConfig {
  exchange: ExchangeConfig;
  auth: AuthConfig;
}
