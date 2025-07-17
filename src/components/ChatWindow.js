import React, { useEffect, useRef } from 'react';

function ChatWindow({ messages, currentDocumentId }) {
  const messageListRef = useRef(null);
  const bottomRef = useRef(null);

  /* ⬇️ smooth‑scroll on every new message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window-container">
      <div className="message-list" ref={messageListRef}>
        {messages.length === 0 && (
          <div className="message system info">
            <div className="message-bubble">
              Upload a document and ask a question to get started!
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

                    {/* ✅ SAFER source rendering ‑ supports string OR object */}
                    {Array.isArray(msg.sources) && msg.sources.length > 0 && (
                      <div className="message-sources">
                        <strong>Sources:</strong>{' '}
                        {msg.sources.map((src, i) => {
                          const isString = typeof src === 'string';
                          const doc   = isString ? src : (src.document_id ?? 'Unknown document');
                          const page  =
                            !isString && src.page !== undefined && src.page !== -1
                              ? ` (p.${src.page})`
                              : '';

                          return (
                            <span key={i}>
                              {doc}{page}
                              {i < msg.sources.length - 1 ? ', ' : ''}
                            </span>
                          );
                        })}
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

        {/* auto‑scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default ChatWindow;
