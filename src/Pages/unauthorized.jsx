import React from "react";

const UnauthorizedPage = () => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
      }}
    >
        
      <img
        src="assets/images/unauthorized.png"
        alt="Unauthorized Access"
        style={{ maxWidth: "100%", height: "auto", maxHeight: "60vh" }}
      />
      <h1  style={{
            color: "red"
      }}>Your are attempting unauthorized access to this section... Please go back!</h1>
    </div>
  );
};

export default UnauthorizedPage;
