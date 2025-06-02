import React, { useState, useEffect } from "react";
import Table from "../../components/Table";
import Button from '../../components/Button';
import Popup from "../../components/Popup";
import "../../CSS/form.css";
import "./resource_form";
import { TextField, MenuItem, Grid, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Typography, TableHead, TableBody, TableRow, TableCell, Chip, Tabs, Tab, Box, IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddResourceForm from "./resource_form";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../utils/privilegeContext"; // Import the AuthProvider
import { 
  fetchResources, 
  fetchResourceTypes, 
  addResource, 
  updateResource, 
  deleteResource, 
  importResources,
  fetchResourceHistory, 
  fetchResourceComments, 
  fetchCommentReports,
  deleteComment
} from '../../utils/api';

const Catalogage = () => {
  const { hasPrivilege } = useAuth(); // Use the AuthProvider to check privileges
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
  const [reportedComments, setReportedComments] = useState([]);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const canEdit = hasPrivilege("edit_catalogage_books");
  const canDelete = hasPrivilege("delete_catalogage_books");
  const canCreate = hasPrivilege("create_catalogage_books");

  useEffect(() => {
    fetchResourceTypes()
      .then(data => {
        setResourceTypes(data);
      })
      .catch(error => console.error("API Error:", error));
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await fetchResources();
      setResources(data || []);
    } catch (error) {
      console.error("API Error:", error);
      setSnackbar({ open: true, message: "Error fetching resources", severity: "error" });
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

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
  
      let result;
      if (isEditing) {
        result = await updateResource(currentResourceId, formattedData);
      } else {
        result = await addResource(formattedData);
      }
  
      setSnackbar({ 
        open: true, 
        message: isEditing ? "Resource updated successfully!" : "Resource added successfully!", 
        severity: "success" 
      });
      setOpenPopup(false);
      
      resetForm();
      loadResources();
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
      const result = await deleteResource(resourceToDelete.id);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: "Resource deleted successfully!",
          severity: "success"
        });
        loadResources();
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

    try {
      const result = await importResources(file);

      setSnackbar({
        open: true,
        message: result.message,
        severity: result.errors ? "warning" : "success"
      });
      if (result.errors) {
        console.error("Import errors:", result.errors);
      }
      loadResources();
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
      const [history, comments, reports] = await Promise.all([
        fetchResourceHistory(resource.id),
        fetchResourceComments(resource.id),
        fetchCommentReports(resource.id)
      ]);
      
      console.log('Resource History:', history);
      console.log('Resource Comments:', comments);
      console.log('Comment Reports:', reports);
      
      setHistory(history);
      // The API returns { success: true, comments: [...] }
      setComments(comments.success ? comments.comments : []);
      setReportedComments(reports.reports || []);
      
      setHistoryDialogOpen(true);
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
    }
  };

  const handleViewReports = (comment) => {
    setSelectedComment(comment);
    setReportDialogOpen(true);
  };

  const handleDeleteComment = async () => {
    try {
      await deleteComment(commentToDelete.rat_id);

      setSnackbar({
        open: true,
        message: 'Comment deleted successfully',
        severity: 'success'
      });

      // Refresh comments
      const [comments, reports] = await Promise.all([
        fetchResourceComments(selectedResource.id),
        fetchCommentReports(selectedResource.id)
      ]);
      setComments(comments.success ? comments.comments : []);
      setReportedComments(reports.reports || []);
    } catch (error) {
      console.error('Error deleting comment:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete comment',
        severity: 'error'
      });
    } finally {
      setDeleteCommentDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const columns = [
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
                showEdit={canEdit} // Pass privilege-based control for edit
                showDelete={canDelete} // Pass privilege-based control for delete
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
                disabled={!canCreate}
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
            {t("sure_to_delete") + " \"" + (resourceToDelete?.title || "") + "\"?"}
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
          {/* Tabs Section */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Details" />
              <Tab label="History" />
              <Tab label="Ratings" />
            </Tabs>
          </Box>

          {activeTab === 0 && selectedResource ? (
            /* Book Details Section - Moved into a tab */
            <Grid container spacing={2} sx={{ mb: 3, p: 2, borderRadius: 1 }}>
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
          ) : activeTab === 1 ? (
            // History Tab
            <>
              
              {loadingTransactions ? (
                <div className="loader"></div>
              ) : (
                history && history.length > 0 ? (
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
                            label={
                              value === 'Borrow' ? 'Borrowed' :
                              value === 'Renew_1' ? 'Renew 1' :
                              value === 'Renew_2' ? 'Renew 2' :
                              value === 'Late' ? 'Late' :
                              value === 'Return' ? 'Returned' :
                              value
                            }
                            color={
                              value === 'Late' ? 'error' :
                              value === 'Borrow' ? 'warning' :
                              value === 'Renew_1' ? 'info' :
                              value === 'Renew_2' ? 'info' :
                              value === 'Return' ? 'success' :
                              'default'
                            }
                            size="small"
                          />
                        )
                      }
                    ]}
                    data={history}
                    title="Resource History"
                  />
                ) : (
                  <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                    No history records found for this resource.
                  </Typography>
                )
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
                  {/* Sort comments to show reported ones first */}
                  {[...comments]
                    .sort((a, b) => {
                      const aReported = reportedComments.some(r => r.comment_id === a.rat_id);
                      const bReported = reportedComments.some(r => r.comment_id === b.rat_id);
                      return bReported - aReported;
                    })
                    .map((comment) => {
                      const isReported = reportedComments.some(r => r.comment_id === comment.rat_id);
                      const reportCount = reportedComments.filter(r => r.comment_id === comment.rat_id).length;
                      
                      return (
                        <Box key={comment.rat_id} sx={{ 
                          p: 2, 
                          mb: 2, 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 1,
                          backgroundColor: isReported ? '#fff3f3' : '#f9f9f9',
                          position: 'relative'
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle1" gutterBottom>
                              {comment.User?.u_name || 'Anonymous User'}
                            </Typography>
                            <Box>
                              {isReported && (
                                <Chip
                                  label={`${reportCount} Report${reportCount > 1 ? 's' : ''}`}
                                  color="error"
                                  size="small"
                                  onClick={() => handleViewReports(comment)}
                                  sx={{ mr: 1 }}
                                />
                              )}
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setCommentToDelete(comment);
                                  setDeleteCommentDialogOpen(true);
                                }}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
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
                            {new Date(comment.rat_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      );
                    })}
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Reports for Comment
          <button 
            className="close-button"
            onClick={() => setReportDialogOpen(false)}
          >
            &times;
          </button>
        </DialogTitle>
        <DialogContent>
          {selectedComment && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Comment by: {selectedComment.User?.u_name || 'Anonymous User'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedComment.comment}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Reports ({reportedComments.filter(r => r.comment_id === selectedComment.rat_id).length})
              </Typography>
              {reportedComments
                .filter(r => r.comment_id === selectedComment.rat_id)
                .map((report, index) => (
                  <Box key={index} sx={{ 
                    p: 2, 
                    mb: 1, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1,
                    backgroundColor: '#f9f9f9'
                  }}>
                    <Typography variant="subtitle2" color="error">
                      Report #{index + 1}
                    </Typography>
                    <Typography variant="body2">
                      Reason: {report.reason}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Reported on: {new Date(report.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)} label="Close" lightBackgrnd={true} />
        </DialogActions>
      </Dialog>

      {/* Add Delete Comment Dialog */}
      <Dialog
        open={deleteCommentDialogOpen}
        onClose={() => setDeleteCommentDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this comment?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCommentDialogOpen(false)} label="Cancel" lightBackgrnd={true} />
          <Button onClick={handleDeleteComment} label="Delete" lightBackgrnd={false} />
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default Catalogage;
