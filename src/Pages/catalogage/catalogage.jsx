import React from "react";
import Table from "../../components/Table";
import "../../CSS/readers.css";
import Button from '../../components/Button';

const Catalogage = () => {
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
              <Button onClick = {() => {}} label={"Add New Book"} lightBackgrnd={false}></Button>
            </div>
          </div>
      </div>
    );
  };
  
  export default Catalogage;