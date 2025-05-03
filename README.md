# Scripts

A Node.js service that provides data from various sources, currently supporting:
- Microsoft Exchange Server;
- more integrations planned for the future.

## Features

- Fetch calendar events for a specific date
- Support for both required and optional attendees
- Secure authentication with bearer token
- Docker support for easy deployment

## Prerequisites

- Node.js 20 or later
- Yarn package manager
- Access to Microsoft Exchange Server
- Docker (optional, for containerized deployment)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd calendar-service
```

2. Install dependencies:
```bash
yarn install
```

3. Create configuration file:
```bash
cp config.example.json config.json
```

4. Update `config.json` with your Exchange Server credentials:
```json
{
  "exchange": {
    "url": "https://your-exchange-server/EWS/Exchange.asmx",
    "username": "your-username",
    "password": "your-password"
  },
  "auth": {
    "bearerToken": "your-secure-token"
  }
}
```

## Configuration

The service can be configured through:

1. Configuration file (`config.json`)
2. Environment variables:
   - `EXCHANGE_URL`
   - `EXCHANGE_USERNAME`
   - `EXCHANGE_PASSWORD`
   - `AUTH_BEARER_TOKEN`
   - `CONFIG_PATH` (path to config file, defaults to `config.json`)

## Usage

### Local Development

1. Start the development server:
```bash
yarn dev
```

2. Make a request to fetch calendar events:
```bash
curl -H "Authorization: Bearer your-token" http://localhost:3000/api/calendar/2024-03-20
```

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t calendar-service .
```

2. Run the container:
```bash
docker run -p 3000:3000 \
  -v $(pwd)/config.json:/app/config.json \
  calendar-service
```

Or with environment variables:
```bash
docker run -p 3000:3000 \
  -e EXCHANGE_URL=https://your-exchange-server/EWS/Exchange.asmx \
  -e EXCHANGE_USERNAME=your-username \
  -e EXCHANGE_PASSWORD=your-password \
  -e AUTH_BEARER_TOKEN=your-token \
  calendar-service
```

## API Endpoints

### GET /api/calendar/:date

Fetch calendar events for a specific date.

**Parameters:**
- `date`: Date in YYYY-MM-DD format

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "items": [
    {
      "id": "event-id",
      "title": "Meeting",
      "startTime": "2024-03-20T10:00:00Z",
      "endTime": "2024-03-20T11:00:00Z",
      "participants": [
        {
          "email": "user@example.com",
          "fullName": "User Name"
        }
      ],
      "description": "Meeting description"
    }
  ]
}
```

## Development

### Scripts

- `yarn dev`: Start development server with hot reload
- `yarn build`: Build TypeScript code
- `yarn start`: Start production server
- `yarn test`: Run tests
- `yarn lint`: Run linter

### Project Structure

```
src/
  ├── routes/         # API routes
  ├── services/       # Business logic
  ├── middleware/     # Express middleware
  ├── types/          # TypeScript types
  └── index.ts        # Application entry point
```

## Security

- All API endpoints require authentication via bearer token
- Exchange Server credentials are stored securely
- Environment variables override config file values

## License

[Your License Here] 