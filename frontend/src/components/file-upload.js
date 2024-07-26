import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const FileUpload = ({ handleUpload }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onDropAccepted = useCallback(
    (acceptedFiles) => {
      setUploadedFile(acceptedFiles[0]);
      setIsProcessing(true);
      handleUpload(acceptedFiles[0], () => {
        setIsProcessing(false);
      });
    },
    [handleUpload]
  );

  const onDropRejected = useCallback((fileRejections) => {
    if (fileRejections && fileRejections.length > 0) {
      setErrorMessage("Only PDF files are accepted. Please upload a PDF file.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    onDropRejected,
    accept: "application/pdf",
    maxSize: 10485760,
  });

  return (
    <div {...getRootProps()} className="upload-form">
      <input {...getInputProps()} />
      {uploadedFile ? (
        <p>{uploadedFile.name}</p>
      ) : isProcessing ? (
        <p>Processing...</p>
      ) : isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <>
          <p> Please upload your clearance form here.</p>
          <p>Your clearance cannot be processed without the uploaded form.</p>
          <p>
            Kindly ensure all information in your clearance application is
            accurate before uploading.{" "}
          </p>

          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </>
      )}
    </div>
  );
};

export default FileUpload;
