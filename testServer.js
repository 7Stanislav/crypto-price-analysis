const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5001;

// Включаем CORS
app.use(cors());

// Простой эндпоинт для проверки
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
