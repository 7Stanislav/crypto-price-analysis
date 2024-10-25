// src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";

function App() {
  const [pair, setPair] = useState("bitcoin");
  const [priceData, setPriceData] = useState([]);
  const [labels, setLabels] = useState([]);

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

    if (pair) fetchPriceHistory();
  }, [pair]);

  return (
    <div>
      <h1>Crypto Price Analysis</h1>
      <select value={pair} onChange={(e) => setPair(e.target.value)}>
        <option value="bitcoin">Bitcoin</option>
        <option value="ethereum">Ethereum</option>
        <option value="dogecoin">Dogecoin</option>
      </select>

      {priceData.length > 0 && (
        <Line
          data={{
            labels: labels,
            datasets: [
              {
                label: `${pair} Price (USD)`,
                data: priceData,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
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
