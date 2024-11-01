# Crypto Price Prediction App

## Project Overview
This is a web application for predicting cryptocurrency prices. It allows users to select a cryptocurrency and a target date for prediction, then provides forecasted data based on machine learning models, including time-series algorithms like LSTM. The purpose of this project is to create a reliable tool that leverages neural networks to analyze historical data and deliver price forecasts for cryptocurrencies.

## Getting Started

### Prerequisites
Ensure you have Node.js and npm installed on your machine.

### Installation
To install the required dependencies for both client and server, run the following command in the root directory:

npm install

Running the Server
The server-side code is located in server.js. To start the server, use:
node server.js

The server will run on port 5001 by default. Make sure that this port is open and accessible.

Running the Client
The client-side application starts from App.js. For development purposes, you can start it with:
npm start

Once started, the app will be available at http://localhost:3000.

Environment Variables
To connect to the cryptocurrency API and configure environment settings, set up a .env file with the necessary API keys and configurations. Ensure that the API used provides at least 365 days of historical data to allow meaningful predictions.

Project Structure
- src/: Contains client-side React components and application logic.
- public/: Static files and assets.
- server.js: Main server file for handling API requests.
- package.json: Defines project dependencies and scripts.

Deployment
For deployment, the following tools are used:

- Nginx: Used as a reverse proxy to manage traffic between the client and server.
- PM2: A process manager to keep the server running in the background.


API Usage
The application uses a free API for accessing cryptocurrency data, limited to the past 365 days. For extended historical data or additional features, consider upgrading to a premium API plan.

Features
- Select cryptocurrency and prediction date.
- Analyze historical data to generate predictions.
- Display of prediction point directly on a time-series chart.

Future Enhancements
- Incorporate additional cryptocurrencies.
- Enable advanced machine learning models for greater accuracy.
- Support for extended prediction timelines by using a premium data API.

Links
- Source Code: [GitHub Repository](https://github.com/7Stanislav/crypto-price-analysis.git)
- Live Project: predictproject.ru

License
This project is licensed under the MIT License.
