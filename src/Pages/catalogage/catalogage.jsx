import React, { useState } from "react";
import Table from "../../components/Table";
import Button from '../../components/Button';
import Popup from "../../components/Popup";
import { TextField, MenuItem, Grid } from "@mui/material";

const Catalogage = () => {
  const [openPopup, setOpenPopup] = useState(false);
  const [bookData, setBookData] = useState({
    type: "Book",
    title: "",
    author: "",
    isbn: "",
    issn: "",
  });

  const handleChange = (e) => {
    setBookData({ ...bookData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("New Book Data:", bookData);
    setOpenPopup(false); // Close modal after saving
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
              <Button onClick = {() => {}} label={"Import Books"} lightBackgrnd={true}></Button>
              <Button onClick = {() => setOpenPopup(true)} label={"Add New Book"} lightBackgrnd={false}></Button>
            </div>
          </div>
          <Popup title="Add Book" openPopup={openPopup} setOpenPopup={setOpenPopup}>
        <Grid container spacing={2}>
          {/* Document Type */}
          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="Document Type"
              name="type"
              value={bookData.type}
              onChange={handleChange}
              variant="outlined"
            >
              <MenuItem value="Book">Book</MenuItem>
              <MenuItem value="Journal">Journal</MenuItem>
              <MenuItem value="Magazine">Magazine</MenuItem>
            </TextField>
          </Grid>

          {/* Author */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Author"
              name="author"
              value={bookData.author}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          {/* Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={bookData.title}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          {/* ISBN */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="ISBN"
              name="isbn"
              value={bookData.isbn}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          {/* ISSN */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="ISSN"
              name="issn"
              value={bookData.issn}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
        </Grid>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <Button onClick = {() => setOpenPopup(false)} label={"Cancel"} lightBackgrnd={true}></Button>
        <Button onClick = {() => setOpenPopup(false)} label={"Add"} lightBackgrnd={false}></Button>
        </div>
      </Popup>
      </div>
    );
  };
  
  export default Catalogage;