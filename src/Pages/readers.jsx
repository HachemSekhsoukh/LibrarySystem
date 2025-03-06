import React from "react";
import Table from "../components/Table";
import "../CSS/readers.css";

const Readers = () => {
  const columns = [
    { label: "ID", key: "id" },
    { label: "Family Name", key: "familyName" },
    { label: "First Name", key: "firstName" },
    { label: "Date of Birth", key: "dob" },
    { label: "Status", key: "status" },
    { label: "Category", key: "category" },
    { label: "Inscription Date", key: "inscriptionDate" },
  ];

  const data = [
    {
      id: "222235346620",
      familyName: "GUERGOUR",
      firstName: "Youcef",
      dob: "07/05/2004",
      status: "NaN",
      category: "3rd Year",
      inscriptionDate: "19/09/2022",
    },
    {
      id: "222235346621",
      familyName: "MESSAOUD",
      firstName: "Nacer",
      dob: "15/03/2003",
      status: "Active",
      category: "4th Year",
      inscriptionDate: "10/08/2021",
    },
  ];

  return (
    <div className="readers-page">
        <div className="table-container">
        <Table columns={columns} data={data} showActions={true} />
        </div>  
    </div>
  );
};

export default Readers;
