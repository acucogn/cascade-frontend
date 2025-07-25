import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';

function MessageInput({ onSendMessage, isSending, token }) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (inputText.trim() === '') return;
     onSendMessage(inputText, 'auto', token);  
    setInputText('');
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser.');
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        fetch('http://localhost:8000/api/v1/upload-audio/', {
          method: 'POST',
          body: formData,
        })
          .then(res => res.json())
          .then(data => {
            const transcript = data.transcript;
            const language = data.language || 'auto';

            if (transcript) {
              setInputText(transcript);
              onSendMessage(transcript, language, token); 
              setInputText('');
            } else {
              alert('Failed to transcribe audio.');
            }
          })
          .catch(err => {
            console.error('Audio upload failed:', err);
            alert('Audio processing failed.');
          });
      };

      
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US'; 

      recognition.onstart = () => {
        setIsListening(true);
        mediaRecorder.start(); 
      };

      recognition.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      };

      recognition.onend = () => {
        setIsListening(false);
        mediaRecorder.stop(); // Stop recording
        stream.getTracks().forEach(track => track.stop());
      };

      recognition.start();

      
      setTimeout(() => recognition.stop(), 10000); 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="message-input-container">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Ask a question about the document..."
        disabled={isSending}
      />
      <button type="button" onClick={handleVoiceInput} disabled={isSending || isListening}>
        🎙️
      </button>
      <button type="submit" disabled={isSending} title="Send">
        {isSending ? '...' : <FiSend size={20} />}
      </button>
    </form>
  );
}

export default MessageInput;
