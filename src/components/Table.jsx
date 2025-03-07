import React from "react";
import "../CSS/table.css"; // Import table styles


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
                          <img src="../../public/assets/images/pencil-write.png" alt="Edit" />
                        </button>
                        <div className="splitter"></div>
                        <button className="delete-btn">
                          <img src="../../public/assets/images/bin.png" alt="Delete" />
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