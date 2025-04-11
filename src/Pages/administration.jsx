import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import Button from '../components/Button';
import Popup from "../components/Popup";
import { TextField, Snackbar, Alert, CircularProgress } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import "../CSS/administration.css";
import { fetchAllStaff, addStaffMember } from "../utils/api"; 

const Administration = () => {
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

  const columns = [
    { label: "ID", key: "id" },
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone Number", key: "phone" },
    { label: "Address", key: "address" },
    { label: "Birthdate", key: "birthdate" }
  ];

  useEffect(() => {
    const fetchStaff = async () => {
      const result = await fetchAllStaff();
      
      // Check if result is an array directly (not necessarily within 'staff')
      if (Array.isArray(result)) {
        const formatted = result.map((member) => ({
          id: member.s_id,
          name: member.s_name,
          email: member.s_email,
          phone: member.s_phone || "N/A", // handle missing fields
          address: member.s_address,
          birthdate: member.s_birthdate,
        }));
        setStaffData(formatted);
      } else {
        console.error('Failed to fetch valid staff data, invalid structure');
      }
      setLoading(false); // Set loading to false after data is fetched
    };
  
    fetchStaff();
  }, []);

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
          const fetchStaff = async () => {
            const result = await fetchAllStaff();
            
            // Check if result is an array directly (not necessarily within 'staff')
            if (Array.isArray(result)) {
              const formatted = result.map((member) => ({
                id: member.s_id,
                name: member.s_name,
                email: member.s_email,
                phone: member.s_phone || "N/A", // handle missing fields
                address: member.s_address,
                birthdate: member.s_birthdate,
              }));
              setStaffData(formatted);
            } else {
              console.error('Failed to fetch valid staff data, invalid structure');
            }
            setLoading(false); // Set loading to false after data is fetched
          };
        
          fetchStaff();
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
                   {/* Show loading spinner while loading */}
                   {loading ? (
              <div className="loader"></div>
            ) : (
              <Table columns={columns} data={staffData} showActions={true} title={"Staff Members"} />
            )}
        <div className="bottom-buttons">
          <Button
            onClick={() => setOpenPopup(true)}
            label="Add Staff Member"
            lightBackgrnd={false}
            icon={<AddIcon />}
            size="large"
          />
        </div>
      </div>

      <Popup
        title="Add Staff Member"
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
        className="staff-popup"
      >
        <div className="add-staff-form">
          <div className="form-field">
            <label>Name</label>
            <TextField
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
              name="email"
              value={newStaff.email}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              placeholder="Enter email"
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <TextField
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
              name="phone"
              value={newStaff.phone}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-field">
            <label>Address</label>
            <TextField
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
