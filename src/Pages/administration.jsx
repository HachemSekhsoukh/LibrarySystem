import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import Button from '../components/Button';
import Popup from "../components/Popup";
import { TextField, Snackbar, Alert, CircularProgress } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import "../CSS/administration.css";
import { fetchAllStaff, addStaffMember, fetchStaffTypes, addStaffType } from "../utils/api";

const Administration = () => {
  const [staffTypesData, setStaffTypesData] = useState([]);
  const [openTypePopup, setOpenTypePopup] = useState(false);
  const [newStaffType, setNewStaffType] = useState({ st_name: "" });
  const [staffData, setStaffData] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    birthdate: ""
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const staffTypesColumns = [
    { label: "ID", key: "id" },
    { label: "Type", key: "name" },
  ];
  
  const columns = [
    { label: "ID", key: "id" },
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone Number", key: "phone" },
    { label: "Address", key: "address" },
    { label: "Birthdate", key: "birthdate" }
  ];
  const fetchStaffData = async () => {
    setLoading(true);
    const result = await fetchAllStaff();
    if (Array.isArray(result)) {
      const formatted = result.map((member) => ({
        id: member.s_id,
        name: member.s_name,
        email: member.s_email,
        phone: member.s_phone || "N/A",
        address: member.s_address,
        birthdate: member.s_birthdate,
      }));
      setStaffData(formatted);
    }
    setLoading(false);
  };
  
  const fetchStaffTypesData = async () => {
    setLoading(true);
    try {
      const result = await fetchStaffTypes();
      
      if (Array.isArray(result)) {
        const formatted = result.map((type) => ({
          id: type.id,
          name: type.name,
        }));
        setStaffTypesData(formatted);
      } else {
        console.error("Expected array of staff types, got:", result);
        setStaffTypesData([]);
      }
    } catch (error) {
      console.error("Error fetching staff types:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch staff types",
        severity: "error"
      });
      setStaffTypesData([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStaffData();
    fetchStaffTypesData();
  }, []);
    
  
  const handleTypeChange = (e) => {
    setNewStaffType({ ...newStaffType, [e.target.name]: e.target.value });
  };
  
  const handleAddStaffType = async () => {
    setLoading(true);
    try {
      const response = await addStaffType(newStaffType);
  
      if (response?.success) {
        setSnackbar({
          open: true,
          message: "Staff type added successfully!",
          severity: "success"
        });
        setNewStaffType({ st_name: "" });
        setOpenTypePopup(false);
  
        await fetchStaffTypesData();
      } else {
        throw new Error("Failed to add staff type");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };  

  const handleChange = (e) => {
    setNewStaff({ ...newStaff, [e.target.name]: e.target.value });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await addStaffMember(newStaff); 

      if (response?.success) {
        setSnackbar({
          open: true,
          message: "Staff member added successfully!",
          severity: "success"
        });
        setNewStaff({
          name: "",
          email: "",
          phone: "",
          address: "",
          birthdate: ""
        });
        setOpenPopup(false);
        await fetchStaffData();
      } else {
        throw new Error("Failed to add staff member");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="administration-page">
      <div className="recent-transactions-container">
        {loading ? (
          <div className="loader"></div>
        ) : (
          <>
            <Table 
              columns={columns} 
              data={staffData} 
              showActions={true} 
              title={"Staff Members"} 
            />
            <div className="bottom-buttons">
              <Button
                onClick={() => setOpenPopup(true)}
                label="Add Staff Member"
                lightBackgrnd={false}
                icon={<AddIcon />}
                size="large"
              />
            </div>
          </>
        )}
      </div>
      
      <div className="recent-transactions-container">
        {loading ? (
          <div className="loader"></div>
        ) : (
          <>
            <Table 
              columns={staffTypesColumns} 
              data={staffTypesData} 
              showActions={true} 
              title={"Staff Types"} 
            />
            <div className="bottom-buttons">
              <Button
                onClick={() => setOpenTypePopup(true)}
                label="Add Staff Type"
                lightBackgrnd={false}
                icon={<AddIcon />}
                size="large"
              />
            </div>
          </>
        )}
      </div>

      <Popup
        title="Add Staff Type"
        openPopup={openTypePopup}
        setOpenPopup={setOpenTypePopup}
      >
        <div className="add-staff-type-form">
          <div className="form-field">
            <label>Staff Type Name</label>
            <TextField
              className="text-field"
              name="st_name"
              value={newStaffType.st_name}
              onChange={handleTypeChange}
              variant="outlined"
              fullWidth
              placeholder="Enter staff type name"
            />
          </div>

          <div className="dialog-button-container">
            <button className="dialog-cancel-button" onClick={() => setOpenTypePopup(false)}>
              Cancel
            </button>
            <button className="dialog-save-button" onClick={handleAddStaffType} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Save"}
            </button>
          </div>
        </div>
      </Popup>


      <Popup
        title="Add Staff Member"
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
        className="staff-popup"
      >
        <div className="add-staff-form">
        <div className="form-field-row">
              <div className="form-field">
                <label>Name</label>
                <TextField
                  className="text-field"
                  name="name"
                  value={newStaff.name}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  placeholder="Enter name"
                />
              </div>

              <div className="form-field">
                <label>Email</label>
                <TextField
                className="text-field"
                  name="email"
                  value={newStaff.email}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  placeholder="Enter email"
                />
              </div>
        </div>
          
        <div className="form-field-row">
              <div className="form-field">
                <label>Password</label>
                <TextField
                className="text-field"
                  name="password"
                  value={newStaff.password}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  placeholder="Enter password"
                />
              </div>

              <div className="form-field">
                <label>Phone Number</label>
                <TextField
                className="text-field"
                  name="phone"
                  value={newStaff.phone}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  placeholder="Enter phone number"
                />
              </div>
        </div>
         
        <div className="form-field-row">
                <div className="form-field">
                  <label>Address</label>
                  <TextField
                  className="text-field"
                    name="address"
                    value={newStaff.address}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    placeholder="Enter address"
                  />
                </div>

                <div className="form-field">
                  <label>Birthdate</label>
                  <TextField
                    className="text-field"
                    name="birthdate"
                    value={newStaff.birthdate}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    placeholder="Enter birthdate"
                    type="date"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </div>
        </div>

          <div className="dialog-button-container">
            <button className="dialog-cancel-button" onClick={() => setOpenPopup(false)}>
              Cancel
            </button>
            <button className="dialog-save-button" onClick={handleSubmit} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Save"}
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
    </div>
  );
};

export default Administration;
