import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const ClearanceFormPDF = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const { fileId } = useParams();
  const [pdfURL, setPdfUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const response = await fetch(`${backendUrl}/pdf/view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileId: fileId }),
        });
        const blob = await response.blob();
        const pdfUrl = URL.createObjectURL(blob);
        setPdfUrl(pdfUrl);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching PDF:", error);
      }
    };

    fetchPDF();
  }, [fileId]);

  return (
    <div className="home-body">
      {isLoading ? (
        <div className="loader-wrapper" id="fp-loader">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="pdf-main">
          <iframe
            title="PDF Viewer"
            src={pdfURL}
            type="application/pdf"
            className="pdf-frame"
          />
        </div>
      )}
    </div>
  );
};

export default ClearanceFormPDF;
