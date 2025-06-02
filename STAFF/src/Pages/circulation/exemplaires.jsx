import React, { useState, useEffect } from "react";
import Table from "../../components/Table";
import Button from '../../components/Button';
import Popup from "../../components/Popup";
import { useTranslation } from 'react-i18next';
import { 
  TextField, 
  Autocomplete, 
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import {
  fetchReaders,
  fetchResources,
  fetchTransactions,
  createTransaction,
  updateTransaction
} from "../../utils/api.js";
import AddIcon from '@mui/icons-material/Add';
import "../../CSS/circulation/transactions.css";
import { useAuth } from "../../utils/privilegeContext"; // Import the AuthProvider

const Exemplaires = () => {
  const { t } = useTranslation();
  const [openPopup, setOpenPopup] = useState(false);
  const { hasPrivilege } = useAuth(); // Use the AuthProvider to check privileges
  const [editPopup, setEditPopup] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionData, setTransactionData] = useState({
    borrowerName: "",
    transactionType: "Borrow",
    documentTitle: ""
  });
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [errors, setErrors] = useState({
    borrowerName: '',
    transactionType: '',
    documentTitle: ''
  });

    // Determine if the user has privileges
  const canEdit = hasPrivilege("edit_circulation_exemplaires");
  const canDelete = hasPrivilege("delete_circulation_exemplaires");
  const canCreate = hasPrivilege("create_circulation_exemplaires");
  
  const validateForm = () => {
    let tempErrors = {
      borrowerName: '',
      transactionType: '',
      documentTitle: ''
    };
    let isValid = true;
  
    if (!transactionData.borrowerName || transactionData.borrowerName === '') {
      tempErrors.borrowerName = t("borrower_name_required");
      isValid = false;
    }
  
    if (!transactionData.transactionType || transactionData.transactionType === '') {
      tempErrors.transactionType = t("transaction_type_required");
      isValid = false;
    }
  
    if (!transactionData.documentTitle || transactionData.documentTitle === '') {
      tempErrors.documentTitle = t("document_title_required");
      isValid = false;
    }
  
    setErrors(tempErrors);
    return isValid;
  };  

  useEffect(() => {
    const loadReaders = async () => {
      setLoadingReaders(true);
      try {
        const data = await fetchReaders();
        const readerOptions = data.map(reader => ({
          id: reader.id,
          label: reader.name,
          email: reader.email
        }));
        setReaders(readerOptions);
        setReaderError(null);
      } catch (err) {
        console.error(err);
        setReaderError(t("failed_to_load_readers"));
      } finally {
        setLoadingReaders(false);
      }
    };

    loadReaders();
  }, []);

  useEffect(() => {
    const loadResources = async () => {
      setLoadingResources(true);
      try {
        const data = await fetchResources();
        const resourceOptions = data.map(resource => ({
          id: resource.id,
          title: resource.title,
          author: resource.author,
          isbn: resource.isbn,
          label: resource.title + (resource.author ? ` ${t("by")} ${resource.author}` : ''),
          displayLabel: `${resource.title}${resource.author ? ` ${t("by")} ${resource.author}` : ''}`
        }));
        setResources(resourceOptions);
        setResourceError(null);
      } catch (err) {
        console.error(err);
        setResourceError(t("failed_to_load_resources"));
      } finally {
        setLoadingResources(false);
      }
    };

    loadResources();
  }, []);

  const loadTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const data = await fetchTransactions();
      setTransactions(data);
      setTransactionError(null);
    } catch (err) {
      console.error(err);
      setTransactionError(t("failed_to_load_transactions"));
    } finally {
      setLoadingTransactions(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const transactionTypes = ["Borrow", "Return", "Renew_1", "Late", "Renew_2"];

  const handleAutocompleteChange = (name, value) => {
    setTransactionData({ ...transactionData, [name]: value || "" });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const readerId = transactionData.borrowerName?.id;
      const bookId = transactionData.documentTitle?.id;

      const payload = {
        readerId,
        bookId,
        transactionType: transactionData.transactionType
      };

      await createTransaction(payload);

      setSnackbar({
        open: true,
        message: t("transaction_saved_successfully"),
        severity: 'success'
      });

      setTransactionData({
        borrowerName: "",
        transactionType: "Borrow",
        documentTitle: ""
      });
      setOpenPopup(false);
      loadTransactions();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: `${t("failed_to_create_transaction")}: ${err.message}`,
        severity: 'error'
      });
    }
  };

  const handleEdit = async (row) => {
    setSelectedTransaction(row);
    setTransactionData({
      transactionType: row.type || "Borrow"
    });
    setEditPopup(true);
  };

  const handleUpdate = async () => {
    if (!transactionData.transactionType) {
      setErrors({
        transactionType: t("transaction_type_required")
      });
      return;
    }

    try {
      const payload = {
        transactionType: transactionData.transactionType
      };

      await updateTransaction(selectedTransaction.id, payload);

      setSnackbar({
        open: true,
        message: t("transaction_updated_successfully"),
        severity: 'success'
      });

      setTransactionData({
        transactionType: "Borrow"
      });
      setEditPopup(false);
      setSelectedTransaction(null);
      loadTransactions();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: `${t("failed_to_update_transaction")}: ${err.message}`,
        severity: 'error'
      });
    }
  };

  const columns = [
    { label: t("title"), key: "title" },
    { label: t("borrower_name"), key: "borrower_name" },
    { label: t("type"), key: "type" },
    { label: t("date"), key: "date" },
  ];

  // Helper to get allowed transitions for edit
  const getAllowedTransitions = (currentType) => {
    switch (currentType) {
      case "Reservation":
      case 0:
        return ["Borrow"];
      case "Borrow":
      case 1:
        return ["Renew_1", "Return", "Late"];
      case "Renew_1":
      case 3:
        return ["Renew_2", "Return", "Late"];
      case "Renew_2":
      case 5:
        return ["Return", "Late"];
      case "Late":
      case 4:
        return ["Return"];
      default:
        return ["Borrow"];
    }
  };

  // Only allow 'Borrow' for add transaction
  const addTransactionTypes = ["Borrow"];

  return (
    <>
    <div className="container">
    {loading ? (
          <div className="loader"></div>
        ) : (
          <>
            <div id='table'>
              <Table 
                columns={columns} 
                data={transactions} 
                showActions={canEdit || canDelete} 
                showEdit={canEdit} // Pass privilege-based control for edit
                showDelete={canDelete} // Pass privilege-based control for delete
                title={t("transactions")}
                onEdit={handleEdit}
              />
            </div>
            <div className="bottom-buttons">
              <Button 
                onClick={() => setOpenPopup(true)}
                disabled={!canCreate}
                label={t("add_transaction")} 
                lightBackgrnd={false}
                icon={<AddIcon />}
                size="large"
              />
            </div>
        </>)}
        
    </div>

    <Popup 
      title={t("add_transaction")} 
      openPopup={openPopup} 
      setOpenPopup={setOpenPopup}
      className="transaction-dialog"
    >
      <div className="add-transaction-form">
        <div className="form-field">
          <label>{t("borrower_name")}</label>
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
                if (typeof option === 'string') {
                  return option;
                }
                return option.label || '';
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder={t("select_borrower_name")}
                  variant="outlined"
                  className="custom-textfield"
                  error={!!errors.borrowerName}
                  helperText={errors.borrowerName}
                />
              )}
              className="dropdown-field"
            />
          )}
        </div>

        <div className="form-field">
          <label>{t("transaction_type")}</label>
          <Autocomplete
            fullWidth
            options={addTransactionTypes}
            value={transactionData.transactionType}
            onChange={(event, newValue) => handleAutocompleteChange("transactionType", newValue)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                placeholder={t("select_transaction_type")}
                variant="outlined"
                className="custom-textfield"
                error={!!errors.transactionType}
                helperText={errors.transactionType}
              />
            )}
            className="dropdown-field"
          />
        </div>

        <div className="form-field">
          <label>{t("document_title")}</label>
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
                      {option.author ? `${t("by")} ${option.author}` : t("unknown_author")} 
                      {option.isbn ? ` • ${t("isbn")}: ${option.isbn}` : ''}
                    </div>
                  </div>
                </li>
              )}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder={t("search_by_title_or_author")}
                  variant="outlined"
                  className="custom-textfield"
                  error={!!errors.documentTitle}
                  helperText={errors.documentTitle}
                />
              )}
              className="dropdown-field"
            />
          )}
        </div>

        <div className="dialog-button-container">
          <button className="dialog-cancel-button" onClick={() => setOpenPopup(false)}>
            {t("cancel")}
          </button>
          <button className="dialog-save-button" onClick={handleSubmit}>
            {t("save")}
          </button>
        </div>
      </div>
    </Popup>

    <Popup 
      title={t("edit_transaction")} 
      openPopup={editPopup} 
      setOpenPopup={setEditPopup}
      className="transaction-dialog"
    >
      <div className="add-transaction-form">
        <div className="form-field">
          <label>{t("transaction_type")}</label>
          <Autocomplete
            fullWidth
            options={getAllowedTransitions(selectedTransaction?.type)}
            value={transactionData.transactionType}
            onChange={(event, newValue) => handleAutocompleteChange("transactionType", newValue)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                placeholder={t("select_transaction_type")}
                variant="outlined"
                className="custom-textfield"
                error={!!errors.transactionType}
                helperText={errors.transactionType}
              />
            )}
            className="dropdown-field"
          />
        </div>

        <div className="dialog-button-container">
          <button className="dialog-cancel-button" onClick={() => setEditPopup(false)}>
            {t("cancel")}
          </button>
          <button className="dialog-save-button" onClick={handleUpdate}>
            {t("update")}
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