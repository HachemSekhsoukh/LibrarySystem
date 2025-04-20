import "../../src/CSS/dashboard.css";
import Table from "../components/Table";
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import MonthlyBorrowsChart from '../components/monthlyBorrowsChart.jsx';

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
  const [mostBorrowed, setMostBorrowed] = useState([]); // New state

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
      setTransactions(data.slice(0, 5)); // Only show latest 5
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
    { label: "ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Borrower Name", key: "borrower_name" },
    { label: "Type", key: "type" },
    { label: "Date", key: "date" },
  ];

  const columns2 = [
    { label: "ID", key: "r_id" },
    { label: "Title", key: "r_title" },
    { label: "Author", key: "r_author" },
    { label: "Cote", key: "r_cote" },
    { label: "Number of Borrows", key: "r_num_of_borrows" },
  ];

  return (
    <div className="dashboard-page">
      {/* Stat Cards */}
      <div className="stat-cards-container">
        <StatCard title="Readers" number={stats.total_users} subtitle="Total Number of Readers" image="../../public/assets/images/Group.png" />
        <StatCard title="Books Available" number={stats.total_resources} subtitle="Total Number of Books Available" image="../../public/assets/images/Group.png" />
        <StatCard title="Books Borrowed" number={stats.total_reservations} subtitle="Number of Books Currently Borrowed" image="../../public/assets/images/Group.png" />
        <StatCard title="Monthly Borrows" number={stats.monthly_borrows} subtitle="Total Number of Borrows This Month" image="../../public/assets/images/Group.png" />
        <StatCard title="Overdue Books" number={stats.overdueBooks} subtitle="Total Number of Overdue Books" image="../../public/assets/images/Group.png" />
      </div>

      {/* Borrows Chart */}
      <div className="chart-container">
        <MonthlyBorrowsChart data={borrowsChartData} />
      </div>

      {/* Recent Transactions Table */}
      <div className="recent-transactions-container">
        <Table columns={columns} data={transactions} showActions={true} title="Recent Transactions" />
      </div>

      {/* Most Borrowed Books Table */}
      <div className="recent-transactions-container">
        <Table columns={columns2} data={mostBorrowed} showActions={false} title="Most Borrowed Books" />
      </div>
    </div>
  );
};

export default Dashboard;
