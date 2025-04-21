import React, { useEffect, useState } from "react";
import Table from "../../components/Table";
import Popup from "../../components/Popup";
import Button from "../../components/Button";
import { TextField, Snackbar, Alert, MenuItem, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import "../../CSS/circulation/readers.css";
import { useTranslation } from 'react-i18next';

const Readers = () => {
  const API_BASE_URL = "http://127.0.0.1:5000/";
  const [readers, setReaders] = useState([]);
  const { t } = useTranslation();
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPopup, setOpenPopup] = useState(false);
  const [verifyReaders, setVerifyReadersPopup] = useState(false);
  const [pendingReaders, setPendingReaders] = useState([]);
  const [pendingReadersLoading, setPendingReadersLoading] = useState(false);
  const [selectedReaders, setSelectedReaders] = useState([]);
  
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
  
    if (!newReader.u_name.trim()) errors.u_name = "Name is required";
    if (!newReader.u_birthDate) errors.u_birthDate = "Date of birth is required";
    if (!newReader.u_email) {
      errors.u_email = "Email is required";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(newReader.u_email)) {
      errors.u_email = "Invalid email format";
    }
    if (!newReader.u_phone) {
      errors.u_phone = "Phone number is required";
    } else if (!/^\+?\d{7,15}$/.test(newReader.u_phone)) {
      errors.u_phone = "Invalid phone number";
    }
    if (!isEditing && !newReader.u_password) errors.u_password = "Password is required";
    if (!newReader.u_type) errors.u_type = "User type is required";
  
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  

  useEffect(() => {
    const fetchReaders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}api/readers`);
        const data = await response.json();
        const formattedData = data.map(reader => ({
          id: reader.id,
          name: reader.name,
          dob: reader.birthDate,
          email: reader.email,
          phone: reader.phone,
          type: reader.type,
          status: reader.status
        }));
        setReaders(formattedData);
      } catch (error) {
        console.error("Error fetching readers:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserTypes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}api/user-types`);
        const data = await response.json();
        setUserTypes(data);
      } catch (error) {
        console.error("Error fetching user types:", error);
      }
    };

    fetchReaders();
    fetchUserTypes();
  }, []);

  // Fetch pending readers when verification popup opens
  useEffect(() => {
    if (verifyReaders) {
      fetchPendingReaders();
    }
  }, [verifyReaders]);

  const fetchPendingReaders = async () => {
    setPendingReadersLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}api/pending-readers`);
      const data = await response.json();
  
      // 🔍 Debug log to inspect the raw data from the backend
      console.log("Fetched pending readers (raw):", data);
  
      const formattedData = data.map(reader => ({
        id: reader.id,
        name: reader.name,
        dob: reader.birthDate,
        email: reader.email,
        phone: reader.phone,
        type: reader.type,
        status: reader.status
      }));
  
      setPendingReaders(formattedData);
      setPendingReadersLoading(false);
    } catch (error) {
      console.error("Error fetching readers:", error);
    } finally {
      setLoading(false);
    }
  };

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
    if (!validateForm()) {
      setSnackbar({ open: true, message: "Please fix the form errors", severity: "error" });
      return;
    }
  
    try {
      // Create a copy of the newReader object to avoid modifying the state directly
      const readerDataToSend = { ...newReader };
      
      // If u_type is an object (from Autocomplete), extract just the ID
      if (typeof readerDataToSend.u_type === 'object' && readerDataToSend.u_type !== null) {
        readerDataToSend.u_type = readerDataToSend.u_type.id;
      }
      
      let response;
      if (isEditing) {
        // Update existing reader
        response = await fetch(`${API_BASE_URL}api/readers/${currentReaderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(readerDataToSend),
        });
      } else {
        // Add new reader
        response = await fetch(`${API_BASE_URL}api/add-readers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(readerDataToSend),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save reader");
      }
  
      setSnackbar({ 
        open: true, 
        message: isEditing ? "Reader updated successfully" : "Reader added successfully", 
        severity: "success" 
      });
      setOpenPopup(false);
      resetForm();
      
      // Refresh the readers list
      const updatedResponse = await fetch(`${API_BASE_URL}api/readers`);
      const updatedData = await updatedResponse.json();
      const formattedData = updatedData.map(reader => ({
        id: reader.id,
        name: reader.name,
        dob: reader.birthDate,
        email: reader.email,
        phone: reader.phone,
        status: "Active",
        type: reader.type
      }));
      setReaders(formattedData);
    } catch (error) {
      console.error(isEditing ? "Error updating reader:" : "Error adding reader:", error);
      setSnackbar({ open: true, message: error.message || "Error saving reader", severity: "error" });
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
        message: "Please select at least one reader to verify", 
        severity: "warning" 
      });
      return;
    }

    try {
      // Verify each reader individually using PATCH
      for (const readerId of selectedReaders) {
        const response = await fetch(`${API_BASE_URL}api/update-readers/${readerId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: 1 }),
        });

        const result = await response.json();
        console.log(response);

        if (!response.ok) {
          throw new Error(result.error || `Failed to verify reader ${readerId}`);
        }
      }

      // Remove verified readers from pending list
      setPendingReaders(prevReaders => 
        prevReaders.filter(reader => !selectedReaders.includes(reader.id))
      );

      setSnackbar({ 
        open: true, 
        message: `Successfully verified ${selectedReaders.length} reader(s)`, 
        severity: "success" 
      });

      // Refresh the main readers list after verifying
      const updatedResponse = await fetch(`${API_BASE_URL}api/readers`);
      const updatedData = await updatedResponse.json();
      const formattedData = updatedData.map(reader => ({
        id: reader.id,
        name: reader.name,
        dob: reader.birthDate,
        email: reader.email,
        phone: reader.phone,
        status: reader.status,
        type: reader.type
      }));
      setReaders(formattedData);
      setSelectedReaders([]);

      if (pendingReaders.length === selectedReaders.length) {
        setVerifyReadersPopup(false);
      }
    } catch (error) {
      console.error("Error verifying readers:", error);
      setSnackbar({ 
        open: true, 
        message: "Failed to verify selected readers", 
        severity: "error" 
      });
    }
  };

  const handleRejectSelected = async () => {
    if (selectedReaders.length === 0) {
      setSnackbar({ 
        open: true, 
        message: "Please select at least one reader to reject", 
        severity: "warning" 
      });
      return;
    }
    
    try {
      // Reject each reader individually using PATCH
      for (const readerId of selectedReaders) {
        const response = await fetch(`${API_BASE_URL}api/update-readers/${readerId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: 2 }),
        });
  
        const result = await response.json();
        console.log(response);
  
        if (!response.ok) {
          throw new Error(result.error || `Failed to reject reader ${readerId}`);
        }
      }
  
      // Remove rejected readers from pending list
      setPendingReaders(prevReaders => 
        prevReaders.filter(reader => !selectedReaders.includes(reader.id))
      );
  
      setSnackbar({ 
        open: true, 
        message: `Successfully rejected ${selectedReaders.length} reader(s)`, 
        severity: "success" 
      });
  
      // Refresh the readers list
      const updatedResponse = await fetch(`${API_BASE_URL}api/readers`);
      const updatedData = await updatedResponse.json();
      const formattedData = updatedData.map(reader => ({
        id: reader.id,
        name: reader.name,
        dob: reader.birthDate,
        email: reader.email,
        phone: reader.phone,
        status: reader.status,
        type: reader.type
      }));
      setReaders(formattedData);
  
      if (pendingReaders.length === selectedReaders.length) {
        setVerifyReadersPopup(false);
      }
    } catch (error) {
      console.error("Error rejecting readers:", error);
      setSnackbar({ 
        open: true, 
        message: "Failed to reject selected readers", 
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
      const response = await fetch(`${API_BASE_URL}api/readers/${readerToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: "Reader deleted successfully!",
          severity: "success"
        });
        
        // Refresh the readers list
        const updatedResponse = await fetch(`${API_BASE_URL}api/readers`);
        const updatedData = await updatedResponse.json();
        const formattedData = updatedData.map(reader => ({
          id: reader.id,
          name: reader.name,
          dob: reader.birthDate,
          email: reader.email,
          phone: reader.phone,
          status: "Active",
          type: reader.type
        }));
        setReaders(formattedData);
      } else {
        throw new Error(result.error || "Failed to delete reader");
      }
    } catch (error) {
      console.error("Error deleting reader:", error);
      setSnackbar({
        open: true,
        message: `Failed to delete reader: ${error.message}`,
        severity: "error"
      });
    } finally {
      setDeleteDialogOpen(false);
      setReaderToDelete(null);
    }
  };

  const columns = [
    { label: t("id"), key: "id" },
    { label: t("name"), key: "name" },
    { label: t("date_of_birth"), key: "dob" },
    { label: t("email"), key: "email" },
    { label: t("phone_number"), key: "phone" },
    { label: t("category"), key: "type" }
  ];

  const pendingColumns = [
    { 
      label: "Select", 
      key: "select",
      render: (value, row) => (
        <input
          type="checkbox"
          checked={selectedReaders.includes(row.id)}
          onChange={() => handleCheckboxChange(row.id)}
        />
      )
    },
    { label: t("id"), key: "id" },
    { label: t("name"), key: "name" },
    { label: t("email"), key: "email" },
    { label: t("phone"), key: "phone" },
    { label: t("type"), key: "type" }
  ];

  return (
    <div className="readers-page">
      <div className="container">
        <div id="table">
          <Table 
            columns={columns} 
            data={readers} 
            showActions={true} 
            title={t("readers")} 
            loading={loading} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
        <div className="bottom-buttons">
          <Button onClick={() => setVerifyReadersPopup(true)} label={t("verify_new_readers")} lightBackgrnd={true} icon={<FileUploadIcon />} size="large" />
          <Button onClick={() => setOpenPopup(true)} label={t("add_new_reader")} lightBackgrnd={false} icon={<AddIcon />} size="large" />
        </div>
      </div>
      
      {/* Add/Edit Reader Popup */}
      <Popup title={isEditing ? "Edit Reader" : "Add New Reader"} openPopup={openPopup} setOpenPopup={setOpenPopup}>
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
        <label>{t("password")} {isEditing && "(leave blank to keep current password)"}</label>
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
            if (newValue) {
              handleAutocompleteChange("u_type", newValue);
            }
          }}
          getOptionLabel={(option) => {
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
              placeholder="Select user type"
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
      <button className="dialog-save-button" onClick={handleAddReader}>Save</button>
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
            <div className="loading-message">Loading pending readers...</div>
          ) : pendingReaders.length === 0 ? (
            <div className="no-readers-message">No pending readers to verify</div>
          ) : (
            <>
              <div className="verify-readers-table">
                <Table
                  columns={pendingColumns}
                  data={pendingReaders}
                  showActions={false}
                  title={"Pending Readers"}
                  loading={pendingReadersLoading}
                  onRowSelect={setSelectedReaders}
                  selectedRows={selectedReaders}
                />
              </div>
              <div className="verify-actions">
                <div className="selected-count">
                  {selectedReaders.length} reader{selectedReaders.length !== 1 ? 's' : ''} selected
                </div>
                <div className="verify-buttons">
                  <button
                    className="reject-button"
                    onClick={handleRejectSelected}
                    disabled={selectedReaders.length === 0}
                  >
                    Reject Selected
                  </button>
                  <button
                    className="verify-button"
                    onClick={handleVerifySelected}
                    disabled={selectedReaders.length === 0}
                  >
                    Verify Selected
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
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete reader "{readerToDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} label="Cancel" lightBackgrnd={true} />
          <Button onClick={confirmDelete} label="Delete" lightBackgrnd={false} />
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default Readers;