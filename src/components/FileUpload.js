import React, { useState } from 'react';
import { uploadDocument } from '../services/apiService';

function FileUpload({ onUploadSuccess, onUploadError, token }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }

    console.log("Uploading file with token:", token);
  
  // Check if the token is missing right here
  if (!token) {
      console.error("Upload failed: No token provided!");
      onUploadError("Authentication token is missing. Please log in again.");
      setIsUploading(false); // Make sure to reset state
      return;
  }



    setIsUploading(true);
    try {
      const response = await uploadDocument(selectedFile, token); // pass JWT
      onUploadSuccess(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to upload file.';
      onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      document.getElementById('fileInput').value = null;
    }
  };

  return (
    <div className="file-upload-container">
      <h3>Upload Document (PDF or Image)</h3>
      <input
        type="file"
        id="fileInput"
        accept=".pdf, .png, .jpg, .jpeg, image/png, image/jpeg" // ✅ Allow images and PDFs
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <button onClick={handleFileUpload} disabled={!selectedFile || isUploading}>
        {isUploading ? 'Uploading...' : 'Upload File'}
      </button>
    </div>
  );
}

export default FileUpload;
