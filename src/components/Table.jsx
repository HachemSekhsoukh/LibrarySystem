import React, { useState } from "react";
import DataTable from "react-data-table-component";
import "../CSS/components/table.css";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Table = ({ columns, data, showActions = false, title, onRowSelect, selectedRows = [] }) => {
  const [searchText, setSearchText] = useState("");
  
  // Convert columns to DataTable format while preserving custom renderers
  const formattedColumns = columns.map((col) => {
    // Base column definition
    const formattedCol = {
      name: col.label,
      sortable: true,
    };
    
    // If the column has a custom render function, use it
    if (col.render) {
      formattedCol.cell = (row) => col.render(row[col.key], row);
    } else {
      // Otherwise use standard selector
      formattedCol.selector = (row) => row[col.key];
    }
    
    return formattedCol;
  });

  // Add action column if needed
  if (showActions) {
    formattedColumns.push({
      name: "Action",
      cell: (row) => (
        <div className="edit-delete">
          <button className="edit-btn">
            <EditIcon style={{ fontSize: "20px", color: "#065AA3" }} />
          </button>
          <div className="splitter"></div>
          <button className="delete-btn">
            <DeleteIcon style={{ fontSize: "20px", color: "#D32F2F" }} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    });
  }

  // Filter data based on search text
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      value?.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // Custom styling to match your original design
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "var(--table-header-color)",
        fontWeight: "bold",
        fontSize: "1.1rem",
        color: "var(--primary-color)",
        borderTopLeftRadius: "15px",
        borderTopRightRadius: "15px",
      },
    },
    rows: {
      style: {
        fontSize: "0.9rem",
        borderBottom: "1px solid #ddd",
        backgroundColor: "transparent",
      },
    },
    cells: {
      style: {
        padding: "10px",
      },
    },
    pagination: {
      style: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "20px",
      },
    },
    // Make sure checkboxes are visible
    checkbox: {
      style: {
        width: "18px",
        height: "18px",
        opacity: "1",
        visibility: "visible",
        pointerEvents: "auto",
        cursor: "pointer",
      },
    },
  };

  return (
    <div className="table-container">
      <div className="inner-table-container">
        {/* Search Input */}
        <div className="search-title">
          <h2>{title}</h2>
          <div className="search-bar">
            <p>Search: </p>
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <DataTable
          columns={formattedColumns}
          data={filteredData}
          customStyles={customStyles}
          pagination
          highlightOnHover
          striped={false}
        />
      </div>
    </div>
  );
};

export default Table;