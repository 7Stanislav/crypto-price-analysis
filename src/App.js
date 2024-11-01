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
  Filler,
} from "chart.js";
import * as tf from "@tensorflow/tfjs";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);

function App() {
  const [pair, setPair] = useState("bitcoin");
  const [priceData, setPriceData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [futureDate, setFutureDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [error, setError] = useState("");

  const cryptoOptions = [
    { value: "bitcoin", label: "Bitcoin" },
    { value: "ethereum", label: "Ethereum" },
    { value: "dogecoin", label: "Dogecoin" },
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
        setError("Error fetching data");
      }
    };

    fetchPriceHistory();
  }, [pair]);

  const handleForecast = async () => {
    if (!futureDate) return;

    setLoading(true);
    const startTime = Date.now();
    const daysToForecast = Math.ceil(
      (new Date(futureDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysToForecast > 90) {
      alert("Maximum forecasting period is 90 days.");
      setLoading(false);
      return;
    }

    if (priceData.length < 365) {
      alert("Insufficient data for model training (365 days required)");
      setLoading(false);
      return;
    }

    const trainingData = priceData.slice(-365);
    const xs = tf.tensor3d(trainingData.slice(0, -1).map((price) => [[price]]));
    const ys = tf.tensor2d(trainingData.slice(1).map((price) => [price]));

    const model = tf.sequential();
    model.add(tf.layers.lstm({ units: 20, inputShape: [1, 1], dropout: 0.2 }));
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({ loss: "meanSquaredError", optimizer: "adam" });

    await model.fit(xs, ys, {
      epochs: 100,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(
            0,
            (100 - epoch) * (elapsed / (epoch + 1))
          );
          setTimeRemaining(Math.ceil(remaining / 1000));
        },
      },
    });

    let lastPrice = trainingData[trainingData.length - 1];
    let futurePrice = lastPrice;

    // Apply deviations increasing every 3 days
    for (let i = 0; i < daysToForecast; i++) {
      const input = tf.tensor3d([[[futurePrice]]]);
      const basePrediction = model.predict(input).dataSync()[0];

      const deviationPercentage = Math.min(30, Math.floor(i / 3) + 1); // Deviation 1% every 3 days, max 30%
      const deviationFactor = deviationPercentage / 100;

      // Generate random deviation within the deviation range
      const randomDeviation =
        1 + (Math.random() * deviationFactor * 2 - deviationFactor);
      futurePrice = basePrediction * randomDeviation;

      // Limit future price within ±30% of the current price
      const lowerBound = lastPrice * 0.7;
      const upperBound = lastPrice * 1.3;
      futurePrice = Math.max(lowerBound, Math.min(futurePrice, upperBound));
    }

    setPredictedPrice(futurePrice);
    setLoading(false);
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
        max={
          new Date(new Date().setDate(new Date().getDate() + 90))
            .toISOString()
            .split("T")[0]
        }
      />
      <button onClick={handleForecast}>Forecast</button>

      {loading && <p>Time remaining: {timeRemaining} seconds</p>}
      {predictedPrice !== null && (
        <p>
          Predicted price on {futureDate} - ${predictedPrice.toFixed(2)}
        </p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {priceData.length > 0 && (
        <Line
          data={{
            labels: [
              ...labels,
              new Date(futureDate).toLocaleDateString(), // Add only the selected date
            ],
            datasets: [
              {
                label: `${pair} Price (USD)`,
                data: [
                  ...priceData,
                  ...Array(1).fill(null), // Filling space for current price
                ],
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: false,
              },
              {
                label: "Predicted Price",
                data: [
                  ...Array(priceData.length).fill(null), // Filling spaces for historical data
                  predictedPrice, // Use only the predicted price
                ],
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderDash: [5, 5],
                pointRadius: 5, // Set point radius
                pointHoverRadius: 7, // Increase radius on hover
                fill: false, // Do not fill area under the graph
              },
            ],
          }}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                suggestedMax: Math.max(...priceData) * 1.1,
              },
            },
            elements: {
              line: {
                tension: 0,
              },
            },
          }}
        />
      )}
    </div>
  );
}

export default App;
