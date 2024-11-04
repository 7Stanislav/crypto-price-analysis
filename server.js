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
    console.error("Ошибка при получении данных о цене:", error);
    res.status(500).json({ error: "Ошибка при получении данных о цене" });
  }
});

app.get("/api/price-history/:pair", async (req, res) => {
  const { pair } = req.params;
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${pair}/market_chart?vs_currency=usd&days=365`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Ошибка при получении данных о ценах за историю:", error);
    res
      .status(500)
      .json({ error: "Ошибка при получении данных о ценах за историю" });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
