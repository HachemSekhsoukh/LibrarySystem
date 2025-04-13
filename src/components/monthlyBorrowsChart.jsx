import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const MonthlyBorrowsChart = ({ data }) => {
  return (
    <div className="chart-section">
      <h3>Monthly Borrows</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid stroke="#e0e0e0" />
          <XAxis dataKey="month" stroke="#333" />
          <YAxis stroke="#333" />
          <Tooltip
            contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #ccc" }}
            labelStyle={{ color: "#000" }}
            itemStyle={{ color: "#084C74" }}
          />
          <Bar dataKey="borrows" fill="#084C74" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyBorrowsChart;
