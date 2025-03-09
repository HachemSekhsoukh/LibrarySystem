import React, { useState, useEffect } from "react";
import Table from "../../components/Table";
import Button from '../../components/Button';
import Popup from "../../components/Popup";
import "../../CSS/form.css";
import "./resource_form";
import { TextField, MenuItem, Grid } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddResourceForm from "./resource_form";


const Catalogage = () => {
  const API_BASE_URL = "http://localhost:5000/";
  const [openPopup, setOpenPopup] = useState(false);
  const [bookData, setBookData] = useState({
    type: "Book",
    title: "",
    author: "",
    isbn: "",
    issn: "",
  });

  const [resourceTypes, setResourceTypes] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}api/resource-types`)  // Ensure full URL with http://
      .then(res => res.json())
      .then(data => {
        setResourceTypes(data);
      })
      .catch(error => console.error("API Error:", error));
  }, []);
  

  const handleChange = (e) => {
    setBookData({ ...bookData, [e.target.name]: e.target.value });
  };

  const handleAddResource = async () => {
    try {
      const formattedData = {
        r_inventoryNum: bookData.inventoryNum,
        r_title: bookData.title,
        r_author: bookData.author,
        r_editor: bookData.editor,
        r_edition: bookData.edition,
        r_editionDate: bookData.editionDate,
        r_editionPlace: bookData.editionPlace,
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
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
  
      const result = await response.json();
      alert("Resource added successfully!");
      setOpenPopup(false);
    } catch (error) {
      alert(`Failed to add resource: ${error.message}`);
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

  const data = [
    {
      id: "222235346620",
      title: "GUERGOUR",
      author: "Youcef",
      status: "Available",
      isbn: "978-2-1234-5680-3",
      type: "Book",
    },
    {
      id: "222235346620",
      title: "GUERGOUR",
      author: "Youcef",
      status: "Available",
      isbn: "978-2-1234-5680-3",
      type: "Book",
    },
  ];

  return (
    <div className="books-page">
      <div className="container">
        <div id="table">
          <Table columns={columns} data={data} showActions={true} />
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
    </div>
  );
};

export default Catalogage;
