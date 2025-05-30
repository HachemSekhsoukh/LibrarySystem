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
  FormControl, Checkbox, FormControlLabel, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Autocomplete
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import "../CSS/administration.css";
import {
  fetchAllStaff,
  addStaffMember,
  fetchStaffTypes,
  addStaffType,
  assignPrivilegesToUserType,
  updateStaffMember,
  deleteStaffMember,
  updateStaffType,
  deleteStaffType
} from "../utils/api";
import { useAuth } from "../utils/privilegeContext"; // Import the AuthProvider
// Importing the i18n hook
import { useTranslation } from "react-i18next";


const Administration = () => {
  const { t } = useTranslation(); // Get translation function
  const { hasPrivilege } = useAuth(); // Use the AuthProvider to check privileges
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

  const canEditStaff = hasPrivilege("edit_administration_staff");
  const canDeleteStaff = hasPrivilege("delete_administration_staff");
  const canCreateStaff = hasPrivilege("create_administration_staff");

  const canEditStaffType = hasPrivilege("edit_administration_staff_types");
  const canDeleteStaffType = hasPrivilege("delete_administration_staff_types");
  const canCreateStaffType = hasPrivilege("create_administration_staff_types");

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

  // Edit states
  const [editStaffPopup, setEditStaffPopup] = useState(false);
  const [editStaffTypePopup, setEditStaffTypePopup] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState(null);
  const [staffTypeToEdit, setStaffTypeToEdit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isStaffType, setIsStaffType] = useState(false);

  const staffTypesColumns = [
    { label: t("type"), key: "name" },
  ];

  const columns = [
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
        staff_type_id: member.s_type
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

      if (response?.success) {
        const userTypeId = response.staff_type.st_id;

        let selectedPrivileges = Object.entries(checkboxValues)
          .filter(([_, checked]) => checked)
          .map(([privilege]) => privilege);

        // Auto-add related privileges
        if (selectedPrivileges.some((priv) => priv.startsWith("view_administration"))) {
          selectedPrivileges.push("view_administration");
        }
        if (selectedPrivileges.some((priv) => priv.startsWith("view_circulation_reader_types"))) {
          selectedPrivileges.push("view_circulation_administration");
        }
        if (selectedPrivileges.some((priv) => priv.startsWith("view_catalogage_resource_types"))) {
          selectedPrivileges.push("view_catalogage_administration");
        }
        if (selectedPrivileges.some((priv) => priv.startsWith("view_catalogage_books"))) {
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
          severity: "success"
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
        message: error.message,
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

  const handleAddStaff = async () => {
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
        message: error.message,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit handlers
  const handleEditStaff = (staff) => {
    // Find the staff type object that matches the staff's type ID
    const staffType = staffTypesData.find(type => type.id === staff.staff_type_id);
    
    setStaffToEdit({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      address: staff.address,
      birthdate: staff.birthdate,
      staff_type_id: staffType ? staffType.id : "",
      password: "" // Don't populate password for security reasons
    });
    setEditStaffPopup(true);
  };

  const handleEditStaffType = (staffType) => {
    setStaffTypeToEdit({
      id: staffType.id,
      name: staffType.name
    });
    setEditStaffTypePopup(true);
  };

  const handleUpdateStaff = async () => {
    setLoading(true);
    try {
      // Create a copy of the staff data to send
      const staffDataToUpdate = { ...staffToEdit };
      
      // If password is empty, remove it from the data
      if (!staffDataToUpdate.password) {
        delete staffDataToUpdate.password;
      }

      const response = await updateStaffMember(staffToEdit.id, staffDataToUpdate);

      if (response?.success) {
        setSnackbar({
          open: true,
          message: t("staff_member_updated_success"),
          severity: "success"
        });
        setEditStaffPopup(false);
        setStaffToEdit(null);
        await fetchStaffData();
      } else {
        throw new Error(response?.error || t("failed_update_staff_member"));
      }
    } catch (error) {
      console.error('Update error:', error);
      setSnackbar({
        open: true,
        message: error.message || t("failed_update_staff_member"),
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStaffType = async () => {
    setLoading(true);
    try {
      const response = await updateStaffType(staffTypeToEdit.id, staffTypeToEdit);

      if (response?.success) {
        setSnackbar({
          open: true,
          message: t("staff_type_updated_success"),
          severity: "success"
        });
        setEditStaffTypePopup(false);
        setStaffTypeToEdit(null);
        await fetchStaffTypesData();
      } else {
        throw new Error(t("failed_update_staff_type"));
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteStaff = (staff) => {
    setItemToDelete(staff);
    setIsStaffType(false);
    setDeleteDialogOpen(true);
  };

  const handleDeleteStaffType = (staffType) => {
    setItemToDelete(staffType);
    setIsStaffType(true);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      let response;
      if (isStaffType) {
        response = await deleteStaffType(itemToDelete.id);
      } else {
        response = await deleteStaffMember(itemToDelete.id);
      }

      if (response?.success) {
        setSnackbar({
          open: true,
          message: isStaffType ? t("staff_type_deleted_success") : t("staff_member_deleted_success"),
          severity: "success"
        });
        if (isStaffType) {
          await fetchStaffTypesData();
        } else {
          await fetchStaffData();
        }
      } else {
        throw new Error(response?.message || t("failed_to_delete"));
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error"
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
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
              showActions={canEditStaff ||canDeleteStaff}
              showEdit={canEditStaff} // Control edit button visibility
              showDelete={canDeleteStaff} // Control delete button visibility
              title={t("staff_members")}
              onEdit={handleEditStaff}
              onDelete={handleDeleteStaff}
            />
            <div className="bottom-buttons">
              <Button
                onClick={() => setOpenPopup(true)}
                disabled={!canCreateStaff}
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
              showActions={canEditStaffType ||canDeleteStaffType}
              showEdit={canEditStaffType} // Control edit button visibility for staff types
              showDelete={canDeleteStaffType} // Control delete button visibility for staff types
              title={t("staff_types")}
              onEdit={handleEditStaffType}
              onDelete={handleDeleteStaffType}
            />
            <div className="bottom-buttons">
              <Button
                onClick={() => {
                  setNewStaffType({ st_name: "" });
                  setCheckboxValues({});
                  setOpenTypePopup(true);
                }}
                disabled={!canCreateStaffType}
                label={t("add_staff_type")}
                lightBackgrnd={false}
                icon={<AddIcon />}
                size="large"
              />
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t("confirm_delete")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("sure_to_delete")} {isStaffType ? t("staff_type") : t("staff_member")} "{itemToDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} label={t("cancel")} lightBackgrnd={true} />
          <Button onClick={confirmDelete} label={t("delete")} lightBackgrnd={false} />
        </DialogActions>
      </Dialog>

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
            <button className="dialog-cancel-button" onClick={() => setOpenPopup(false)}>
              {t("cancel")}
            </button>
            <button className="dialog-save-button" onClick={handleAddStaff} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : t("save")}
            </button>
          </div>
        </div>
      </Popup>

      {/* Edit Staff Member Popup */}
      <Popup
        title={t("edit_staff_member")}
        openPopup={editStaffPopup}
        setOpenPopup={setEditStaffPopup}
        className="staff-popup"
      >
        <div className="add-staff-form">
          <div className="form-field-row">
            <div className="form-field">
              <label>{t("name")}</label>
              <TextField
                className="text-field"
                name="name"
                value={staffToEdit?.name || ""}
                onChange={(e) => setStaffToEdit({...staffToEdit, name: e.target.value})}
                variant="outlined"
                fullWidth
                placeholder={t("enter_name")}
              />
            </div>

            <div className="form-field">
              <label>{t("email")}</label>
              <TextField
                className="text-field"
                name="email"
                value={staffToEdit?.email || ""}
                onChange={(e) => setStaffToEdit({...staffToEdit, email: e.target.value})}
                variant="outlined"
                fullWidth
                placeholder={t("enter_email")}
              />
            </div>
          </div>

          <div className="form-field-row">
            <div className="form-field">
              <label>{t("password")} ({t("leave_blank_to_keep_current")})</label>
              <TextField
                className="text-field"
                name="password"
                value={staffToEdit?.password || ""}
                onChange={(e) => setStaffToEdit({...staffToEdit, password: e.target.value})}
                variant="outlined"
                fullWidth
                placeholder={t("password_placeholder")}
              />
            </div>

            <div className="form-field">
              <label>{t("phone_number")}</label>
              <TextField
                className="text-field"
                name="phone"
                value={staffToEdit?.phone || ""}
                onChange={(e) => setStaffToEdit({...staffToEdit, phone: e.target.value})}
                variant="outlined"
                fullWidth
                placeholder={t("enter_phone_number")}
              />
            </div>
          </div>

          <div className="form-field-row">
            <div className="form-field">
              <label>{t("address")}</label>
              <TextField
                className="text-field"
                name="address"
                value={staffToEdit?.address || ""}
                onChange={(e) => setStaffToEdit({...staffToEdit, address: e.target.value})}
                variant="outlined"
                fullWidth
                placeholder={t("enter_address")}
              />
            </div>

            <div className="form-field">
              <label>{t("birthdate")}</label>
              <TextField
                className="text-field"
                name="birthdate"
                value={staffToEdit?.birthdate || ""}
                onChange={(e) => setStaffToEdit({...staffToEdit, birthdate: e.target.value})}
                variant="outlined"
                fullWidth
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </div>

          <div className="form-field">
            <label>{t("staff_type")}</label>
            <TextField
              select
              className="text-field"
              name="staff_type_id"
              value={staffToEdit?.staff_type_id || ""}
              onChange={(e) => setStaffToEdit({...staffToEdit, staff_type_id: e.target.value})}
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
            <button className="dialog-cancel-button" onClick={() => setEditStaffPopup(false)}>
              {t("cancel")}
            </button>
            <button className="dialog-save-button" onClick={handleUpdateStaff} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : t("save")}
            </button>
          </div>
        </div>
      </Popup>

      {/* Edit Staff Type Popup */}
      <Popup
        title={t("edit_staff_type")}
        openPopup={editStaffTypePopup}
        setOpenPopup={setEditStaffTypePopup}
      >
        <div className="add-staff-type-form">
          <div className="form-field">
            <label>{t("staff_type_name")}:</label>
            <TextField
              className="text-field"
              name="name"
              value={staffTypeToEdit?.name || ""}
              onChange={(e) => setStaffTypeToEdit({...staffTypeToEdit, name: e.target.value})}
              variant="outlined"
              fullWidth
              placeholder={t("enter_staff_type_name")}
            />
          </div>

          <div className="dialog-button-container">
            <button className="dialog-cancel-button" onClick={() => setEditStaffTypePopup(false)}>
              {t("cancel")}
            </button>
            <button className="dialog-save-button" onClick={handleUpdateStaffType} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : t("Save")}
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