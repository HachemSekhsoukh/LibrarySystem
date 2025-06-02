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
  getSuggestions,
  deleteSuggestion,
} from '../utils/api';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const SuggestionsTable = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const { t } = useTranslation();

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const data = await getSuggestions();
            setSuggestions(data || []);
            setError(null);
        } catch (err) {
            setError('Failed to fetch suggestions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (suggestionId) => {
        try {
            await deleteSuggestion(suggestionId);
            setSnackbar({ open: true, message: 'Suggestion deleted successfully', severity: 'success' });
            fetchSuggestions();
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to delete suggestion', severity: 'error' });
            console.error(err);
        }
    };

    const handleEdit = (suggestion) => {
        setSelectedSuggestion(suggestion);
        setEditDialogOpen(true);
    };

    const handleSendEmail = () => {
        if (selectedSuggestion) {
            const mailtoLink = `mailto:${selectedSuggestion.user_email}?subject=Response to your suggestion&body=Dear ${selectedSuggestion.user_name},%0A%0AThank you for your suggestion: "${selectedSuggestion.content}"%0A%0ABest regards,`;
            window.location.href = mailtoLink;
            setEditDialogOpen(false);
        }
    };

    const columns = [
        { label: t("user_name"), key: "user_name" },
        { label: t("content"), key: "content" },
        { label: t("date"), key: "date" },
    ];

    const formatData = (suggestions) => {
        return suggestions.map(suggestion => ({
            ...suggestion,
            date: new Date(suggestion.date).toLocaleDateString()
        }));
    };

    return (
        <Box sx={{ mt: 4 }}>
            <div className="recent-transactions-container">
                <Table 
                    columns={columns} 
                    data={formatData(suggestions)} 
                    showActions={true}
                    title={t("user_suggestions")}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Respond to Suggestion</DialogTitle>
                <DialogContent>
                    {selectedSuggestion && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">From: {selectedSuggestion.user_name}</Typography>
                            <Typography variant="subtitle1">Email: {selectedSuggestion.user_email}</Typography>
                            <Typography variant="subtitle1" sx={{ mt: 2 }}>Suggestion:</Typography>
                            <Typography>{selectedSuggestion.content}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSendEmail} color="primary">
                        Send Email Response
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

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
  const [lateReturners, setLateReturners] = useState(0);
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

    const getLateReturners = async () => {
      try {
        const transactions = await fetchTransactions();
        // Get unique user IDs with at least one 'Late' transaction
        const lateUserIds = new Set(transactions.filter(tx => tx.type === 'Late').map(tx => tx.borrower_name));
        setLateReturners(lateUserIds.size);
      } catch (err) {
        setLateReturners(0);
      }
    };

    fetchUser();
    getStats();
    getRecentTransactions();
    getChartData();
    getMostBorrowed();
    getLateReturners();
  }, []);

  const columns = [
    { label: t("title"), key: "title" },
    { label: t("borrower_name"), key: "borrower_name" },
    { label: t("type"), key: "type" },
    { label: t("date"), key: "date" },
  ];

  const columns2 = [
    { label: t("title"), key: "r_title" },
    { label: t("author"), key: "r_author" },
    { label: t("cote"), key: "r_cote" },
    { label: t("number_of_borrows"), key: "r_num_of_borrows" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Stat Cards */}
      <div className="stat-cards-container">
        {loadingStats ? <div className="loader" /> : (
          <>
            <StatCard title={t("readers")} number={stats.total_users} subtitle={t("total_number_of_readers")} image="../../public/assets/images/Group.png" />
            <StatCard title={t("books_available")} number={stats.total_resources} subtitle={t("total_number_of_books_available")} image="../../public/assets/images/Group.png" />
            <StatCard title={t("books_borrowed")} number={stats.total_reservations} subtitle={t("number_of_books_currently_borrowed")} image="../../public/assets/images/Group.png" />
            <StatCard title={t("monthly_borrows")} number={stats.monthly_borrows} subtitle={t("total_number_of_borrows_this_month")} image="../../public/assets/images/Group.png" />
            <StatCard title={t("overdue_books")} number={lateReturners} subtitle={t("total_number_of_overdue_books")} image="../../public/assets/images/Group.png" />
          </>
        )}
      </div>

      {/* Borrows Chart */}
      <div className="chart-container">
        {loadingChart ? <div className="loader" /> : <MonthlyBorrowsChart data={borrowsChartData} />}
      </div>

      {/* Recent Transactions Table */}
      <div className="recent-transactions-container">
      {loadingTransactions ? <div className="loader" /> :<Table columns={columns} data={transactions} showActions={false} title={t("recent_transactions")} loading={loadingTransactions} />}
      </div>

      {/* Most Borrowed Books Table */}
      <div id="most-borrowed-section" className="recent-transactions-container">
      {loadingMostBorrowed ? <div className="loader" /> : <Table columns={columns2} data={mostBorrowed} showActions={false} title={t("most_borrowed_books")} loading={loadingMostBorrowed} />}
      </div>

      <SuggestionsTable />
    </Box>
  );
};

export default Dashboard;