// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = 5001;

app.get("/api/price/:pair", async (req, res) => {
  const { pair } = req.params;
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${pair}&vs_currencies=usd`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching price data:", error);
    res.status(500).json({ error: "Error fetching price data" });
  }
});

app.get("/api/price-history/:pair", async (req, res) => {
  const { pair } = req.params;
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${pair}/market_chart?vs_currency=usd&days=7`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching price history data:", error);
    res.status(500).json({ error: "Error fetching price history data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
