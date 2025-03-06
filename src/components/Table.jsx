import React from "react";
import "../CSS/table.css"; // Import table styles

const Table = ({ columns, data, showActions = false }) => {
  return (
    <div className="table-container">
      <table className="custom-table">
        <thead className="table-header">
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.label}</th>
            ))}
            {showActions && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>{row[col.key]}</td>
              ))}
              {showActions && (
                <td>
                <div className="edit-delete">
                    <button className="edit-btn">✏️</button>
                    <div className="splitter"></div>
                    <button className="delete-btn">🗑️</button>
                </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;