import React, { useState, useEffect } from "react";
import "./App.css";
import TransactionsTable from "./components/TransactionsTable";
import StatisticsBox from "./components/StatisticsBox";
import BarChartComponent from "./components/BarChartComponent";
import PieChartComponent from "./components/PieChartComponent";

const App = () => {
  const [month, setMonth] = useState("March");
  const [isDatabaseInitialized, setIsDatabaseInitialized] = useState(false);

  const handleMonthChange = (e) => setMonth(e.target.value);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/init-database",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          console.log(result.message);
          setIsDatabaseInitialized(true);
        } else {
          console.error(result.error);
        }
      } catch (error) {
        console.error("Error initializing database:", error);
      }
    };

    initializeDatabase();
  }, []);

  return (
    <div>
      <header className="dashboard-title">Transactions Dashboard</header>
      <div className="container">
        <select value={month} onChange={handleMonthChange}>
          {[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        {isDatabaseInitialized ? (
          <>
            <StatisticsBox month={month} />

            <TransactionsTable month={month} />
            <div className="chart-container">
              <div>
                <h2>Bar Chart Stats - {month}</h2>
                <BarChartComponent month={month} />
              </div>
              <div>
                <h2>Category Distribution Pie Chart</h2>
                <PieChartComponent month={month} />
              </div>
            </div>
          </>
        ) : (
          <p>Initializing database... Please wait.</p>
        )}
      </div>
    </div>
  );
};

export default App;
