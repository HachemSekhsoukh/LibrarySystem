import React, { useState, useEffect } from "react";
import Table from "../../components/Table";
import Button from '../../components/Button';
import Popup from "../../components/Popup";
import "../../CSS/form.css";
import "./resource_form";
import { TextField, MenuItem, Grid, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddResourceForm from "./resource_form";
import { useTranslation } from 'react-i18next';

const Catalogage = () => {
  const API_BASE_URL = "http://127.0.0.1:5000/";
  const { t } = useTranslation();
  const [openPopup, setOpenPopup] = useState(false);
  const [resources, setResources] = useState([]);
  const [bookData, setBookData] = useState({
    type: "Book",
    title: "",
    author: "",
    editor: "",
    edition: "",
    resume: "",
    isbn: "",
    inventoryNum: "",
    price: "",
    cote: "",
    receivingDate: "",
    status: 1,
    observation: "",
    description: ""
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [resourceTypes, setResourceTypes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentResourceId, setCurrentResourceId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = React.useRef();

  useEffect(() => {
    fetch(`${API_BASE_URL}api/resource-types`)  // Ensure full URL with http://
      .then(res => res.json())
      .then(data => {
        setResourceTypes(data);
      })
      .catch(error => console.error("API Error:", error));
  }, []);

  useEffect(() => {
    fetchResources();
  }, []);
  
  const fetchResources = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}api/resources`);
      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error("API Error:", error);
      setSnackbar({ open: true, message: "Error fetching resources", severity: "error" });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setBookData({ ...bookData, [e.target.name]: e.target.value });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const resetForm = () => {
    setBookData({
      type: "Book",
      title: "",
      author: "",
      editor: "",
      edition: "",
      resume: "",
      isbn: "",
      inventoryNum: "",
      price: "",
      cote: "",
      receivingDate: "",
      status: 1,
      observation: "",
      description: ""
    });
    setIsEditing(false);
    setCurrentResourceId(null);
  };

  const handleAddResource = async () => {
    try {
      // Validate required fields
      if (!bookData.title || !bookData.author || !bookData.inventoryNum || !bookData.description) {
        setSnackbar({ open: true, message: "Title, author, inventory number, and description are required", severity: "error" });
        return;
      }

      const formattedData = {
        r_inventoryNum: bookData.inventoryNum,
        r_title: bookData.title,
        r_author: bookData.author,
        r_editor: bookData.editor,
        r_edition: bookData.edition,
        r_resume: bookData.resume,
        r_ISBN: bookData.isbn,
        r_price: bookData.price,
        r_cote: bookData.cote,
        r_receivingDate: bookData.receivingDate,
        r_status: bookData.status,
        r_observation: bookData.observation,
        r_type: bookData.type,
        r_description: bookData.description
      };
  
      let response;
      if (isEditing) {
        // Update existing resource
        response = await fetch(`${API_BASE_URL}api/resources/${currentResourceId}`, { 
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedData),
        });
      } else {
        // Add new resource
        response = await fetch(`${API_BASE_URL}api/resources`, { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedData),
        });
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
  
      const result = await response.json();
      setSnackbar({ 
        open: true, 
        message: isEditing ? "Resource updated successfully!" : "Resource added successfully!", 
        severity: "success" 
      });
      setOpenPopup(false);
      
      // Reset form data
      resetForm();
      
      // Refresh the resources list
      fetchResources();
    } catch (error) {
      console.error("Error saving resource:", error);
      setSnackbar({ open: true, message: `Failed to save resource: ${error.message}`, severity: "error" });
    }
  };

  const handleEdit = (resource) => {
    setCurrentResourceId(resource.id);
    setBookData({
      type: resource.type,
      title: resource.title,
      author: resource.author,
      editor: resource.editor,
      edition: resource.edition,
      resume: resource.resume,
      isbn: resource.isbn,
      inventoryNum: resource.inventoryNum,
      price: resource.price,
      cote: resource.cote,
      receivingDate: resource.receivingDate || "",
      status: resource.status,
      observation: resource.observation,
      description: resource.description || ""
    });
    setIsEditing(true);
    setOpenPopup(true);
  };

  const handleDelete = (resource) => {
    setResourceToDelete(resource);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}api/resources/${resourceToDelete.id}`, {
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
          message: "Resource deleted successfully!",
          severity: "success"
        });
        fetchResources(); // Refresh the list
      } else {
        throw new Error(result.error || "Failed to delete resource");
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      setSnackbar({
        open: true,
        message: `Failed to delete resource: ${error.message}`,
        severity: "error"
      });
    } finally {
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      setSnackbar({
        open: true,
        message: "Please upload an Excel file (.xlsx)",
        severity: "error"
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}api/resources/import`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: result.message,
          severity: result.errors ? "warning" : "success"
        });
        if (result.errors) {
          console.error("Import errors:", result.errors);
        }
        fetchResources(); // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to import file');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error importing file: ${error.message}`,
        severity: "error"
      });
    } finally {
      setUploading(false);
      setUploadDialogOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const columns = [
    { label: t("id"), key: "id" },
    { label: t("title"), key: "title" },
    { label: t("author"), key: "author" },
    { label: t("type"), key: "type_name" },
    { label: t("status"), key: "status_name" },
    { label: t("ISBN"), key: "isbn" },
  ];

  return (
    <div className="books-page">
      <div className="container">
      {loading ? (
          <div className="loader"></div>
        ) : (
          <>
                <div id="table">
              <Table 
                columns={columns} 
                data={resources} 
                showActions={true} 
                title={t("books")} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
            <div className="bottom-buttons">
              <input
                type="file"
                accept=".xlsx"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                ref={fileInputRef}
              />
              <Button
                onClick={() => fileInputRef.current.click()}
                label={uploading ? t("importing...") : t("import_books")}
                lightBackgrnd={true}
                icon={<FileUploadIcon />}
                size="large"
                disabled={uploading}
              />
              <Button
                onClick={() => {
                  resetForm();
                  setOpenPopup(true);
                }}
                label= {t("add_new_book")}
                lightBackgrnd={false}
                icon={<AddIcon />}
                size="large"
              />
            </div>
          </>)}
      </div>
      
      <Popup title={isEditing ? t("edit_book") : t("add_new_book")} openPopup={openPopup} setOpenPopup={setOpenPopup}>
        <AddResourceForm bookData={bookData} handleChange={handleChange} resourceTypes={resourceTypes} />
        {/* Buttons */}
        <div className="form-buttons">
          <Button onClick={() => {
            resetForm();
            setOpenPopup(false);
          }} label="Cancel" lightBackgrnd={true} />
          <Button onClick={handleAddResource} label={isEditing ? "Update" : "Add"} lightBackgrnd={false} />
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
            {t("sure_to_delete")} "{resourceToDelete?.title}"?
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

export default Catalogage;
