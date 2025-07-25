import React, { useEffect, useRef } from 'react';

// --- CHANGE #1: ADD THIS HELPER FUNCTION ---
// Its job is to create a clean, short display name for any source label.
const formatSourceLabel = (label) => {
  try {
    // Check if the label is a URL by trying to parse it.
    if (label.startsWith('http')) {
      const url = new URL(label);
      // Remove 'www.' for a cleaner look and return the hostname.
      let shortHost = url.hostname.replace('www.', '');
      return shortHost;
    }
  } catch (error) {
    // If it's not a valid URL, it's a filename, so do nothing.
  }
  // For filenames, return the label as is.
  return label;
};


function ChatWindow({ messages, currentDocumentId }) {
  const messageListRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window-container">
      <div className="message-list" ref={messageListRef}>
        {messages.length === 0 && (
          <div className="message system info">
            <div className="message-bubble">
              Upload a document or image, paste a URL, and ask a question to get started!
            </div>
          </div>
        )}

        {messages.map((msg, index) => {
          switch (msg.role) {
            case 'user':
              return (
                <div key={index} className="message user">
                  <div className="message-avatar">U</div>
                  <div className="message-bubble">{msg.content}</div>
                </div>
              );

            case 'assistant':
              return (
                <div key={index} className="message assistant">
                  <div className="message-avatar">B</div>
                  <div className="message-bubble">
                    {msg.content}

                    {/* --- CHANGE #2: REPLACE THE OLD SOURCE RENDERING WITH THIS --- */}
                    {Array.isArray(msg.sources) && msg.sources.length > 0 && (
                      <div className="message-sources">
                        <strong>Sources:</strong>
                        <ul>
                          {msg.sources.map((src, i) => {
                            // Get the full label (filename or full URL) from the backend
                            const fullLabel = src.label || 'Unknown Source';
                            // Use our helper to get the clean display name
                            const shortLabel = formatSourceLabel(fullLabel);
                            // Check again if it's a URL to decide if it should be a link
                            const isUrl = fullLabel.startsWith('http');
                            
                            const pageInfo = src.page > 0 ? ` (p. ${src.page})` : '';
                            const scoreInfo = src.score ? ` [Score: ${src.score.toFixed(2)}]` : '';

                            return (
                              <li key={i}>
                                {isUrl ? (
                                  // If it's a URL, make it a clickable link
                                  // The link goes to the full URL, but the text is the short name
                                  <a href={fullLabel} title={fullLabel} target="_blank" rel="noopener noreferrer">
                                    {shortLabel}{pageInfo}
                                  </a>
                                ) : (
                                  // If it's a filename, just display it
                                  <span title={fullLabel}>
                                    {shortLabel}{pageInfo}
                                  </span>
                                )}
                                {scoreInfo}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );

            case 'system':
              return (
                <div key={index} className="message system info">
                  <div className="message-bubble">{msg.content}</div>
                </div>
              );

            default:
              return null;
          }
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default ChatWindow;