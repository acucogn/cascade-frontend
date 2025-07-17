// src/services/apiService.js
import axios from "axios";

// Fall back to FastAPI dev server if no env var is set
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://cunning-model-puma.ngrok-free.app/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ------------------------------------------------------------------
   Upload a PDF/image.  Pass token only if the /upload/ route is
   protected on the backend; otherwise you can omit it.
------------------------------------------------------------------- */
export function uploadDocument(file, token = null) {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.post("/upload/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token && { Authorization: `Bearer ${token}` }), // add if present
    },
  });
}

/* ------------------------------------------------------------------
   Send a chat message.  `token` is REQUIRED because /chat/ depends
   on user identity for per‑user history.
------------------------------------------------------------------- */
export function sendMessage(query, history, documentId, token, language = "auto") {
  return apiClient.post(
    "/chat/",
    {
      query,
      chat_history: history,          // ✅ correct key
      document_ids: [documentId], 
      language, // string or null
    },
    {
      headers: {
        Authorization: `Bearer ${token}`, // always send JWT
      },
    }
  );
}

// Export additional API helpers here if you add more endpoints
