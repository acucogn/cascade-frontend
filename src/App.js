import React, { useState, useEffect } from "react";
import "./App.css";
import FileUpload from "./components/FileUpload";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import LoginPage from "./components/LoginButton";
import { sendMessage, ingestUrl } from "./services/apiService"; // <-- Updated import

function App() {
  const [token, setToken] = useState(localStorage.getItem("app_token"));
  const [messages, setMessages] = useState([]);
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      handleLoginSuccess(t);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem("app_token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("app_token");
    setToken(null);
    setMessages([]);
    setCurrentDocumentId(null);
  };

  const handleUploadSuccess = (data) => {
    const msg = data.file_name 
      ? `Successfully processed '${data.file_name}'. You can now ask questions.`
      : data.message;
    setMessages([{ role: "system", content: msg }]);
    setCurrentDocumentId(data.document_id);
    setError(null);
  };

  const handleUploadError = (errMsg) => {
    const msg = `Error: ${errMsg}`;
    setMessages((prev) => [...prev, { role: "system", content: msg, type: "error" }]);
    setError(msg);
  };

  // --- THIS IS THE MODIFIED FUNCTION ---
  const handleSendMessage = async (userInput, language = "auto", jwt) => {
    const isUrl = userInput.trim().startsWith("http://") || userInput.trim().startsWith("https://");

    setIsSending(true);
    setError(null);

    if (isUrl) {
      // Logic for URL Ingestion
      setMessages((prev) => [...prev, { role: "system", content: `Ingesting content from URL...` }]);
      try {
        const res = await ingestUrl(userInput, jwt);
        handleUploadSuccess(res.data);
      } catch (err) {
        const msg = err.response?.data?.detail || "Failed to ingest content from the URL.";
        handleUploadError(msg);
      } finally {
        setIsSending(false);
      }
    } else {
      // Logic for sending a chat message
      if (!userInput.trim() || !currentDocumentId) {
        if (!currentDocumentId) setError("Please upload a document or provide a URL first.");
        setIsSending(false);
        return;
      }

      setMessages((prev) => [...prev, { role: "user", content: userInput }]);

      try {
        const chatHistory = messages.filter(
          (m) => m.role === "user" || m.role === "assistant"
        );
        const res = await sendMessage(userInput, chatHistory, currentDocumentId, jwt, language);
        const assistantMsg = {
          role: "assistant",
          content: res.data.answer,
          sources: res.data.sources || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const msg = err.response?.data?.detail || "Failed to get a response from the agent.";
        setMessages((prev) => [...prev, { role: "system", content: msg, type: "error" }]);
        setError(msg);
      } finally {
        setIsSending(false);
      }
    }
  };
  
  if (!token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>CASCADE AI</h1>
        <span className="header-chip">Document Agent</span>
        <button className="logout-btn" onClick={handleLogout}>
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
          <ChatWindow messages={messages} currentDocumentId={currentDocumentId} />
          <MessageInput onSendMessage={handleSendMessage} isSending={isSending} token={token} />
        </div>
      </main>
      <footer className="App-footer">
        <p>Powered by Cascade AI</p>
      </footer>
    </div>
  );
}

export default App;