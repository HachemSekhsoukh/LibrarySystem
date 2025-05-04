import React, { useState, useEffect } from "react";
import Table from "../../components/Table";
import Button from '../../components/Button';
import Popup from "../../components/Popup";
import "../../CSS/form.css";
import "./resource_form";
import { TextField, MenuItem, Grid, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Typography, TableHead, TableBody, TableRow, TableCell, Chip, Tabs, Tab, Box } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddResourceForm from "./resource_form";
import { useTranslation } from 'react-i18next';
import { fetchResources, fetchResourceTypes, addResourceType, updateResourceType, deleteResourceType, fetchResourceHistory, fetchResourceComments } from '../../utils/api';

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
  const [history, setHistory] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}api/resource-types`, {credentials: 'include'})
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
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}api/resources`, {credentials: 'include'});
      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }
      const data = await response.json();
      setResources(data || []);
    } catch (error) {
      console.error("API Error:", error);
      setSnackbar({ open: true, message: "Error fetching resources", severity: "error" });
      setResources([]);
    } finally {
      setLoading(false);
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
        response = await fetch(`${API_BASE_URL}api/resources/${currentResourceId}`, { 
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify(formattedData),
        });
      } else {
        response = await fetch(`${API_BASE_URL}api/resources`, { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
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
        method: 'DELETE',
        credentials: 'include'
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
        fetchResources();
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
        credentials: 'include',
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
        fetchResources();
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

  const handleViewHistory = async (resource) => {
    try {
      setSelectedResource(resource);
      setLoadingTransactions(true);
      setLoadingComments(true);
      
      // Fetch both history and comments in parallel
      const [historyData, commentsData] = await Promise.all([
        fetchResourceHistory(resource.id),
        fetchResourceComments(resource.id)
      ]);
      
      setHistory(historyData);
      setComments(commentsData.comments || []);
    } catch (error) {
      console.error('Error fetching resource details:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to fetch resource details', 
        severity: 'error' 
      });
    } finally {
      setLoadingTransactions(false);
      setLoadingComments(false);
      setHistoryDialogOpen(true);
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
                handleViewDetails={handleViewHistory}
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
                label={t("add_new_book")}
                lightBackgrnd={false}
                icon={<AddIcon />}
                size="large"
              />
            </div>
          </>
        )}
      </div>
      
      <Popup title={isEditing ? t("edit_book") : t("add_new_book")} openPopup={openPopup} setOpenPopup={setOpenPopup}>
        <AddResourceForm bookData={bookData} handleChange={handleChange} resourceTypes={resourceTypes} />
        <div className="form-buttons">
          <Button onClick={() => {
            resetForm();
            setOpenPopup(false);
          }} label="Cancel" lightBackgrnd={true} />
          <Button onClick={handleAddResource} label={isEditing ? "Update" : "Add"} lightBackgrnd={false} />
        </div>
      </Popup>

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

      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          {selectedResource?.title}
          <button 
            className="close-button"
            onClick={() => setHistoryDialogOpen(false)}
          >
            &times;
          </button>
        </DialogTitle>
        <DialogContent>
          {/* Book Details Section - Always visible */}
          <Grid container spacing={2} sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Book Details
              </Typography>
            </Grid>
            
            {/* Basic Information */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Inventory Number</Typography>
              <Typography variant="body1">{selectedResource?.inventoryNum || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Type</Typography>
              <Typography variant="body1">{selectedResource?.type_name}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">Title</Typography>
              <Typography variant="body1">{selectedResource?.title}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Author</Typography>
              <Typography variant="body1">{selectedResource?.author}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Editor</Typography>
              <Typography variant="body1">{selectedResource?.editor || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Edition</Typography>
              <Typography variant="body1">{selectedResource?.edition || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">ISBN</Typography>
              <Typography variant="body1">{selectedResource?.isbn || 'N/A'}</Typography>
            </Grid>
            
            {/* Additional Details */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Price</Typography>
              <Typography variant="body1">{selectedResource?.price ? `$${selectedResource.price}` : 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Cote</Typography>
              <Typography variant="body1">{selectedResource?.cote || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Receiving Date</Typography>
              <Typography variant="body1">{selectedResource?.receivingDate || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Number of Borrows</Typography>
              <Typography variant="body1">{selectedResource?.numofborrows || 0}</Typography>
            </Grid>
            
            {/* Status and Description */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Status</Typography>
              <Chip
                label={selectedResource?.status_name}
                color={
                  selectedResource?.status_name === 'Available' ? 'success' :
                  selectedResource?.status_name === 'Borrowed' ? 'warning' :
                  'error'
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Observation</Typography>
              <Typography variant="body1">{selectedResource?.observation || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">Description</Typography>
              <Typography variant="body1">{selectedResource?.description || 'No description available'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">Resume</Typography>
              <Typography variant="body1">{selectedResource?.resume || 'No resume available'}</Typography>
            </Grid>
          </Grid>

          {/* Tabs Section */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="History" />
              <Tab label="Ratings" />
            </Tabs>
          </Box>

          {activeTab === 0 ? (
            // History Tab
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Borrowing History
              </Typography>
              {loadingTransactions ? (
                <div className="loader"></div>
              ) : (
                <Table
                  columns={[
                    { label: "Borrower", key: "borrower_name" },
                    { label: "Reservation Date", key: "reservation_date" },
                    { label: "Borrow Date", key: "borrow_date" },
                    { label: "Due Date", key: "due_date" },
                    { label: "Return Date", key: "return_date" },
                    { 
                      label: "Status", 
                      key: "status",
                      render: (value) => (
                        <Chip
                          label={value}
                          color={
                            value === 'Late' ? 'error' :
                            value === 'Borrowed' ? 'warning' :
                            value === 'Returned' ? 'success' :
                            'info'
                          }
                        />
                      )
                    }
                  ]}
                  data={history || []}
                  title="Resource History"
                />
              )}
            </>
          ) : (
            // Ratings Tab
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Ratings and Comments
              </Typography>
              {loadingComments ? (
                <div className="loader"></div>
              ) : comments.length === 0 ? (
                <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                  No ratings or comments yet.
                </Typography>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {comments.map((comment, index) => (
                    <Box key={index} sx={{ 
                      p: 2, 
                      mb: 2, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1,
                      backgroundColor: '#f9f9f9'
                    }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {comment.user_name || 'Anonymous User'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{ 
                            color: i < comment.rating ? '#ffd700' : '#e0e0e0',
                            fontSize: '1.2rem'
                          }}>
                            ★
                          </span>
                        ))}
                      </Box>
                      <Typography variant="body1">
                        {comment.comment}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default Catalogage;
