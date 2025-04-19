import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import Button from '../components/Button';
import Popup from "../components/Popup";
import {
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl, Checkbox, FormControlLabel, Grid
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import "../CSS/administration.css";
import {
  fetchAllStaff,
  addStaffMember,
  fetchStaffTypes,
  addStaffType
} from "../utils/api";

// Importing the i18n hook
import { useTranslation } from "react-i18next";

const Administration = () => {
  const { t } = useTranslation(); // Get translation function
  
  const [staffTypesData, setStaffTypesData] = useState([]);
  const [openTypePopup, setOpenTypePopup] = useState(false);
  const [newStaffType, setNewStaffType] = useState({ st_name: "" });
  const [staffData, setStaffData] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    birthdate: "",
    staff_type_id: ""
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Example checkbox options
  const checkboxOptions = [
    "Can View",
    "Can Edit",
    "Can Delete",
    "Can Create",
    "Can Manage Users",
    "Can Export Data",
  ];

  const [checkboxValues, setCheckboxValues] = useState({});

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxValues((prev) => ({ ...prev, [name]: checked }));
  };

  const staffTypesColumns = [
    { label: t("id"), key: "id" },  // Translated label
    { label: t("type"), key: "name" },  // Translated label
  ];

  const columns = [
    { label: t("id"), key: "id" },
    { label: t("name"), key: "name" },
    { label: t("email"), key: "email" },
    { label: t("phone_number"), key: "phone" },
    { label: t("address"), key: "address" },
    { label: t("birthdate"), key: "birthdate" }
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
        message: t("failed_to_fetch_staff_types"), // Translated error message
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
          message: t("staff_type_added_success"), // Translated success message
          severity: "success"
        });
        setNewStaffType({ st_name: "" });
        setOpenTypePopup(false);
        await fetchStaffTypesData();
      } else {
        throw new Error(t("error_add_staff_type")); // Translated error message
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
          message: t("staff_member_added_success"), // Translated success message
          severity: "success"
        });
        setNewStaff({
          name: "",
          email: "",
          password: "",
          phone: "",
          address: "",
          birthdate: "",
          staff_type_id: ""
        });
        setOpenPopup(false);
        await fetchStaffData();
      } else {
        throw new Error(t("error_add_staff_member")); // Translated error message
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
              title={t("staff_members")} // Translated title
            />
            <div className="bottom-buttons">
              <Button
                onClick={() => setOpenPopup(true)}
                label={t("add_staff_member")} // Translated button label
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
              title={t("staff_types")} // Translated title
            />
            <div className="bottom-buttons">
              <Button
                onClick={() => setOpenTypePopup(true)}
                label={t("add_staff_type")} // Translated button label
                lightBackgrnd={false}
                icon={<AddIcon />}
                size="large"
              />
            </div>
          </>
        )}
      </div>

      {/* Add Staff Type Popup */}
      <Popup
        title={t("add_staff_type")} // Translated title
        openPopup={openTypePopup}
        setOpenPopup={setOpenTypePopup}
      >
        <div className="add-staff-type-form">
          <div className="form-field">
            <label>{t("staff_type_name")}</label> 
            <TextField
              className="text-field"
              name="st_name"
              value={newStaffType.st_name}
              onChange={handleTypeChange}
              variant="outlined"
              fullWidth
              placeholder={t("enter_staff_type_name")} 
            />
          </div>

          {/* Checkboxes in grid */}
          <div className="form-field">
            <label>{t("privelages")}</label> {/* Translated label */}
            <Grid container spacing={1}>
              {checkboxOptions.map((option, index) => (
                <Grid item xs={6} key={index}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name={option}
                        checked={!!checkboxValues[option]}
                        onChange={handleCheckboxChange}
                      />
                    }
                    label={t(option)} 
                  />
                </Grid>
              ))}
            </Grid>
          </div>

          <div className="dialog-button-container">
            <button className="dialog-cancel-button" onClick={() => setOpenTypePopup(false)}>
              {t("cancel")} {/* Translated button label */}
            </button>
            <button className="dialog-save-button" onClick={handleAddStaffType} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : t("Save")} {/* Translated button label */}
            </button>
          </div>
        </div>
      </Popup>

      {/* Add Staff Member Popup */}
      <Popup
        title={t("add_staff_member")} // Translated title
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
        className="staff-popup"
      >
        <div className="add-staff-form">
          <div className="form-field-row">
            <div className="form-field">
              <label>{t("name")}</label> {/* Translated label */}
              <TextField
                className="text-field"
                name="name"
                value={newStaff.name}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                placeholder={t("enter_name")}
              />
            </div>

            <div className="form-field">
              <label>{t("email")}</label> {/* Translated label */}
              <TextField
                className="text-field"
                name="email"
                value={newStaff.email}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                placeholder={t("enter_email")}
              />
            </div>
          </div>

          <div className="form-field-row">
            <div className="form-field">
              <label>{t("password")}</label> {/* Translated label */}
              <TextField
                className="text-field"
                name="password"
                value={newStaff.password}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                placeholder={t("password_placeholder")}
              />
            </div>

            <div className="form-field">
              <label>{t("phone_number")}</label> {/* Translated label */}
              <TextField
                className="text-field"
                name="phone"
                value={newStaff.phone}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                placeholder={t("enter_phone_number")} 
              />
            </div>
          </div>

          <div className="form-field-row">
            <div className="form-field">
              <label>{t("address")}</label> {/* Translated label */}
              <TextField
                className="text-field"
                name="address"
                value={newStaff.address}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                placeholder={t("enter_address")}
              />
            </div>

            <div className="form-field">
              <label>{t("birthdate")}</label> {/* Translated label */}
              <TextField
                className="text-field"
                name="birthdate"
                value={newStaff.birthdate}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </div>

          <div className="form-field">
            <label>{t("staff_type")}</label> {/* Translated label */}
            <TextField
              select
              className="text-field"
              name="staff_type_id"
              value={newStaff.staff_type_id}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              placeholder={t("select_staff_type")}
            >
              {staffTypesData.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div className="dialog-button-container">
            <button className="dialog-cancel-button" onClick={() => setOpenPopup(false)}>
              {t("cancel")} {/* Translated button label */}
            </button>
            <button className="dialog-save-button" onClick={handleSubmit} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : t("save")} {/* Translated button label */}
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