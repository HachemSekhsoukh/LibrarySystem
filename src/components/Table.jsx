import React, { useState } from "react";
import DataTable from "react-data-table-component";
import "../CSS/components/table.css"; // Keep original styles
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Table = ({ columns, data, showActions = false, title, onEdit, onDelete }) => {
  const [searchText, setSearchText] = useState("");

  // Convert columns to DataTable format
  const formattedColumns = columns.map((col) => ({
    name: col.label,
    selector: (row) => row[col.key],
    sortable: true,
  }));

  // Add action column if needed
  if (showActions) {
    formattedColumns.push({
      name: "Action",
      cell: (row) => (
        <div className="edit-delete">
          <button className="edit-btn" onClick={() => onEdit && onEdit(row)}>
            <EditIcon style={{ fontSize: "20px", color: "#065AA3" }} />
          </button>
          <div className="splitter"></div>
          <button className="delete-btn" onClick={() => onDelete && onDelete(row)}>
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
      value && value.toString().toLowerCase().includes(searchText.toLowerCase())
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
        borderTopLeftRadius: "15px", // Rounded top-left corner
        borderTopRightRadius: "15px", // Rounded top-right corner
      },
    },
    rows: {
      style: {
        fontSize: "0.9rem",
        borderBottom: "1px solid #ddd",
        backgroundColor: "transparent", // Make data rows background transparent
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
          data={filteredData} // Use filtered data for the table
          customStyles={customStyles}
          pagination
          highlightOnHover
          striped={false} // Disable alternating row colors
        />
      </div>
    </div>
  );
};

export default Table;

