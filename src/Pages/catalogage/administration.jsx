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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import "../../CSS/Circulation/transactions.css";
import { useTranslation } from "react-i18next";


const CatalogageAdministration = () => {
  const API_BASE_URL = "http://127.0.0.1:5000/";
  const { t } = useTranslation(); // Get translation function
  const [resourceTypes, setResourceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPopup, setOpenPopup] = useState(false);
  const [newResourceType, setNewResourceType] = useState({ 
    rt_name: "", 
    rt_borrow: 0
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [isEditing, setIsEditing] = useState(false);
  const [currentResourceTypeId, setCurrentResourceTypeId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceTypeToDelete, setResourceTypeToDelete] = useState(null);

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

  const resetForm = () => {
    setNewResourceType({ 
      rt_name: "", 
      rt_borrow: 0
    });
    setIsEditing(false);
    setCurrentResourceTypeId(null);
  };

  const handleAddResourceType = async () => {
    if (!newResourceType.rt_name) {
      setSnackbar({ open: true, message: "Resource type name is required", severity: "error" });
      return;
    }

    try {
      let response;
      let endpoint = isEditing 
        ? `${API_BASE_URL}api/resource-types/${currentResourceTypeId}` 
        : `${API_BASE_URL}api/resource-types`;

      let method = isEditing ? "PUT" : "POST";
      
      response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResourceType),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'add'} resource type`);
      }

      const result = await response.json();
      setSnackbar({ 
        open: true, 
        message: isEditing ? "Resource type updated successfully" : "Resource type added successfully", 
        severity: "success" 
      });
      setOpenPopup(false);
      resetForm();
      
      // Refresh the resource types list
      fetchResourceTypes();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} resource type:`, error);
      setSnackbar({ open: true, message: error.message || `Error ${isEditing ? 'updating' : 'adding'} resource type`, severity: "error" });
    }
  };

  const handleEdit = (resourceType) => {
    setCurrentResourceTypeId(resourceType.id);
    setNewResourceType({
      rt_name: resourceType.name,
      rt_borrow: resourceType.borrow
    });
    setIsEditing(true);
    setOpenPopup(true);
  };

  const handleDelete = (resourceType) => {
    setResourceTypeToDelete(resourceType);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}api/resource-types/${resourceTypeToDelete.id}`, {
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
          message: "Resource type deleted successfully!",
          severity: "success"
        });
        fetchResourceTypes(); // Refresh the list
      } else {
        throw new Error(result.error || "Failed to delete resource type");
      }
    } catch (error) {
      console.error("Error deleting resource type:", error);
      setSnackbar({
        open: true,
        message: `Failed to delete resource type: ${error.message}`,
        severity: "error"
      });
    } finally {
      setDeleteDialogOpen(false);
      setResourceTypeToDelete(null);
    }
  };

  const columns = [
    { label: t("id"), key: "id" },
    { label: t("name"), key: "name" },
    { label: t("borrow_limit"), key: "borrow" }
  ];

  return (
    <div className="Catalogage-administration-page">
      <div className="container">
      {loading ? (
          <div className="loader"></div>
        ) : (
        <>
          <div id="table">
            <Table 
              columns={columns} 
              data={resourceTypes} 
              showActions={true} 
              title={t("resource_types")} 
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
              label= {t("add_new_resource_type")} 
              lightBackgrnd={false} 
              icon={<AddIcon />} 
              size="large" 
            />
          </div>
        </>)}
      </div>
      
      {/* Add/Edit New Resource Type Popup */}
      <Popup title={isEditing ? t("edit_resource_type") : t("add_new_resource_type")} openPopup={openPopup} setOpenPopup={setOpenPopup}>
        <div className="add-resource-type-form">
          <div className="form-row">
            <div className="form-group">
              <label>{t("name")}</label>
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
              <label>{t("borrow_limit")}</label>
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
            <button className="dialog-cancel-button" onClick={() => {
              resetForm();
              setOpenPopup(false);
            }}>{t("cancel")}</button>
            <button className="dialog-save-button" onClick={handleAddResourceType}>
              {isEditing ? t('update') : t('save')}
            </button>
          </div>
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
            Are you sure you want to delete the resource type "{resourceTypeToDelete?.name}"?
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

export default CatalogageAdministration;