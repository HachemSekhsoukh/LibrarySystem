import "../../CSS/circulation/administration.css";
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


const CirculationAdministration = () => {
  const API_BASE_URL = "http://127.0.0.1:5000/";
  const [readerTypes, setReaderTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPopup, setOpenPopup] = useState(false);
  const [newReaderType, setNewReaderType] = useState({ 
    ut_name: "", 
    ut_borrow: 0
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchReaderTypes();
  }, []);

  const fetchReaderTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}api/user-types`);
      if (!response.ok) {
        throw new Error("Failed to fetch reader types");
      }
      const data = await response.json();
      setReaderTypes(data);
    } catch (error) {
      console.error("Error fetching reader types:", error);
      setSnackbar({ open: true, message: "Error fetching reader types", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewReaderType({ ...newReaderType, [e.target.name]: e.target.value });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddReaderType = async () => {
    if (!newReaderType.ut_name) {
      setSnackbar({ open: true, message: "Reader type name is required", severity: "error" });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}api/user-types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReaderType),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add reader type");
      }

      setSnackbar({ open: true, message: "Reader type added successfully", severity: "success" });
      setOpenPopup(false);
      setNewReaderType({ ut_name: "", ut_borrow: 0 });
      
      // Refresh the reader types list
      fetchReaderTypes();
    } catch (error) {
      console.error("Error adding reader type:", error);
      setSnackbar({ open: true, message: error.message || "Error adding reader type", severity: "error" });
    }
  };

  const columns = [
    { label: "ID", key: "id" },
    { label: "Name", key: "name" },
    { label: "Borrow Limit", key: "borrow" }
  ];

  return (
    <div className="circulation-administration-page">
      <div className="container">
        <div id="table">
          <Table columns={columns} data={readerTypes} showActions={true} title={"Reader Types"} loading={loading} />
        </div>
        <div className="bottom-buttons">
          <Button onClick={() => setOpenPopup(true)} label="Add New Reader Type" lightBackgrnd={false} icon={<AddIcon />} size="large" />
        </div>
      </div>
      
      {/* Add New Reader Type Popup */}
      <Popup title="Add New Reader Type" openPopup={openPopup} setOpenPopup={setOpenPopup}>
        <div className="add-reader-type-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <TextField 
                fullWidth 
                name="ut_name" 
                value={newReaderType.ut_name} 
                onChange={handleInputChange}
                error={!newReaderType.ut_name && snackbar.open && snackbar.severity === 'error'}
                helperText={!newReaderType.ut_name && snackbar.open && snackbar.severity === 'error' ? 'Name is required' : ''}
              />
            </div>
            <div className="form-group">
              <label>Borrow Limit</label>
              <TextField 
                fullWidth 
                type="number"
                name="ut_borrow" 
                value={newReaderType.ut_borrow} 
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </div>
          </div>

          <div className="dialog-button-container">
            <button className="dialog-cancel-button" onClick={() => setOpenPopup(false)}>Cancel</button>
            <button className="dialog-save-button" onClick={handleAddReaderType}>Save</button>
          </div>
        </div>
      </Popup>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default CirculationAdministration;