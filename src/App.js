// src/App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import FileUpload     from "./components/FileUpload";
import ChatWindow     from "./components/ChatWindow";
import MessageInput   from "./components/MessageInput";
import LoginButton    from "./components/LoginButton";
import { sendMessage } from "./services/apiService";

function App() {
  /* ─────────────────── TOKEN HANDLING ─────────────────── */
  const [token, setToken] = useState(localStorage.getItem("app_token"));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      localStorage.setItem("app_token", t);
      setToken(t);
      window.history.replaceState({}, "", "/"); // clean ?token=…
    }
  }, []);

    // not logged‑in → Google button

  /* ─────────────────── COMPONENT STATE ─────────────────── */
  const [messages, setMessages]           = useState([]);
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [isSending, setIsSending]         = useState(false);
  const [error, setError]                 = useState(null);

  /* ─────────── UPLOAD helpers (needed in JSX!) ─────────── */
  const handleUploadSuccess = (data) => {
    const msg = data.filename
      ? `Successfully processed '${data.filename}'. You can now ask questions.`
      : data.message;
    setMessages([{ role: "system", content: msg }]);
    setCurrentDocumentId(data.document_id);
    setError(null);
  };

  const handleUploadError = (errMsg) => {
    const msg = `Upload Error: ${errMsg}`;
    setMessages((prev) => [...prev, { role: "system", content: msg, type: "error" }]);
    setError(msg);
  };

  /* ───────────── CHAT helper ───────────── */
  const handleSendMessage = async (userInput, language = "auto", jwt) => {
    if (!userInput.trim() || !currentDocumentId) {
      if (!currentDocumentId) setError("Please upload a document first.");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: userInput }]);
    setIsSending(true);
    setError(null);

    try {
      const chatHistory = messages.filter(
        (m) => m.role === "user" || m.role === "assistant"
      );

      const res = await sendMessage(
        userInput,
        chatHistory,
        currentDocumentId,
        jwt,
        language
      );

      const assistantMsg = {
        role: "assistant",
        content: res.data.answer,
        sources: res.data.sources || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const msg =
        err.response?.data?.detail || "Failed to get a response from the agent.";
      setMessages((prev) => [...prev, { role: "system", content: msg, type: "error" }]);
      setError(msg);
    } finally {
      setIsSending(false);
    }
  };
  if (!token) return <LoginButton />; 
  /* ───────────────────── UI ───────────────────── */
  return (
    <div className="App">
      <header className="App-header">
        <h1>CASCADE AI</h1>
        <span className="header-chip">Document Agent</span>
        <button
        className="logout-btn"
        onClick={() => {
          localStorage.removeItem("app_token");   // wipe token
          setToken(null);                         // re‑render -> LoginButton
          setMessages([]);                        // optional: clear chat
          setCurrentDocumentId(null);             // optional: clear doc
        }}
      >
        Logout
      </button>
      </header>

      <main className="App-main">
        <div className="left-panel">
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            token={token}
          />
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="right-panel">
          <ChatWindow
            messages={messages}
            currentDocumentId={currentDocumentId}
          />

          <MessageInput
            onSendMessage={(q, lang) => handleSendMessage(q, lang, token)}
            isSending={isSending}
            token={token}
          />
        </div>
      </main>

      <footer className="App-footer">
        <p>Powered by Cascade AI</p>
      </footer>
    </div>
  );
}

export default App;
