# FDE Metrics Dashboard

A comprehensive logistics analytics dashboard for tracking call performance, load data, and freight delivery efficiency metrics.

## Overview

FDE Metrics is a modern web application built with Next.js that provides real-time analytics and insights for freight logistics operations. The dashboard helps transportation companies track their sales calls performance, manage load data, and visualize key performance indicators to make data-driven decisions.

## Features

### nteractive Dashboard
- **Call Performance Metrics**: Track win rates, total revenue, and average rates
- **Real-time Charts**: Visualize outcomes, sentiment analysis, equipment types, and daily trends
- **Rate Analysis**: Compare initial vs final rates with interactive charts

### Data Tables
- **Calls Table**: Detailed view of all sales calls with filtering and sorting
- **Loads Table**: Comprehensive load management with pickup/delivery tracking


## Technology Stack

- **Frontend**: Next.js 15.4.6, React 19.1.0, TypeScript
- **Charts**: Recharts for interactive data visualization
- **Styling**: CSS Modules with CSS custom properties
- **Icons**: Lucide React, React Icons
- **Deployment**: Fly.io

## Data Structure

### Calls Data
- Call ID, creation date, MC number
- Origin and destination locations
- Equipment type, pickup/delivery dates
- Initial and final rates
- Call outcome (won/lost)
- Sentiment analysis (positive/negative/neutral)

### Loads Data
- Load ID, origin/destination
- Equipment type and specifications
- Pickup and delivery dates
- Loadboard rates, miles, weight
- Additional notes and metadata

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/IUrreta/fdeMetrics.git
cd fdepanel
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
NEXT_PUBLIC_API_URL=your_api_base_url
NEXT_PUBLIC_API_KEY=your_api_key
API_BASE_URL=your_api_base_url
API_KEY=your_api_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

The application connects to the following API endpoints:

- `GET /api/calls` - Retrieve calls data
- `GET /api/loads` - Retrieve loads data with optional filtering

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── calls/route.ts     # Calls API endpoint
│   │   └── loads/route.ts     # Loads API endpoint
│   ├── components/            # Reusable components
│   ├── globals.css           # Global styles and themes
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main dashboard page
├── public/                   # Static assets
└── ...config files
```

## Deployment

The application is configured for deployment on Fly.io:

```bash
flyctl deploy
```

For other platforms, refer to the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
