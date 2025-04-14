import React, { useState, useEffect } from "react";
import Table from "../../components/Table";
import Button from '../../components/Button';
import Popup from "../../components/Popup";
import "../../CSS/form.css";
import "./resource_form";
import { TextField, MenuItem, Grid, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddResourceForm from "./resource_form";

const Catalogage = () => {
  const API_BASE_URL = "http://127.0.0.1:5000/";
  const [openPopup, setOpenPopup] = useState(false);
  const [resources, setResources] = useState([]);
  const [bookData, setBookData] = useState({
    type: "Book",
    title: "",
    author: "",
    editor: "",
    isbn: "",
    issn: "",
    inventoryNum: "",
    price: "",
    cote: "",
    receivingDate: "",
    status: 1,
    observation: ""
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [resourceTypes, setResourceTypes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentResourceId, setCurrentResourceId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);

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
      isbn: "",
      issn: "",
      inventoryNum: "",
      price: "",
      cote: "",
      receivingDate: "",
      status: 1,
      observation: ""
    });
    setIsEditing(false);
    setCurrentResourceId(null);
  };

  const handleAddResource = async () => {
    try {
      // Validate required fields
      if (!bookData.title || !bookData.author || !bookData.inventoryNum) {
        setSnackbar({ open: true, message: "Title, author, and inventory number are required", severity: "error" });
        return;
      }

      const formattedData = {
        r_inventoryNum: bookData.inventoryNum,
        r_title: bookData.title,
        r_author: bookData.author,
        r_editor: bookData.editor,
        r_ISBN: bookData.isbn,
        r_price: bookData.price,
        r_cote: bookData.cote,
        r_receivingDate: bookData.receivingDate,
        r_status: bookData.status,
        r_observation: bookData.observation,
        r_type: bookData.type,
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
      isbn: resource.isbn,
      issn: "",
      inventoryNum: resource.inventoryNum,
      price: resource.price,
      cote: resource.cote,
      receivingDate: resource.receivingDate || "",
      status: resource.status,
      observation: resource.observation
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

  const columns = [
    { label: "ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Author", key: "author" },
    { label: "Type", key: "type_name" },
    { label: "Status", key: "status_name" },
    { label: "ISBN", key: "isbn" },
  ];

  return (
    <div className="books-page">
      <div className="container">
        <div id="table">
          <Table 
            columns={columns} 
            data={resources} 
            showActions={true} 
            title={"Books"} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
        <div className="bottom-buttons">
          <Button
            onClick={() => {}}
            label="Import Books"
            lightBackgrnd={true}
            icon={<FileUploadIcon />}
            size="large"
          />
          <Button
            onClick={() => {
              resetForm();
              setOpenPopup(true);
            }}
            label="Add New Book"
            lightBackgrnd={false}
            icon={<AddIcon />}
            size="large"
          />
        </div>
      </div>
      
      <Popup title={isEditing ? "Edit Book" : "Add Book"} openPopup={openPopup} setOpenPopup={setOpenPopup}>
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
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the book "{resourceToDelete?.title}"?
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
