import "../../CSS/Circulation/administration.css";
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
import "../../CSS/Circulation/transactions.css";


const CatalogageAdministration = () => {
  const API_BASE_URL = "http://127.0.0.1:5000/";
  const [resourceTypes, setResourceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPopup, setOpenPopup] = useState(false);
  const [newResourceType, setNewResourceType] = useState({ 
    rt_name: "", 
    rt_borrow: 0
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchResourceTypes();
  }, []);

  const fetchResourceTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}api/resource-types`);
      if (!response.ok) {
        throw new Error("Failed to fetch resource types");
      }
      const data = await response.json();
      setResourceTypes(data);
    } catch (error) {
      console.error("Error fetching resource types:", error);
      setSnackbar({ open: true, message: "Error fetching resource types", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewResourceType({ ...newResourceType, [e.target.name]: e.target.value });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddResourceType = async () => {
    if (!newResourceType.rt_name) {
      setSnackbar({ open: true, message: "Resource type name is required", severity: "error" });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}api/add-resource-types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResourceType),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add resource type");
      }

      setSnackbar({ open: true, message: "Resource type added successfully", severity: "success" });
      setOpenPopup(false);
      setNewResourceType({ rt_name: "", rt_borrow: 0 });
      
      // Refresh the resource types list
      fetchResourceTypes();
    } catch (error) {
      console.error("Error adding resource type:", error);
      setSnackbar({ open: true, message: error.message || "Error adding resource type", severity: "error" });
    }
  };

  const columns = [
    { label: "ID", key: "id" },
    { label: "Name", key: "name" },
    { label: "Borrow Limit", key: "borrow" }
  ];

  return (
    <div className="Catalogage-administration-page">
      <div className="container">
        <div id="table">
          <Table columns={columns} data={resourceTypes} showActions={true} title={"Resource Types"} loading={loading} />
        </div>
        <div className="bottom-buttons">
          <Button onClick={() => setOpenPopup(true)} label="Add New Resource Type" lightBackgrnd={false} icon={<AddIcon />} size="large" />
        </div>
      </div>
      
      {/* Add New Resource Type Popup */}
      <Popup title="Add New Resource Type" openPopup={openPopup} setOpenPopup={setOpenPopup}>
        <div className="add-resource-type-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <TextField 
                fullWidth 
                name="rt_name" 
                value={newResourceType.rt_name} 
                onChange={handleInputChange}
                error={!newResourceType.rt_name && snackbar.open && snackbar.severity === 'error'}
                helperText={!newResourceType.rt_name && snackbar.open && snackbar.severity === 'error' ? 'Name is required' : ''}
              />
            </div>
            <div className="form-group">
              <label>Borrow Limit</label>
              <TextField 
                fullWidth 
                type="number"
                name="rt_borrow" 
                value={newResourceType.rt_borrow} 
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </div>
          </div>

          <div className="dialog-button-container">
            <button className="dialog-cancel-button" onClick={() => setOpenPopup(false)}>Cancel</button>
            <button className="dialog-save-button" onClick={handleAddResourceType}>Save</button>
          </div>
        </div>
      </Popup>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default CatalogageAdministration;