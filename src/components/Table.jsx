import React from "react";
import "../CSS/components/table.css"; // Import table styles
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Table = ({ columns, data, showActions = false }) => {
  return (
    <div className="table-container">
      <div className="inner-table-container">
        <table className="custom-table">
          <thead className="table-header">
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col.label}</th>
              ))}
              {showActions && <th>Action</th>}
            </tr>
          </thead>
          <tbody className="table-body">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>{row[col.key]}</td>
                ))}
                {showActions && (
                  <td>
                  <div className="edit-delete">
                       <button className="edit-btn">
                          <EditIcon style={{ fontSize: '20px', color: '#065AA3' }} />
                        </button>
                        <div className="splitter"></div>
                        <button className="delete-btn">
                          <DeleteIcon style={{ fontSize: '20px', color: '#D32F2F' }} />
                      </button>
                  </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="page-index">
        <button className="page-index-button"> &lt;</button>
        <div className="index">1</div>
        <button className="page-index-button"> &gt;</button>
      </div>
    </div>
  );
};

export default Table;