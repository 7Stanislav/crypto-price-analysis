import React, { useState, useEffect } from "react";
import axios from "axios";
import * as tf from "@tensorflow/tfjs";

function App() {
  const [futureDate, setFutureDate] = useState("2024-11-24");
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [priceData, setPriceData] = useState([]);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/price-history/bitcoin"
        );
        const prices = response.data.prices.map((item) => item[1]);

        if (prices.length < 365) {
          setError(
            "Недостаточно данных для обучения модели (необходимы 365 дней)"
          );
          return;
        }

        setPriceData(prices);
      } catch (err) {
        console.error("Ошибка при получении данных:", err);
        setError("Ошибка при получении данных");
      }
    };

    fetchPriceHistory();
  }, []);

  const trainModel = async () => {
    if (priceData.length < 365) {
      setError("Недостаточно данных для обучения модели");
      return;
    }

    // Подготовка данных для обучения с нормализацией
    const trainingData = priceData.slice(-365); // Берем последние 365 значений
    const minPrice = Math.min(...trainingData);
    const maxPrice = Math.max(...trainingData);
    const normalizedData = trainingData.map(
      (price) => (price - minPrice) / (maxPrice - minPrice)
    );

    const xs = [];
    const ys = [];

    for (let i = 0; i < normalizedData.length - 1; i++) {
      xs.push([[normalizedData[i]]]); // Каждую цену оборачиваем в массив
      ys.push([normalizedData[i + 1]]);
    }

    console.log("Обучающие данные:", normalizedData); // Логируем обучающие данные
    console.log("xs:", xs); // Логируем xs
    console.log("ys:", ys); // Логируем ys

    try {
      const xsTensor = tf.tensor3d(xs); // 3D тензор
      const ysTensor = tf.tensor2d(ys); // 2D тензор

      console.log("xs shape:", xsTensor.shape);
      console.log("ys shape:", ysTensor.shape);

      const model = tf.sequential();
      model.add(
        tf.layers.lstm({ units: 20, inputShape: [1, 1], dropout: 0.2 })
      );
      model.add(tf.layers.dense({ units: 1 }));
      model.compile({ loss: "meanSquaredError", optimizer: "adam" });

      setLoading(true);
      await model.fit(xsTensor, ysTensor, {
        epochs: 100,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
          },
        },
      });

      const forecastPrice = await predictFuturePrice(
        model,
        normalizedData,
        minPrice,
        maxPrice
      );
      setPredictedPrice(forecastPrice);
      setLoading(false);
    } catch (err) {
      console.error("Ошибка при обучении модели:", err);
      setError("Ошибка при обучении модели. Проверьте данные.");
      setLoading(false);
    }
  };

  const predictFuturePrice = async (
    model,
    normalizedData,
    minPrice,
    maxPrice
  ) => {
    let lastPrice = normalizedData[normalizedData.length - 1];
    const daysToForecast = Math.ceil(
      (new Date(futureDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    for (let i = 0; i < daysToForecast; i++) {
      const input = tf.tensor3d([[[lastPrice]]]); // 3D тензор
      lastPrice = model.predict(input).dataSync()[0];
    }

    // Декодируем нормализованное значение в исходное
    return lastPrice * (maxPrice - minPrice) + minPrice;
  };

  return (
    <div>
      <h1>Прогнозируемая цена Bitcoin на {futureDate}</h1>
      <input
        type="date"
        value={futureDate}
        onChange={(e) => setFutureDate(e.target.value)}
      />
      <button onClick={trainModel}>Прогнозировать</button>
      {loading && <p>Загрузка...</p>}
      {predictedPrice !== null && (
        <p>
          Прогнозируемая цена на {futureDate} - ${predictedPrice.toFixed(2)}
        </p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;
