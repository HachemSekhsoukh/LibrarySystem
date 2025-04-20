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
import { useUser } from '../utils/userContext';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, setUser } = useUser();

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

  useEffect(() => {
    const fetchUser = async () => {
      const fetchedUser = await getUserInfo();
      if (fetchedUser) setUser(fetchedUser);
    };

    const getStats = async () => {
      const statsData = await fetchStats();
      if (statsData) setStats(statsData);
    };

    const getRecentTransactions = async () => {
      const data = await fetchTransactions();
      setTransactions(data.slice(0, 5));
    };

    const getChartData = async () => {
      const data = await fetchMonthlyBorrows();
      setBorrowsChartData(data);
    };

    const getMostBorrowed = async () => {
      const data = await fetchMostBorrowedBooks();
      console.log(data.data)
      setMostBorrowed(data.data);
    };

    fetchUser();
    getStats();
    getRecentTransactions();
    getChartData();
    getMostBorrowed();
  }, [setUser]);

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
        <StatCard title={t("readers")} number={stats.total_users} subtitle={t("total_number_of_readers")} image="../../public/assets/images/Group.png" />
        <StatCard title={t("books_available")} number={stats.total_resources} subtitle={t("total_number_of_books_available")} image="../../public/assets/images/Group.png" />
        <StatCard title={t("books_borrowed")} number={stats.total_reservations} subtitle={t("number_of_books_currently_borrowed")} image="../../public/assets/images/Group.png" />
        <StatCard title={t("monthly_borrows")} number={stats.monthly_borrows} subtitle={t("total_number_of_borrows_this_month")} image="../../public/assets/images/Group.png" />
        <StatCard title={t("overdue_books")} number={stats.overdueBooks} subtitle={t("total_number_of_overdue_books")} image="../../public/assets/images/Group.png" />
      </div>

      {/* Borrows Chart */}
      <div className="chart-container">
        <MonthlyBorrowsChart data={borrowsChartData} />
      </div>

      {/* Recent Transactions Table */}
      <div className="recent-transactions-container">
        <Table columns={columns} data={transactions} showActions={true} title={t("recent_transactions")} />
      </div>

      {/* Most Borrowed Books Table */}
      <div className="recent-transactions-container">
        <Table columns={columns2} data={mostBorrowed} showActions={false} title={t("most_borrowed_books")} />
      </div>
    </div>
  );
};

export default Dashboard;