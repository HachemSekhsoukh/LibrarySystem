import React, { useState, useEffect } from "react";
import Table from "../../components/Table";
import Button from '../../components/Button';
import Popup from "../../components/Popup";
import "../../CSS/form.css";
import "./resource_form";
import { TextField, MenuItem, Grid, Snackbar, Alert } from "@mui/material";
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
  
      const response = await fetch(`${API_BASE_URL}api/resources`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
  
      const result = await response.json();
      setSnackbar({ open: true, message: "Resource added successfully!", severity: "success" });
      setOpenPopup(false);
      
      // Reset form data
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
      
      // Refresh the resources list
      fetchResources();
    } catch (error) {
      console.error("Error adding resource:", error);
      setSnackbar({ open: true, message: `Failed to add resource: ${error.message}`, severity: "error" });
    }
  };
  

  const columns = [
    { label: "ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Author", key: "author" },
    { label: "Type", key: "type" },
    { label: "Status", key: "status" },
    { label: "ISBN", key: "isbn" },
  ];

  return (
    <div className="books-page">
      <div className="container">
        <div id="table">
          <Table columns={columns} data={resources} showActions={true} title={"Books"} />
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
            onClick={() => setOpenPopup(true)}
            label="Add New Book"
            lightBackgrnd={false}
            icon={<AddIcon />}
            size="large"
          />
        </div>
      </div>
      <Popup title="Add Book" openPopup={openPopup} setOpenPopup={setOpenPopup}>
        <AddResourceForm bookData={bookData} handleChange={handleChange} resourceTypes={resourceTypes} />
        {/* Buttons */}
        <div className="form-buttons">
          <Button onClick={() => setOpenPopup(false)} label="Cancel" lightBackgrnd={true} />
          <Button onClick={handleAddResource} label="Add" lightBackgrnd={false} />
        </div>
      </Popup>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default Catalogage;
