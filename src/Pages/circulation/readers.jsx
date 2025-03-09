import React from "react";
import Table from "../../components/Table";
import "../../CSS/circulation/readers.css";
import Button from '../../components/Button';

const Readers = () => {
  //dummy data
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
        <div className="container">
          <div id="table">
          <Table columns={columns} data={data} showActions={true} title={"Readers"}/>
          </div>
          <div className="bottom-buttons">
            <Button onClick = {() => {}} label={"Import Readers"} lightBackgrnd={true}></Button>
            <Button onClick = {() => {}} label={"Add New Reader"} lightBackgrnd={false}></Button>
          </div>
        </div>
    </div>
  );
};

export default Readers;
