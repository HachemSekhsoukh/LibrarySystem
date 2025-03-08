import React, { useState } from "react";
import Table from "../../components/Table";
import Button from '../../components/Button';
import Popup from "../../components/Popup";
import { TextField, MenuItem, Autocomplete } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import "../../CSS/transactions.css";

const Exemplaires = () => {
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

  const handleAutocompleteChange = (name, value) => {
    setTransactionData({ ...transactionData, [name]: value || "" });
  };

  const handleSubmit = () => {
    console.log("New Transaction Data:", transactionData);
    setOpenPopup(false);
  };

  const columns = [
    { label: "ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Borrower Name", key: "borrower_name" },
    { label: "Type", key: "type" },
    { label: "Date", key: "date" },
  ];
  const data = [
    {
      id: 1,
      title: "JavaScript Basics",
      borrower_name: "Alice Johnson",
      type: "Book",
      date: "2024-03-08",
    },
    {
      id: 2,
      title: "Advanced React",
      borrower_name: "Bob Smith",
      type: "E-book",
      date: "2024-03-07",
    },
    {
      id: 3,
      title: "Node.js Mastery",
      borrower_name: "Charlie Brown",
      type: "Book",
      date: "2024-03-06",
    },
  ];
  return (
    <>
    <div className="container">
      <div className="container-title">
          <h2>Recent Transactions</h2>
        </div>
    <div id='table'>
    <Table columns={columns} data={data} showActions={true} />
    </div>
    <div className="bottom-buttons">
      <Button 
        onClick={() => setOpenPopup(true)} 
        label="Add Transaction" 
        lightBackgrnd={false}
        icon={<AddIcon />}
        size="large"
      />
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
          <Autocomplete
            fullWidth
            freeSolo
            options={borrowers}
            value={transactionData.borrowerName}
            onChange={(event, newValue) => handleAutocompleteChange("borrowerName", newValue)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                placeholder="Select or type borrower name"
                variant="outlined"
                className="text-field"
              />
            )}
            className="dropdown-field"
          />
        </div>

        <div className="form-field">
          <label>Transaction Type</label>
          <Autocomplete
            fullWidth
            options={transactionTypes}
            value={transactionData.transactionType}
            onChange={(event, newValue) => handleAutocompleteChange("transactionType", newValue)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                placeholder="Select transaction type"
                variant="outlined"
                className="text-field"
              />
            )}
            className="dropdown-field"
          />
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
    </>
  );
};

export default Exemplaires;