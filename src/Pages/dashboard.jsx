import "../../src/CSS/dashboard.css";
import Table from "../components/Table";
import StatCard from '../components/StatCard';
import MonthlyBorrowsChart from '../components/monthlyBorrowsChart.jsx';
import { useTranslation } from 'react-i18next';
import {
  getUserInfo,
  fetchStats,
  fetchTransactions,
  fetchMonthlyBorrows,
  fetchMostBorrowedBooks, // Importing the function
} from '../utils/api';

import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const { t } = useTranslation();

  const [stats, setStats] = useState({
    readers: 0,
    booksAvailable: 0,
    booksBorrowed: 0,
    monthlyBorrows: 0,
    overdueBooks: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [borrowsChartData, setBorrowsChartData] = useState([]);
  const [mostBorrowed, setMostBorrowed] = useState([]);
    // Loading state variables
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingMostBorrowed, setLoadingMostBorrowed] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const fetchedUser = await getUserInfo();
    };

    const getStats = async () => {
      setLoadingStats(true);
      const statsData = await fetchStats();
      if (statsData) setStats(statsData);
      setLoadingStats(false);
    };

    const getRecentTransactions = async () => {
      setLoadingTransactions(true);
      const data = await fetchTransactions();
      setTransactions(data.slice(0, 5));
      setLoadingTransactions(false);
    };

    const getChartData = async () => {
      setLoadingChart(true);
      const data = await fetchMonthlyBorrows();
      setBorrowsChartData(data);
      setLoadingChart(false);
    };

    const getMostBorrowed = async () => {
      setLoadingMostBorrowed(true);
      const data = await fetchMostBorrowedBooks();
      setMostBorrowed(data.data);
      setLoadingMostBorrowed(false);
    };

    fetchUser();
    getStats();
    getRecentTransactions();
    getChartData();
    getMostBorrowed();
  }, []);

  const columns = [
    { label: t("id"), key: "id" },
    { label: t("title"), key: "title" },
    { label: t("borrower_name"), key: "borrower_name" },
    { label: t("type"), key: "type" },
    { label: t("date"), key: "date" },
  ];

  const columns2 = [
    { label: t("id"), key: "r_id" },
    { label: t("title"), key: "r_title" },
    { label: t("author"), key: "r_author" },
    { label: t("cote"), key: "r_cote" },
    { label: t("number_of_borrows"), key: "r_num_of_borrows" },
  ];

  return (
    <div className="dashboard-page">
      {/* Stat Cards */}
      <div className="stat-cards-container">
        {loadingStats ? <div className="loader" /> : (
          <>
            <StatCard title={t("readers")} number={stats.total_users} subtitle={t("total_number_of_readers")} image="../../public/assets/images/Group.png" />
            <StatCard title={t("books_available")} number={stats.total_resources} subtitle={t("total_number_of_books_available")} image="../../public/assets/images/Group.png" />
            <StatCard title={t("books_borrowed")} number={stats.total_reservations} subtitle={t("number_of_books_currently_borrowed")} image="../../public/assets/images/Group.png" />
            <StatCard title={t("monthly_borrows")} number={stats.monthly_borrows} subtitle={t("total_number_of_borrows_this_month")} image="../../public/assets/images/Group.png" />
            <StatCard title={t("overdue_books")} number={stats.overdueBooks} subtitle={t("total_number_of_overdue_books")} image="../../public/assets/images/Group.png" />
          </>
        )}
      </div>

      {/* Borrows Chart */}
      <div className="chart-container">
        {loadingChart ? <div className="loader" /> : <MonthlyBorrowsChart data={borrowsChartData} />}
      </div>

      {/* Recent Transactions Table */}
      <div className="recent-transactions-container">
      {loadingTransactions ? <div className="loader" /> :<Table columns={columns} data={transactions} showActions={true} title={t("recent_transactions")} loading={loadingTransactions} />}
      </div>

      {/* Most Borrowed Books Table */}
      <div className="recent-transactions-container">
      {loadingMostBorrowed ? <div className="loader" /> : <Table columns={columns2} data={mostBorrowed} showActions={false} title={t("most_borrowed_books")} loading={loadingMostBorrowed} />}
      </div>
    </div>
  );
};

export default Dashboard;