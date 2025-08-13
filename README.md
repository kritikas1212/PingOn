PingOn
A real-time website monitoring dashboard to track uptime, response time, and SSL certificate health, with instant alerts and a clean, responsive UI.

Live Demo: [https://pingon.netlify.app/](url)

Overview

PingOn helps you stay informed about your websites’ availability and performance. It continuously monitors endpoints, updates data in real time, and alerts you instantly when downtime, latency spikes, or SSL issues occur.

Features

Real-Time Monitoring – Track uptime, latency, and SSL status instantly.

WebSocket Updates – Live data streaming without page reloads.

Instant Alerts – Email and Slack webhook integration for downtime, latency spikes, or certificate issues.

Interactive UI – Live status indicators, latency graphs, and SSL expiry warnings.

Responsive Design – Works seamlessly across desktops, tablets, and mobile devices.

Tech Stack
Frontend: Vite, JavaScript, TypeScript, Tailwind CSS

Real-Time Communication: WebSockets

Alerts & Notifications: Email & Slack Webhooks

Hosting: Netlify

Installation
Clone the repository:




git clone https://github.com/username/pingon.git
cd pingon
Install dependencies:

npm install
Create a .env file and configure your environment variables:

env

SLACK_WEBHOOK_URL=your_slack_webhook  
EMAIL_SERVICE_API_KEY=your_email_service_key  

Start the development server:
npm run dev

Usage
Add website URLs to monitor.

View real-time uptime and latency graphs.

Receive alerts for downtime, performance issues, or SSL expiry.
