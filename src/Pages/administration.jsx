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
  addStaffType,
  assignPrivilegesToUserType
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
  const resetStaffForm = () => {
    setNewStaff({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      birthdate: "",
      staff_type_id: ""
    });
    setErrors({});
  };
  
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [errors, setErrors] = useState({});

  const sections = [
    // "dashboard",
    "logs",
    "administration_staff",
    "administration_staff_types",
    "circulation_readers",
    "circulation_exemplaires",
    "circulation_late",
    "circulation_reader_types",
    "catalogage_books",
    "catalogage_resource_types",

  ];
  
  const permissionTypes = ["view", "edit", "delete", "create"];
  

  const [checkboxValues, setCheckboxValues] = useState({});

  const handleCheckboxChange = (event, section, perm) => {
    const { name, checked } = event.target;
    
    if (name === `select_all_${section}`) {
      // Handle select all logic for the section
      const sectionPermissions = permissionTypes.reduce((acc, permission) => {
        // Skip "create" and "delete" permissions for "late" section
        if (section === "circulation_late" && (permission === "create" || permission === "delete") || (section === "logs" || section === "dashboard") && (permission === "create" || permission === "delete" || permission === "edit")) {
          return acc;
        }
        
        acc[`${permission.toLowerCase()}_${section.toLowerCase().replace(/ /g, "_")}`] = checked;
        return acc;
      }, {});
      
      setCheckboxValues((prev) => ({ ...prev, ...sectionPermissions }));
    } else {
      // Handle individual checkbox change
      setCheckboxValues((prev) => ({ ...prev, [name]: checked }));
    }
  };
  

  const staffTypesColumns = [
    { label: t("id"), key: "id" },
    { label: t("type"), key: "name" },
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
        message: t("failed_to_fetch_staff_types"),
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
      console.log(response);
  
      if (response?.success) {
        const userTypeId = response.staff_type.st_id;
  
        let selectedPrivileges = Object.entries(checkboxValues)
          .filter(([_, checked]) => checked)
          .map(([privilege]) => privilege);
  
        // Auto-add "view_administration" if any "administration" privilege is selected
        if (selectedPrivileges.some((priv) => priv.startsWith("view_administration")) ) {
          selectedPrivileges.push("view_administration");
        }

        if (selectedPrivileges.some((priv) => priv.startsWith("view_circulation_reader_types")) ) {
          selectedPrivileges.push("view_circulation_administration");
        }

        if (selectedPrivileges.some((priv) => priv.startsWith("view_catalogage_resource_types")) ) {
          selectedPrivileges.push("view_catalogage_administration");
        }

        if (selectedPrivileges.some((priv) => priv.startsWith("view_catalogage_books")) ) {
          selectedPrivileges.push("view_catalogage_catalogage");
        }
        selectedPrivileges.push("view_dashboard");
  
        const privResponse = await assignPrivilegesToUserType(
          userTypeId,
          selectedPrivileges
        );
  
        if (!privResponse.success) throw new Error(privResponse.error);
  
        setSnackbar({
          open: true,
          message: t("staff_type_added_success"),
          severity: "success",
        });
  
        setNewStaffType({ st_name: "" });
        setCheckboxValues({});
        setOpenTypePopup(false);
        await fetchStaffTypesData();
      } else {
        throw new Error(t("failed_add_staff_type"));
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error",
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
    setCheckboxValues({});
    setSnackbar({ ...snackbar, open: false });
  };

  const validateInputs = () => {
    const validationErrors = {};

    // Name validation
    if (!newStaff.name) validationErrors.name = t("name_required");

    // Email validation
    if (!newStaff.email) {
        validationErrors.email = t("email_required");
    } else if (!/\S+@\S+\.\S+/.test(newStaff.email)) {
        validationErrors.email = t("email_invalid");
    }

    // Password validation
    if (!newStaff.password) validationErrors.password = t("password_required");

    // Phone number validation (only digits allowed)
    if (!newStaff.phone) {
        validationErrors.phone = t("phone_required");
    } else if (!/^\d+$/.test(newStaff.phone)) {
        validationErrors.phone = t("phone_invalid");
    }

    // Address validation
    if (!newStaff.address) validationErrors.address = t("address_required");

    // Birthdate validation (in correct format, e.g., YYYY-MM-DD)
    if (!newStaff.birthdate) {
        validationErrors.birthdate = t("birthdate_required");
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(newStaff.birthdate)) {
        validationErrors.birthdate = t("birthdate_invalid_format");
    }

    // Staff type validation
    if (!newStaff.staff_type_id) validationErrors.staff_type_id = t("staff_type_required");

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };


  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const response = await addStaffMember(newStaff);
      if (response?.success) {
        setSnackbar({
          open: true,
          message: t("staff_member_added_success"),
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
        throw new Error(t("failed_add_staff_member"));
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
              title={t("staff_members")}
            />
            <div className="bottom-buttons">
              <Button
                onClick={() => setOpenPopup(true)}
                label={t("add_staff_member")}
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
              title={t("staff_types")}
            />
            <div className="bottom-buttons">
              <Button
                onClick={() => setOpenTypePopup(true)}
                label={t("add_staff_type")}
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
        title={t("add_staff_type")}
        openPopup={openTypePopup}
        setOpenPopup={setOpenTypePopup}
      >
        <div className="add-staff-type-form">
          <div className="form-field">
            <label>{t("staff_type_name")}:</label>
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

          <div className="form-field">
            <label >{t("privileges")}:</label>
            {sections.map((section) => (
              <div key={section} className="privilege-section">
                <div id="priv-title">  
                  <h4>{t(section)}:</h4>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name={`select_all_${section}`}
                        checked={permissionTypes.every(perm => checkboxValues[`${perm}_${section.toLowerCase().replace(/ /g, "_")}`])}
                        onChange={(e) => handleCheckboxChange(e, section)}
                      />
                    }
                    label={t("select_all")}
                  />
                </div>

                <Grid container spacing={1}>
                  {permissionTypes.map((perm) => {
                    if((perm == "delete" || perm == "create") && section == "circulation_late" || (perm == "delete" || perm == "create" || perm == "edit") && (section === "logs" || section === "dashboard")){
                      return;
                    }
                    const key = `${perm}_${section.toLowerCase().replace(/ /g, "_")}`;
                    return (
                      <Grid item xs={4} key={t(key)}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name={key}
                              checked={!!checkboxValues[key]}
                              onChange={(e) => handleCheckboxChange(e, section, perm)}
                            />
                          }
                          label={t(perm)}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </div>
            ))}
          </div>


          <div className="dialog-button-container">
            <button className="dialog-cancel-button" onClick={() => setOpenTypePopup(false)}>
              {t("cancel")}
            </button>
            <button className="dialog-save-button" onClick={handleAddStaffType} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : t("Save")}
            </button>
          </div>
        </div>
      </Popup>

      {/* Add Staff Member Popup */}
      <Popup
        title={t("add_staff_member")}
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
        className="staff-popup"
      >
        <div className="add-staff-form">
          <div className="form-field-row">
            <div className="form-field">
              <label>{t("name")}</label>
              <TextField
                className="text-field"
                name="name"
                value={newStaff.name}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                placeholder={t("enter_name")}
                error={!!errors.name}
                helperText={errors.name}
              />
            </div>

            <div className="form-field">
              <label>{t("email")}</label>
              <TextField
                className="text-field"
                name="email"
                value={newStaff.email}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                placeholder={t("enter_email")}
                error={!!errors.email}
                helperText={errors.email}
              />
            </div>
          </div>

          <div className="form-field-row">
            <div className="form-field">
              <label>{t("password")}</label>
              <TextField
                className="text-field"
                name="password"
                value={newStaff.password}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                placeholder={t("password_placeholder")}
                error={!!errors.password}
                helperText={errors.password}
              />
            </div>

            <div className="form-field">
              <label>{t("phone_number")}</label>
              <TextField
                className="text-field"
                name="phone"
                value={newStaff.phone}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                placeholder={t("enter_phone_number")}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </div>
          </div>

          <div className="form-field-row">
            <div className="form-field">
              <label>{t("address")}</label>
              <TextField
                className="text-field"
                name="address"
                value={newStaff.address}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                placeholder={t("enter_address")}
                error={!!errors.address}
                helperText={errors.address}
              />
            </div>

            <div className="form-field">
              <label>{t("birthdate")}</label>
              <TextField
                className="text-field"
                name="birthdate"
                value={newStaff.birthdate}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                type="date"
                InputLabelProps={{ shrink: true }}
                error={!!errors.birthdate}
                helperText={errors.birthdate}
              />
            </div>
          </div>

          <div className="form-field">
            <label>{t("staff_type")}</label>
            <TextField
              select
              className="text-field"
              name="staff_type_id"
              value={newStaff.staff_type_id}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              placeholder={t("select_staff_type")}
              error={!!errors.staff_type_id}
              helperText={errors.staff_type_id}
            >
              {staffTypesData.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div className="dialog-button-container">
            <button className="dialog-cancel-button" onClick={() =>{ setOpenPopup(false); resetStaffForm();}}>
              {t("cancel")}
            </button>
            <button className="dialog-save-button" onClick={handleSubmit} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : t("save")}
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