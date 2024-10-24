const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5001; // Убедитесь, что используете правильный порт

app.use(cors());

app.get("/", (req, res) => {
  res.send("Сервер работает!");
});

// Здесь можно добавить другие маршруты

app.get("/api/price/:symbol", async (req, res) => {
  const symbol = req.params.symbol;

  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при получении данных с API");
  }
});


app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
