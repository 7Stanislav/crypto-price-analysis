import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

function App() {
  const [pair, setPair] = useState("bitcoin");
  const [priceData, setPriceData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [futureDate, setFutureDate] = useState("");
  const [forecastedPrices, setForecastedPrices] = useState([]);

  // Список доступных криптовалют
  const cryptoOptions = [
    { value: "bitcoin", label: "Bitcoin" },
    { value: "ethereum", label: "Ethereum" },
    { value: "dogecoin", label: "Dogecoin" },
    { value: "litecoin", label: "Litecoin" },
    { value: "ripple", label: "Ripple" },
  ];

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/price-history/${pair}`
        );
        const prices = response.data.prices.map((item) => item[1]);
        const timestamps = response.data.prices.map((item) =>
          new Date(item[0]).toLocaleDateString()
        );

        setPriceData(prices);
        setLabels(timestamps);
      } catch (error) {
        console.error("Error fetching price history:", error);
      }
    };

    fetchPriceHistory();
  }, [pair]);

  const handleForecast = () => {
    if (!futureDate) return;

    let lastPrice = priceData[priceData.length - 1];
    const futurePrices = [];
    const daysToForecast = Math.ceil(
      (new Date(futureDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    for (let i = 0; i < daysToForecast; i++) {
      const forecastPrice = lastPrice * (1 + (Math.random() - 0.5) * 0.1); // случайный прогноз на 10%
      futurePrices.push(forecastPrice);
      lastPrice = forecastPrice;
    }

    setForecastedPrices(futurePrices);
  };

  return (
    <div>
      <h1>Crypto Price Analysis</h1>
      <select value={pair} onChange={(e) => setPair(e.target.value)}>
        {cryptoOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={futureDate}
        onChange={(e) => setFutureDate(e.target.value)}
      />
      <button onClick={handleForecast}>Прогнозировать</button>

      {priceData.length > 0 && (
        <Line
          data={{
            labels: [
              ...labels,
              ...Array.from({ length: forecastedPrices.length }, (_, i) =>
                new Date(
                  Date.now() + (i + 1) * 24 * 60 * 60 * 1000
                ).toLocaleDateString()
              ),
            ],
            datasets: [
              {
                label: `${pair} Price (USD)`,
                data: [
                  ...priceData,
                  ...Array(forecastedPrices.length).fill(null),
                ],
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
              },
              {
                label: "Прогнозная цена",
                data:
                  forecastedPrices.length > 0
                    ? [
                        ...Array(priceData.length).fill(null),
                        ...forecastedPrices,
                      ]
                    : [],
                borderColor: "rgba(255, 99, 132, 1)", // Цвет для прогнозной линии
                backgroundColor: "rgba(255, 99, 132, 0.2)", // Полупрозрачный фон
                borderDash: [5, 5], // Дашевая линия для прогнозной цены
              },
            ],
          }}
          options={{ responsive: true }}
        />
      )}
    </div>
  );
}

export default App;
