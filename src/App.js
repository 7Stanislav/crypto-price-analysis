import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [price, setPrice] = useState(null);
  const [symbol, setSymbol] = useState("bitcoin"); // По умолчанию Bitcoin

  const fetchPrice = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/price/${symbol}`
      );
      setPrice(response.data[symbol].usd);
    } catch (error) {
      console.error("Ошибка при получении цены:", error);
    }
  };

  useEffect(() => {
    fetchPrice();
  }, [symbol]);

  return (
    <div className="App">
      <h1>
        Цена {symbol.toUpperCase()}: {price ? `$${price}` : "Загрузка..."}
      </h1>
      <button onClick={() => setSymbol("ethereum")}>
        Получить цену Ethereum
      </button>
      <button onClick={() => setSymbol("litecoin")}>
        Получить цену Litecoin
      </button>
    </div>
  );
}

export default App;
