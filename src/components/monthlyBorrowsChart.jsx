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
import { useTranslation } from 'react-i18next';
import "../CSS/components/monthlyBorrows.css";

const MonthlyBorrowsChart = ({ data }) => {
  const { t } = useTranslation();
  return (
    <div className="chart-section">
      <h3>{t("monthly_borrows")}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid stroke="#e0e0e0" />
          <XAxis dataKey="month" stroke="var(--text-color)" />
          <YAxis stroke="var(--text-color)" />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--secondary-background-color)", border: "1px solid #ccc" }}
            labelStyle={{ color: "var(--text-color)" }}
            itemStyle={{ color: "var(--button-color)" }}
          />
          <Bar dataKey="borrows" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyBorrowsChart;
