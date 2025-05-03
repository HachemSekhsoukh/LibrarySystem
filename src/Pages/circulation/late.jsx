import "../../CSS/circulation/peb.css";
import "../../CSS/circulation/transactions.css";
import React, { useEffect, useState } from "react";
import Table from "../../components/Table";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import Popup from "../../components/Popup"; // make sure you have this Popup component
import Button from "../../components/Button";
import { useTranslation } from 'react-i18next';
import { fetchTransactions } from "../../utils/api.js";

const Late = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState(null);

  const [verifyPopupOpen, setVerifyPopupOpen] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  const loadTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const data = await fetchTransactions();
      const lateTransactions = data.filter(tx => tx.type === "Late"); 
      setTransactions(lateTransactions);
      setTransactionError(null);
    } catch (err) {
      console.error(err);
      setTransactionError("Failed to load transactions. Please try again.");
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const columns = [
    { label: "ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Borrower Name", key: "borrower_name" },
    { label: "Date", key: "date" },
  ];
  const pendingColumns = [
    { 
      label: "Select", 
      key: "select",
      render: (value, row) => (
        <input
          type="checkbox"
          checked={selectedTransactions.includes(row.id)}
          onChange={() => handleCheckboxChange(row.id)}
        />
      )
    },
    { label: "ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Borrower Name", key: "borrower_name" },
    { label: "Date", key: "date" },
  ];

  const handleCheckboxChange = (transactionId) => {
    setSelectedTransactions(prevSelected => {
      if (prevSelected.includes(transactionId)) {
        return prevSelected.filter(id => id !== transactionId);
      } else {
        return [...prevSelected, transactionId];
      }
    });
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const allIds = transactions.map(tx => tx.id);
      setSelectedTransactions(allIds);
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleVerifySelected = () => {
    // Leave empty for now
  };

  const handleRejectSelected = () => {

  };

  return (
    <div className="container">
      <div id="table">
        <Table 
          columns={columns} 
          data={transactions} 
          showActions={false} 
          title={t("late")} 
          loading={loadingTransactions}
        />
        {transactionError && (
          <div style={{ color: 'red', padding: '10px' }}>
            {transactionError}
          </div>
        )}

        {/* Button to open popup */}
        <div className="bottom-buttons">
                  <Button onClick={() => setVerifyPopupOpen(true)} label={t("verify_late_returns")} lightBackgrnd={true} icon={<FileUploadIcon />} size="large" />
        </div>

        {/* Popup */}
        <Popup
          title={t("verify_late_returns")}
          openPopup={verifyPopupOpen}
          setOpenPopup={setVerifyPopupOpen}
          maxWidth="md"
        >
          <div className="verify-readers-container">
            {/* Close button */}
            <div className="popup-header">
              <button 
                className="close-button"
                onClick={() => setVerifyPopupOpen(false)}
              >
                &times;
              </button>
            </div>

            {/* Table inside Popup */}
            <div className="verify-readers-table">
              <Table
                columns={pendingColumns}
                data={transactions}
                showActions={false}
                title={"Late Returns"}
                onRowSelect={handleCheckboxChange}
                selectedRows={selectedTransactions}
                onSelectAll={handleSelectAll}
              />
            </div>

            {/* Action buttons */}
            <div className="verify-actions">
              <div className="selected-count">
                {selectedTransactions.length} item{selectedTransactions.length !== 1 ? 's' : ''} selected
              </div>
              <div className="verify-buttons">
                <button
                  className="reject-button"
                  onClick={handleRejectSelected}
                  disabled={selectedTransactions.length === 0}
                >
                  Block user
                </button>
                <button
                  className="verify-button"
                  onClick={handleVerifySelected}
                  disabled={selectedTransactions.length === 0}
                >
                  Send a mail notice
                </button>
              </div>
            </div>
          </div>
        </Popup>
      </div>
    </div>
  );
};

export default Late;
