import React from "react";
import DataTable from "react-data-table-component";
import "../CSS/components/table.css"; // Keep original styles
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Table = ({ columns, data, showActions = false }) => {
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
        <DataTable
          columns={formattedColumns}
          data={data}
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
