import React, { useEffect, useState } from "react";
import Table from "../../components/Table";
import Popup from "../../components/Popup";
import Button from "../../components/Button";
import { TextField, Snackbar, Alert, MenuItem, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import "../../CSS/circulation/readers.css";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../utils/privilegeContext"; // Import the AuthProvider
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { 
  fetchReaders, 
  fetchReaderTransactions, 
  addReader, 
  updateReader, 
  deleteReader, 
  updateReaderStatus,
  fetchUserTypes,
  fetchPendingReaders,
  fetchReaderHistory
} from "../../utils/api";

const Readers = () => {
  const [readers, setReaders] = useState([]);
  const { hasPrivilege } = useAuth(); // Use the AuthProvider to check privileges
  const { t } = useTranslation();
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPopup, setOpenPopup] = useState(false);
  const [verifyReaders, setVerifyReadersPopup] = useState(false);
  const [pendingReaders, setPendingReaders] = useState([]);
  const [pendingReadersLoading, setPendingReadersLoading] = useState(false);
  const [selectedReaders, setSelectedReaders] = useState([]);
  const [readerDetailsPopup, setReaderDetailsPopup] = useState(false);
  const [selectedReader, setSelectedReader] = useState(null);
  const [readerTransactions, setReaderTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

    // Determine if the user has privileges
  const canEdit = hasPrivilege("edit_circulation_readers");
  const canDelete = hasPrivilege("delete_circulation_readers");
  const canCreate = hasPrivilege("create_circulation_readers");
  
  const [newReader, setNewReader] = useState({ 
    u_name: "", 
    u_birthDate: "", 
    u_email: "", 
    u_phone: "", 
    u_password: "",
    u_status: 1, 
    u_type: "" 
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [isEditing, setIsEditing] = useState(false);
  const [currentReaderId, setCurrentReaderId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [readerToDelete, setReaderToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});


  const validateForm = () => {
    const errors = {};
  
    if (!newReader.u_name.trim()) errors.u_name = t("name_required");
    if (!newReader.u_birthDate) errors.u_birthDate = t("birthdate_required");
    if (!newReader.u_email) {
      errors.u_email = t("email_required");
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(newReader.u_email)) {
      errors.u_email = t("email_invalid");
    }
    if (!newReader.u_phone) {
      errors.u_phone = t("phone_required");
    } else if (!/^\+?\d{7,15}$/.test(newReader.u_phone)) {
      errors.u_phone = t("phone_invalid");
    }
    if (!isEditing && !newReader.u_password) errors.u_password = t("password_required");
    if (!newReader.u_type) errors.u_type = t("user_type_required");
  
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        console.log(t("starting_to_load_initial_data"));
        const [readersData, userTypesData] = await Promise.all([
          fetchReaders(),
          fetchUserTypes()
        ]);
        console.log(t("successfully_loaded_data"), { readersData, userTypesData });
        setReaders(readersData);
        setUserTypes(userTypesData);
      } catch (error) {
        console.error(t("error_loading_initial_data"), error);
        setSnackbar({ 
          open: true, 
          message: `${t("failed_to_load_data")}: ${error.message}`, 
          severity: "error" 
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Fetch pending readers when verification popup opens
  useEffect(() => {
    if (verifyReaders) {
      const loadPendingReaders = async () => {
        setPendingReadersLoading(true);
        try {
          const data = await fetchPendingReaders();
          setPendingReaders(data);
        } catch (error) {
          console.error(t("error_loading_pending_readers"), error);
          setSnackbar({ 
            open: true, 
            message: `${t("failed_to_load_pending_readers")}: ${error.message}`, 
            severity: "error" 
          });
        } finally {
          setPendingReadersLoading(false);
        }
      };

      loadPendingReaders();
    }
  }, [verifyReaders]);

  const handleInputChange = (e) => {
    setNewReader({ ...newReader, [e.target.name]: e.target.value });
  };

  const handleAutocompleteChange = (field, value) => {
    setNewReader({ ...newReader, [field]: value });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const resetForm = () => {
    setNewReader({ 
      u_name: "", 
      u_birthDate: "", 
      u_email: "", 
      u_phone: "", 
      u_password: "", 
      u_type: "" 
    });
    setFormErrors({});
    setIsEditing(false);
    setCurrentReaderId(null);
  };
  

  const handleAddReader = async () => {
    console.log(t("starting_to_add_reader_with_data"), newReader);
    
    if (!validateForm()) {
      console.log(t("form_validation_failed_with_errors"), formErrors);
      setSnackbar({ open: true, message: t("please_fix_form_errors"), severity: "error" });
      return;
    }

    try {
      const readerDataToSend = { ...newReader };
      
      // Ensure user type is properly formatted
      if (typeof readerDataToSend.u_type === 'object' && readerDataToSend.u_type !== null) {
        readerDataToSend.u_type = readerDataToSend.u_type.id;
      }
      
      console.log(t("sending_reader_data_to_server"), readerDataToSend);
      
      let response;
      if (isEditing) {
        response = await updateReader(currentReaderId, readerDataToSend);
      } else {
        response = await addReader(readerDataToSend);
      }
      
      console.log(t("server_response"), response);

      setSnackbar({ 
        open: true, 
        message: isEditing ? t("reader_updated_successfully") : t("reader_added_successfully"), 
        severity: "success" 
      });
      setOpenPopup(false);
      resetForm();
      
      // Refresh the readers list
      const updatedData = await fetchReaders();
      setReaders(updatedData);
    } catch (error) {
      console.error(isEditing ? t("error_updating_reader") : t("error_adding_reader"), error);
      setSnackbar({ open: true, message: error.message || t("error_saving_reader"), severity: "error" });
    }
  };

  const handleCheckboxChange = (readerId) => {
    setSelectedReaders(prevSelected => {
      if (prevSelected.includes(readerId)) {
        // Remove from selection if already selected
        return prevSelected.filter(id => id !== readerId);
      } else {
        // Add to selection if not selected
        return [...prevSelected, readerId];
      }
    });
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      // Select all readers
      const allReaderIds = pendingReaders.map(reader => reader.id);
      setSelectedReaders(allReaderIds);
    } else {
      // Deselect all readers
      setSelectedReaders([]);
    }
  };

  const handleVerifySelected = async () => {
    if (selectedReaders.length === 0) {
      setSnackbar({ 
        open: true, 
        message: t("select_at_least_one_reader_to_verify"), 
        severity: "warning" 
      });
      return;
    }

    try {
      for (const readerId of selectedReaders) {
        await updateReaderStatus(readerId, 1);
      }

      setPendingReaders(prevReaders => 
        prevReaders.filter(reader => !selectedReaders.includes(reader.id))
      );

      setSnackbar({ 
        open: true, 
        message: t("successfully_verified_readers", { count: selectedReaders.length }), 
        severity: "success" 
      });

      const updatedData = await fetchReaders();
      setReaders(updatedData);
      setSelectedReaders([]);

      if (pendingReaders.length === selectedReaders.length) {
        setVerifyReadersPopup(false);
      }
    } catch (error) {
      console.error(t("error_verifying_readers"), error);
      setSnackbar({ 
        open: true, 
        message: t("failed_to_verify_selected_readers"), 
        severity: "error" 
      });
    }
  };

  const handleRejectSelected = async () => {
    if (selectedReaders.length === 0) {
      setSnackbar({ 
        open: true, 
        message: t("select_at_least_one_reader_to_reject"), 
        severity: "warning" 
      });
      return;
    }
    
    try {
      for (const readerId of selectedReaders) {
        await updateReaderStatus(readerId, 2);
      }
  
      setPendingReaders(prevReaders => 
        prevReaders.filter(reader => !selectedReaders.includes(reader.id))
      );
  
      setSnackbar({ 
        open: true, 
        message: t("successfully_rejected_readers", { count: selectedReaders.length }), 
        severity: "success" 
      });
  
      const updatedData = await fetchReaders();
      setReaders(updatedData);
  
      if (pendingReaders.length === selectedReaders.length) {
        setVerifyReadersPopup(false);
      }
    } catch (error) {
      console.error(t("error_rejecting_readers"), error);
      setSnackbar({ 
        open: true, 
        message: t("failed_to_reject_selected_readers"), 
        severity: "error" 
      });
    }
  };

  const handleEdit = (reader) => {
    setCurrentReaderId(reader.id);
    
    // Find the user type object that matches the reader's type
    const userType = userTypes.find(type => type.name === reader.type) || "";
    
    setNewReader({
      u_name: reader.name,
      u_birthDate: reader.dob,
      u_email: reader.email,
      u_phone: reader.phone,
      u_password: "", // Don't populate password for security reasons
      u_type: userType
    });
    
    setIsEditing(true);
    setOpenPopup(true);
  };

  const handleDelete = (reader) => {
    setReaderToDelete(reader);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteReader(readerToDelete.id);
      
      setSnackbar({
        open: true,
        message: t("reader_deleted_successfully"),
        severity: "success"
      });
      
      const updatedData = await fetchReaders();
      setReaders(updatedData);
    } catch (error) {
      console.error(t("error_deleting_reader"), error);
      setSnackbar({
        open: true,
        message: `${t("failed_to_delete_reader")}: ${error.message}`,
        severity: "error"
      });
    } finally {
      setDeleteDialogOpen(false);
      setReaderToDelete(null);
    }
  };

  const handleViewDetails = async (reader) => {
    setSelectedReader(reader);
    setLoadingTransactions(true);
    try {
      const history = await fetchReaderHistory(reader.id);
      setReaderTransactions(history);
    } catch (error) {
      console.error(t("error_fetching_reader_history"), error);
      setSnackbar({
        open: true,
        message: t("failed_to_fetch_reader_history"),
        severity: "error"
      });
    } finally {
      setLoadingTransactions(false);
      setReaderDetailsPopup(true);
    }
  };

  const transactionColumns = [
    { label: t("document_title"), key: "document_title" },
    { label: t("reservation_date"), key: "reservation_date" },
    { label: t("borrow_date"), key: "borrow_date" },
    { label: t("due_date"), key: "due_date" },
    { label: t("return_date"), key: "return_date" },
    { 
      label: t("status"), 
      key: "status",
      render: (value, row) => (
        <span className={row.status === 'Late' ? "status-late" : "status-normal"}>
          {value}
        </span>
      )
    }
  ];

  const columns = [
    { label: t("name"), key: "name" },
    { label: t("date_of_birth"), key: "dob" },
    { label: t("email"), key: "email" },
    { label: t("phone_number"), key: "phone" },
    { label: t("category"), key: "type" },
  ];

  const pendingColumns = [
    { 
      label: t("select"), 
      key: "select",
      render: (value, row) => (
        <input
          type="checkbox"
          checked={selectedReaders.includes(row.id)}
          onChange={() => handleCheckboxChange(row.id)}
        />
      )
    },
    { label: t("name"), key: "name" },
    { label: t("email"), key: "email" },
    { label: t("phone_number"), key: "phone" },
    { label: t("category"), key: "type" }
  ];

  return (
    <div className="readers-page">
      <div className="container">
      {loading ? (
          <div className="loader"></div>
        ) : (
        <>
        <div id="table">
          <Table 
            columns={columns} 
            data={readers} 
            showActions={true} 
            showEdit={canEdit} // Pass privilege-based control for edit
            showDelete={canDelete} // Pass privilege-based control for delete
            title={t("readers")} 
            loading={loading} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            handleViewDetails={handleViewDetails}
          />
        </div>
        <div className="bottom-buttons">
          <Button onClick={() => setVerifyReadersPopup(true)} label={t("verify_new_readers")} lightBackgrnd={true} icon={<FileUploadIcon />} size="large" />
          <Button disabled={!canCreate} onClick={() => setOpenPopup(true)} label={t("add_new_reader")} lightBackgrnd={false} icon={<AddIcon />} size="large" />
        </div>
      </>)}
       
      </div>
      
      {/* Add/Edit Reader Popup */}
      <Popup title={isEditing ? t("edit_reader") : t("add_new_reader")} openPopup={openPopup} setOpenPopup={setOpenPopup}>
  <div className="add-reader-form">
    <div className="form-row">
      <div className="form-group">
        <label>{t("name")}</label>
        <TextField
          fullWidth
          type="text"
          name="u_name"
          value={newReader.u_name}
          onChange={handleInputChange}
          error={!!formErrors.u_name}
          helperText={formErrors.u_name}
        />
      </div>
      <div className="form-group">
        <label>{t("date_of_birth")}</label>
        <TextField
          fullWidth
          type="date"
          name="u_birthDate"
          value={newReader.u_birthDate}
          onChange={handleInputChange}
          error={!!formErrors.u_birthDate}
          helperText={formErrors.u_birthDate}
        />
      </div>
    </div>

    <div className="form-row">
      <div className="form-group">
        <label>{t("email")}</label>
        <TextField
          fullWidth
          type="email"
          name="u_email"
          value={newReader.u_email}
          onChange={handleInputChange}
          error={!!formErrors.u_email}
          helperText={formErrors.u_email}
        />
      </div>
      <div className="form-group">
        <label>{t("phone_number")}</label>
        <TextField
          fullWidth
          type="tel"
          name="u_phone"
          value={newReader.u_phone}
          onChange={handleInputChange}
          error={!!formErrors.u_phone}
          helperText={formErrors.u_phone}
        />
      </div>
    </div>

    <div className="form-row">
      <div className="form-group">
        <label>{t("password")} {isEditing && t("leave_blank_to_keep_password")}</label>
        <TextField
          fullWidth
          type="password"
          name="u_password"
          value={newReader.u_password}
          onChange={handleInputChange}
          error={!!formErrors.u_password}
          helperText={formErrors.u_password}
        />
      </div>
      <div className="form-group">
        <label>{t("user_type")}</label>
        <Autocomplete
          fullWidth
          options={userTypes}
          value={newReader.u_type}
          onChange={(event, newValue) => {
            console.log(t("user_type_changed_to"), newValue);
            handleAutocompleteChange("u_type", newValue);
          }}
          getOptionLabel={(option) => {
            if (!option) return '';
            if (typeof option === 'string') return option;
            return option.name || '';
          }}
          isOptionEqualToValue={(option, value) => {
            if (!option || !value) return false;
            if (typeof option === 'object' && typeof value === 'object') {
              return option.id === value.id;
            }
            return option === value;
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t("select_user_type")}
              variant="outlined"
              className="text-field"
              error={!!formErrors.u_type}
              helperText={formErrors.u_type}
            />
          )}
          className="dropdown-field"
        />
      </div>
    </div>

    <div className="dialog-button-container">
      <button className="dialog-cancel-button" onClick={() => {
        setOpenPopup(false);
        resetForm();
      }}>{t("cancel")}</button>
      <button className="dialog-save-button" onClick={handleAddReader}>{t("save")}</button>
    </div>
  </div>
</Popup>
      {/* Verify Readers Popup */}
      <Popup
        title={t("verify_new_readers")}
        openPopup={verifyReaders}
        setOpenPopup={setVerifyReadersPopup}
        maxWidth="md"
      >
        <div className="verify-readers-container">
          {/* Add Close Button */}
          <div className="popup-header">
            <button 
              className="close-button"
              onClick={() => setVerifyReadersPopup(false)}
            >
              &times;
            </button>
          </div>
          
          {pendingReadersLoading ? (
            <div className="loading-message">{t("loading_pending_readers")}</div>
          ) : pendingReaders.length === 0 ? (
            <div className="no-readers-message">{t("no_pending_readers")}</div>
          ) : (
            <>
              <div className="verify-readers-table">
                <Table
                  columns={pendingColumns}
                  data={pendingReaders}
                  showActions={false}
                  title={t("pending_readers")}
                  loading={pendingReadersLoading}
                  onRowSelect={setSelectedReaders}
                  selectedRows={selectedReaders}
                />
              </div>
              <div className="verify-actions">
                <div className="selected-count">
                  {selectedReaders.length} {t("reader_selected", { count: selectedReaders.length })}
                </div>
                <div className="verify-buttons">
                  <button
                    className="reject-button"
                    onClick={handleRejectSelected}
                    disabled={selectedReaders.length === 0}
                  >
                    {t("reject_selected")}
                  </button>
                  <button
                    className="verify-button"
                    onClick={handleVerifySelected}
                    disabled={selectedReaders.length === 0}
                  >
                    {t("verify_selected")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </Popup>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t("confirm_delete")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("confirm_delete_reader", { name: readerToDelete?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} label={t("cancel")} lightBackgrnd={true} />
          <Button onClick={confirmDelete} label={t("delete")} lightBackgrnd={false} />
        </DialogActions>
      </Dialog>

      {/* Reader Details Popup */}
      <Popup
        title={t("reader_details")}
        openPopup={readerDetailsPopup}
        setOpenPopup={setReaderDetailsPopup}
        maxWidth="xl"
        PaperProps={{
          sx: {
            minWidth: '1200px',
            maxHeight: '80vh'
          }
        }}
      >
        <div className="popup-header">
          <button 
            className="close-button"
            onClick={() => setReaderDetailsPopup(false)}
          >
            &times;
          </button>
        </div>
        {selectedReader && (
          <div className="reader-details-container">
            <div className="reader-info">
              <h3>{t("personal_information")}</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>{t("name")}:</label>
                  <span>{selectedReader.name}</span>
                </div>
                <div className="info-item">
                  <label>{t("email")}:</label>
                  <span>{selectedReader.email}</span>
                </div>
                <div className="info-item">
                  <label>{t("phone_number")}:</label>
                  <span>{selectedReader.phone}</span>
                </div>
                <div className="info-item">
                  <label>{t("date_of_birth")}:</label>
                  <span>{selectedReader.dob}</span>
                </div>
                <div className="info-item">
                  <label>{t("category")}:</label>
                  <span>{selectedReader.type}</span>
                </div>
              </div>
            </div>

            <div className="transaction-history">
              <h3>{t("transaction_history")}</h3>
              {loadingTransactions ? (
                <div className="loading-message">{t("loading_transactions")}</div>
              ) : readerTransactions.length === 0 ? (
                <div className="no-transactions-message">{t("no_transactions")}</div>
              ) : (
                <Table
                  columns={transactionColumns}
                  data={readerTransactions}
                  showActions={false}
                  title={t("transactions")}
                />
              )}
            </div>
          </div>
        )}
      </Popup>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default Readers;