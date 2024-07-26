import React from "react";

const Loading = ({ rows }) => {
  const totalRows = rows || 5;

  return (
    <div className="loading">
      {[...Array(totalRows)].map((_, index) => (
        <div key={index} className="loading-row"></div>
      ))}
    </div>
  );
};

export default Loading;
