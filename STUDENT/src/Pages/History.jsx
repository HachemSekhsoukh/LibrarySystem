import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import '../CSS/History.css';
import NavHeader from '../components/NavHeader';
import { fetchTransactionsByReaderId } from '../utils/api';
import { useUser } from '../utils/userContext';

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return; // Don't fetch if no user ID
      
      try {
        const data = await fetchTransactionsByReaderId(user.id);
        setHistory(data);
        console.log("history");
        console.log(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, [user?.id]); // Only re-run when user.id changes

  const getTransactionType = (type) => {
    switch(type) {
      case 1:
        return 'Borrow';
      case 2:
        return 'Return';
      case 3:
        return 'Renew';
      case 4:
        return 'Late Return';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="history-home">
      <NavHeader />
      <div className="page-content">

        <div className="page-title-container">
          <h1 className="page-title">Borrowing History</h1>
        </div>

        <div className="history-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Resource Name</th>
                <th>Transaction Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((item, index) => (
                  <tr key={index}>
                    <td>{item.Resource?.r_title || 'Unknown Resource'}</td>
                    <td>{getTransactionType(item.res_type)}</td>
                    <td>{item.res_date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>No history available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History; 