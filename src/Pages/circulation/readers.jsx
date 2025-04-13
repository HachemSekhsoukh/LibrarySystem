import React, { useEffect, useState } from "react";
import Table from "../../components/Table";
import Popup from "../../components/Popup";
import Button from "../../components/Button";
import { TextField, Snackbar, Alert, MenuItem, Autocomplete } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CloseIcon from "@mui/icons-material/Close";
import "../../CSS/circulation/readers.css";

const Readers = () => {
  const API_BASE_URL = "http://127.0.0.1:5000/";
  const [readers, setReaders] = useState([]);
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
    u_type: "" 
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

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

  const handleAddReader = async () => {
    console.log("New Reader Data:", newReader); // Debugging log
  
    if (!newReader.u_name || !newReader.u_birthDate || !newReader.u_email || !newReader.u_phone || !newReader.u_password || !newReader.u_type) {
      setSnackbar({ open: true, message: "All fields are required", severity: "error" });
      return;
    }
  
    try {
      // Create a copy of the newReader object to avoid modifying the state directly
      const readerDataToSend = { ...newReader };
      
      // If u_type is an object (from Autocomplete), extract just the ID
      if (typeof readerDataToSend.u_type === 'object' && readerDataToSend.u_type !== null) {
        readerDataToSend.u_type = readerDataToSend.u_type.id;
      }
      
      const response = await fetch(`${API_BASE_URL}api/add-readers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(readerDataToSend),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add reader");
      }
  
      setSnackbar({ open: true, message: "Reader added successfully", severity: "success" });
      setOpenPopup(false);
      setNewReader({ u_name: "", u_birthDate: "", u_email: "", u_phone: "", u_password: "", u_type: "" });
      
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
      console.error("Error adding reader:", error);
      setSnackbar({ open: true, message: error.message || "Error adding reader", severity: "error" });
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
      console.log(response)

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
      // Verify each reader individually using PATCH
      for (const readerId of selectedReaders) {
        const response = await fetch(`${API_BASE_URL}api/update-readers/${readerId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: 2 }),
        });
  
        const result = await response.json();
        console.log(response)
  
        if (!response.ok) {
          throw new Error(result.error || `Failed to reject reader ${readerId}`);
        }
      }
  
      // Remove verified readers from pending list
      setPendingReaders(prevReaders => 
        prevReaders.filter(reader => !selectedReaders.includes(reader.id))
      );
  
      setSnackbar({ 
        open: true, 
        message: `Successfully rejected ${selectedReaders.length} reader(s)`, 
        severity: "success" 
      });
  
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

  const columns = [
    { label: "ID", key: "id" },
    { label: "Name", key: "name" },
    { label: "Date of Birth", key: "dob" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Status", key: "status" },
    { label: "Category", key: "type" }
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
    { label: "ID", key: "id" },
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Type", key: "type" },
  ];

  return (
    <div className="readers-page">
      <div className="container">
        <div id="table">
          <Table columns={columns} data={readers} showActions={true} title={"Readers"} loading={loading} />
        </div>
        <div className="bottom-buttons">
          <Button onClick={() => setVerifyReadersPopup(true)} label="Verify New Readers" lightBackgrnd={true} icon={<FileUploadIcon />} size="large" />
          <Button onClick={() => setOpenPopup(true)} label="Add New Reader" lightBackgrnd={false} icon={<AddIcon />} size="large" />
        </div>
      </div>
      
      {/* Add New Reader Popup */}
      <Popup title="Add New Reader" openPopup={openPopup} setOpenPopup={setOpenPopup}>
        <div className="add-reader-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <TextField fullWidth name="u_name" value={newReader.u_name} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <TextField fullWidth type="date" name="u_birthDate" value={newReader.u_birthDate} onChange={handleInputChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <TextField fullWidth type="email" name="u_email" value={newReader.u_email} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <TextField fullWidth type="tel" name="u_phone" value={newReader.u_phone} onChange={handleInputChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <TextField fullWidth type="password" name="u_password" value={newReader.u_password} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>User Type</label>
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
                  if (typeof option === 'string') {
                    return option;
                  }
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
                    error={!newReader.u_type && snackbar.open && snackbar.severity === 'error'}
                    helperText={!newReader.u_type && snackbar.open && snackbar.severity === 'error' ? 'User type is required' : ''}
                  />
                )}
                className="dropdown-field"
              />
            </div>
          </div>

          <div className="dialog-button-container">
            <button className="dialog-cancel-button" onClick={() => setOpenPopup(false)}>Cancel</button>
            <button className="dialog-save-button" onClick={handleAddReader}>Save</button>
          </div>
        </div>
      </Popup>

      {/* Verify Readers Popup */}
      <Popup
  title="Verify New Readers"
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

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default Readers;