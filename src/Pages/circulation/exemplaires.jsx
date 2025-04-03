import React, { useState, useEffect } from "react";
import Table from "../../components/Table";
import Button from '../../components/Button';
import Popup from "../../components/Popup";
import { 
  TextField, 
  MenuItem, 
  Autocomplete, 
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import "../../CSS/circulation/transactions.css";

const Exemplaires = () => {
  const API_BASE_URL = "http://127.0.0.1:5000/";
  const [openPopup, setOpenPopup] = useState(false);
  const [transactionData, setTransactionData] = useState({
    borrowerName: "",
    transactionType: "Borrow",
    documentTitle: ""
  });
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [readers, setReaders] = useState([]);
  const [resources, setResources] = useState([]);
  const [loadingReaders, setLoadingReaders] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [readerError, setReaderError] = useState(null);
  const [resourceError, setResourceError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch readers from API
  useEffect(() => {
    const fetchReaders = async () => {
      setLoadingReaders(true);
      try {
        const response = await fetch(`${API_BASE_URL}api/readers`);
        if (!response.ok) {
          throw new Error('Failed to fetch readers');
        }
        const data = await response.json();
        // Transform data to match the format expected by Autocomplete
        const readerOptions = data.map(reader => ({
          id: reader.id,
          label: reader.name,
          email: reader.email
        }));
        setReaders(readerOptions);
        setReaderError(null);
      } catch (err) {
        console.error('Error fetching readers:', err);
        setReaderError('Failed to load readers. Please try again later.');
      } finally {
        setLoadingReaders(false);
      }
    };

    fetchReaders();
  }, []);


  useEffect(() => {
    const fetchTransactions = async () => {
      setLoadingTransactions(true);
      try {
        const response = await fetch(`${API_BASE_URL}api/transactions`);
        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }
        const data = await response.json();
        setTransactions(data);
        setTransactionError(null);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setTransactionError("Failed to load transactions. Please try again.");
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, []);

  // Fetch resources from API
  useEffect(() => {
    const fetchResources = async () => {
      setLoadingResources(true);
      try {
        const response = await fetch(`${API_BASE_URL}api/resources`);
        if (!response.ok) {
          throw new Error('Failed to fetch resources');
        }
        const data = await response.json();
        // Transform data to match the format expected by Autocomplete
        const resourceOptions = data.map(resource => ({
          id: resource.id,
          title: resource.title,
          author: resource.author,
          isbn: resource.isbn,
          // Create a searchable label that includes both title and author
          label: resource.title + (resource.author ? ` by ${resource.author}` : ''),
          // Create a display label for the dropdown
          displayLabel: `${resource.title}${resource.author ? ` by ${resource.author}` : ''}`
        }));
        setResources(resourceOptions);
        setResourceError(null);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setResourceError('Failed to load resources. Please try again later.');
      } finally {
        setLoadingResources(false);
      }
    };

    fetchResources();
  }, []);

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

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async () => {
    try {
      // Get the selected reader's ID if a reader was selected from the dropdown
      let readerId = null;
      if (typeof transactionData.borrowerName === 'object' && transactionData.borrowerName) {
        readerId = transactionData.borrowerName.id;
      }

      // Get the selected resource's ID
      let bookId = null;
      if (typeof transactionData.documentTitle === 'object' && transactionData.documentTitle) {
        bookId = transactionData.documentTitle.id;
      }

      // Validate required fields
      if (!readerId) {
        setSnackbar({
          open: true,
          message: 'Please select a borrower',
          severity: 'error'
        });
        return;
      }

      if (!bookId) {
        setSnackbar({
          open: true,
          message: 'Please select a document',
          severity: 'error'
        });
        return;
      }

      const transactionPayload = {
        readerId: readerId,
        bookId: bookId,
        transactionType: transactionData.transactionType
      };

      // Send data to backend
      const response = await fetch(`${API_BASE_URL}api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      const result = await response.json();
      console.log("Transaction created:", result);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Reservation saved successfully!',
        severity: 'success'
      });

      // Reset form and close popup
      setTransactionData({
        borrowerName: "",
        transactionType: "Borrow",
        documentTitle: ""
      });
      setOpenPopup(false);
    } catch (err) {
      console.error('Error creating transaction:', err);
      setSnackbar({
        open: true,
        message: 'Failed to create reservation. Please try again.',
        severity: 'error'
      });
    }
  };

  const columns = [
    { label: "ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Borrower Name", key: "borrower_name" },
    { label: "Type", key: "type" },
    { label: "Date", key: "date" },
  ];
  return (
    <>
    <div className="container">
    <div id='table'>
    <Table columns={columns} data={transactions} showActions={true} title={"Recent Transactions"}/>
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
          {loadingReaders ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
              <CircularProgress size={24} />
            </div>
          ) : readerError ? (
            <div style={{ color: 'red', padding: '10px' }}>{readerError}</div>
          ) : (
            <Autocomplete
              fullWidth
              options={readers}
              value={transactionData.borrowerName}
              onChange={(event, newValue) => handleAutocompleteChange("borrowerName", newValue)}
              getOptionLabel={(option) => {
                // Handle both string values and option objects
                if (typeof option === 'string') {
                  return option;
                }
                return option.label || '';
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder="Select borrower name"
                  variant="outlined"
                  className="text-field"
                />
              )}
              className="dropdown-field"
            />
          )}
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
          {loadingResources ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
              <CircularProgress size={24} />
            </div>
          ) : resourceError ? (
            <div style={{ color: 'red', padding: '10px' }}>{resourceError}</div>
          ) : (
            <Autocomplete
              fullWidth
              options={resources}
              value={transactionData.documentTitle}
              onChange={(event, newValue) => handleAutocompleteChange("documentTitle", newValue)}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }
                return option.label || '';
              }}
              isOptionEqualToValue={(option, value) => {
                if (typeof value === 'string') {
                  return option.label === value;
                }
                return option.id === value.id;
              }}
              renderOption={(props, option) => (
                <li {...props}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{option.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                      {option.author ? `by ${option.author}` : 'Unknown author'} 
                      {option.isbn ? ` • ISBN: ${option.isbn}` : ''}
                    </div>
                  </div>
                </li>
              )}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder="Search by title or author"
                  variant="outlined"
                  className="text-field"
                />
              )}
              className="dropdown-field"
            />
          )}
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

    <Snackbar 
      open={snackbar.open} 
      autoHideDuration={6000} 
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={handleSnackbarClose} 
        severity={snackbar.severity}
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
    </>
  );
};

export default Exemplaires;