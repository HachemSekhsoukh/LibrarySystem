import React, { useState } from "react";
import Table from "../../components/Table";
import Button from '../../components/Button';
import Popup from "../../components/Popup";
import { TextField, MenuItem, Select } from "@mui/material";
import "../../CSS/transactions.css";

const Transactions = () => {
  const [openPopup, setOpenPopup] = useState(false);
  const [transactionData, setTransactionData] = useState({
    borrowerName: "",
    transactionType: "Borrow",
    documentTitle: ""
  });

  // Dummy data for dropdowns
  const borrowers = [
    "John Doe",
    "Alice Smith",
    "Bob Johnson",
    "Emma Wilson"
  ];

  const transactionTypes = [
    "Borrow",
    "Return",
    "Renew"
  ];

  const handleChange = (e) => {
    setTransactionData({ ...transactionData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("New Transaction Data:", transactionData);
    setOpenPopup(false);
  };

  const columns = [
    { label: "ID", key: "id" },
    { label: "Book Title", key: "bookTitle" },
    { label: "Borrower Name", key: "borrowerName" },
    { label: "Type", key: "type" },
    { label: "Start Date", key: "startDate" },
    { label: "End Date", key: "endDate" },
    { label: "Status", key: "status" }
  ];

  const data = [
    {
      id: "TR001",
      bookTitle: "The Great Gatsby",
      borrowerName: "John Doe",
      type: "Borrow",
      startDate: "2024-03-01",
      endDate: "2024-03-15",
      status: "Active"
    },
    {
      id: "TR002",
      bookTitle: "Introduction to Machine Learning",
      borrowerName: "Alice Smith",
      type: "Return",
      startDate: "2024-02-15",
      endDate: "2024-03-01",
      status: "Completed"
    }
  ];

  return (
    <div className="transactions-page">
      <div className="container">
        <div id="table">
          <Table columns={columns} data={data} showActions={true} />
        </div>
        <div className="bottom-buttons">
          <Button onClick={() => {}} label={"Export Transactions"} lightBackgrnd={true}></Button>
          <Button onClick={() => setOpenPopup(true)} label={"Add New Transaction"} lightBackgrnd={false}></Button>
        </div>
      </div>
      <Popup 
        title="Add Transaction" 
        openPopup={openPopup} 
        setOpenPopup={setOpenPopup}
        className="transaction-dialog"
      >
        <div className="add-transaction-form">
          <div className="form-field">
            <label>Borrower Name</label>
            <Select
              fullWidth
              name="borrowerName"
              value={transactionData.borrowerName}
              onChange={handleChange}
              displayEmpty
              className="dropdown-field"
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <span style={{ color: '#757575' }}>Select borrower</span>;
                }
                return selected;
              }}
            >
              {borrowers.map((borrower) => (
                <MenuItem key={borrower} value={borrower}>
                  {borrower}
                </MenuItem>
              ))}
            </Select>
          </div>

          <div className="form-field">
            <label>Transaction Type</label>
            <Select
              fullWidth
              name="transactionType"
              value={transactionData.transactionType}
              onChange={handleChange}
              className="dropdown-field"
              renderValue={(selected) => selected}
            >
              {transactionTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </div>

          <div className="form-field">
            <label>Document Title</label>
            <TextField
              fullWidth
              name="documentTitle"
              value={transactionData.documentTitle}
              onChange={handleChange}
              variant="outlined"
              className="text-field"
              placeholder="Enter document title"
            />
          </div>

          <div className="dialog-button-container">
            <button className="dialog-cancel-button" onClick={() => setOpenPopup(false)}>
              Cancel
            </button>
            <button className="dialog-save-button" onClick={handleSubmit}>
              Save
            </button>
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default Transactions; 