import "../../CSS/circulation/administration.css";
import React, { useState, useEffect } from "react";
import Table from "../../components/Table";
import Button from '../../components/Button';
import Popup from "../../components/Popup";
import { useTranslation } from 'react-i18next';
import { 
  TextField, 
  MenuItem, 
  Autocomplete, 
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import "../../CSS/circulation/transactions.css";
import { useAuth } from "../../utils/privilegeContext"; // Import the AuthProvider


const CirculationAdministration = () => {
  const API_BASE_URL = "http://127.0.0.1:5000/";
  const { hasPrivilege } = useAuth(); // Use the AuthProvider to check privileges
  const { t } = useTranslation();
  const [readerTypes, setReaderTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPopup, setOpenPopup] = useState(false);
  const [newReaderType, setNewReaderType] = useState({ 
    ut_name: "", 
    ut_borrow: 0,
    ut_books: 0,
    ut_renew: 0
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [isEditing, setIsEditing] = useState(false);
  const [currentReaderTypeId, setCurrentReaderTypeId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [readerTypeToDelete, setReaderTypeToDelete] = useState(null);

  const canEdit = hasPrivilege("edit_circulation_reader_types");
  const canDelete = hasPrivilege("delete_circulation_reader_types");
  const canCreate = hasPrivilege("create_circulation_readers_types");

  useEffect(() => {
    fetchReaderTypes();
  }, []);

  const fetchReaderTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}api/user-types`, {credentials: "include"});
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

  const resetForm = () => {
    setNewReaderType({ 
      ut_name: "", 
      ut_borrow: 0,
      ut_books: 0,
      ut_renew: 0
    });
    setIsEditing(false);
    setCurrentReaderTypeId(null);
  };

  const handleAddReaderType = async () => {
    if (!newReaderType.ut_name) {
      setSnackbar({ open: true, message: "Reader type name is required", severity: "error" });
      return;
    }

    try {
      let response;
      let endpoint = isEditing 
        ? `${API_BASE_URL}api/user-types/${currentReaderTypeId}` 
        : `${API_BASE_URL}api/add-user-types`;

      let method = isEditing ? "PUT" : "POST";

      console.log(endpoint, method)
      
      response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newReaderType),
      });
      console.log(response)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'add'} reader type`);
      }

      const result = await response.json();
      setSnackbar({ 
        open: true, 
        message: isEditing ? "Reader type updated successfully" : "Reader type added successfully", 
        severity: "success" 
      });
      setOpenPopup(false);
      resetForm();
      
      // Refresh the reader types list
      fetchReaderTypes();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} reader type:`, error);
      setSnackbar({ open: true, message: error.message || `Error ${isEditing ? 'updating' : 'adding'} reader type`, severity: "error" });
    }
  };

  const handleEdit = (readerType) => {
    setCurrentReaderTypeId(readerType.id);
    setNewReaderType({
      ut_name: readerType.name,
      ut_borrow: readerType.borrow,
      ut_books: readerType.ut_books || 0,
      ut_renew: readerType.ut_renew || 0
    });
    setIsEditing(true);
    setOpenPopup(true);
  };

  const handleDelete = (readerType) => {
    setReaderTypeToDelete(readerType);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}api/user-types/${readerTypeToDelete.id}`, {
        method: 'DELETE',
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: "Reader type deleted successfully!",
          severity: "success"
        });
        fetchReaderTypes(); // Refresh the list
      } else {
        throw new Error(result.error || "Failed to delete reader type");
      }
    } catch (error) {
      console.error("Error deleting reader type:", error);
      setSnackbar({
        open: true,
        message: `Failed to delete reader type: ${error.message}`,
        severity: "error"
      });
    } finally {
      setDeleteDialogOpen(false);
      setReaderTypeToDelete(null);
    }
  };

  const columns = [
    { label: t("name"), key: "name" },
    { label: t("borrow_limit"), key: "borrow" },
    { label: t("books_limit"), key: "ut_books" },
    { label: t("renewal_days"), key: "ut_renew" }
  ];

  return (
    <div className="circulation-administration-page">
      <div className="container">
      {loading ? (
          <div className="loader"></div>
        ) : (
        <>
            <div id="table">
              <Table 
                columns={columns} 
                data={readerTypes} 
                showActions= {canEdit || canDelete} 
                showEdit={canEdit} // Pass privilege-based control for edit
                showDelete={canDelete} // Pass privilege-based control for delete
                title={t("reader_types")} 
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
            <div className="bottom-buttons">
              <Button 
                onClick={() => {
                  resetForm();
                  setOpenPopup(true);
                }}
                disabled={!canCreate}
                label={t("add_new_reader_type")} 
                lightBackgrnd={false} 
                icon={<AddIcon />} 
                size="large" 
              />
            </div>
        </>)}
        
      </div>
      
      {/* Add/Edit Reader Type Popup */}
      <Popup title={isEditing ? t("edit_reader_type") : t("add_new_reader_type")} openPopup={openPopup} setOpenPopup={setOpenPopup}>
        <div className="add-reader-type-form">
          <div className="form-row">
            <div className="form-group">
              <label>{t("name")}</label>
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
              <label>{t("borrow_limit")}</label>
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
          <div className="form-row">
            <div className="form-group">
              <label>{t("books_limit")}</label>
              <TextField 
                fullWidth 
                type="number"
                name="ut_books"
                value={newReaderType.ut_books} 
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </div>
            <div className="form-group">
              <label>{t("renewal_days")}</label>
              <TextField 
                fullWidth 
                type="number"
                name="ut_renew"
                value={newReaderType.ut_renew} 
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </div>
          </div>

          <div className="dialog-button-container">
            <button className="dialog-cancel-button" onClick={() => {
              resetForm();
              setOpenPopup(false);
            }}>{t("cancel")}</button>
            <button className="dialog-save-button" onClick={handleAddReaderType}>
              {isEditing ? t("update") : t("save")}
            </button>
          </div>
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
            {t("sure_to_delete_reader_type")} "{readerTypeToDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} label={t("cancel")} lightBackgrnd={true} />
          <Button onClick={confirmDelete} label={t("delete")} lightBackgrnd={false} />
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default CirculationAdministration;