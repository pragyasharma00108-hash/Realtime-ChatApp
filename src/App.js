// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// const socket = io('http://localhost:3000');
const socket = io('https://chatgpt-realtime-server.onrender.com');


function App() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  // Show "Thinking..." when waiting
  const showTypingIndicator = () => {
    setMessages((prev) => [...prev, { text: 'Thinking...', sender: 'typing', id: 'typing' }]);
  };

  const hideTypingIndicator = () => {
    setMessages((prev) => prev.filter((msg) => msg.id !== 'typing'));
  };

useEffect(() => {
  socket.on('message', (msg) => {
    hideTypingIndicator();

    // If backend sends JSON, make sure we extract correctly
    const parsedMsg = typeof msg === 'string' ? msg : msg.message;

    setMessages((prev) => [...prev, { text: parsedMsg, sender: 'other' }]);
  });

  return () => {
    socket.off('message');
  };
}, []);


  const sendMessage = () => {
    if (messageInput.trim()) {
      const msg = messageInput;
      setMessages((prev) => [...prev, { text: msg, sender: 'me' }]);
      setMessageInput('');

      // Emit to backend
      socket.emit('user-message', msg);

      // Show "Thinking..."
      showTypingIndicator();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        <h2 style={styles.title}>🤖 Hey, Astro</h2>

        <div style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <p style={styles.placeholder}>Start a conversation...</p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.message,
                  ...(msg.sender === 'me'
                    ? styles.messageMe
                    : msg.sender === 'other'
                    ? styles.messageOther
                    : styles.messageTyping
                  ),
                }}
              >
                {msg.text}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputContainer}>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            style={styles.input}
          />
          <button onClick={sendMessage} style={styles.button}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#121212',
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
    padding: '20px',
  },
  chatBox: {
    width: '90%',
    maxWidth: '500px',
    borderRadius: '16px',
    padding: '20px',
    backgroundColor: '#1E1E1E',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    border: '1px solid #333',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#E0E0E0',
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '15px',
  },
  messagesContainer: {
    height: '400px',
    overflowY: 'auto',
    padding: '10px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '10px',
    backgroundColor: '#252525',
    borderRadius: '10px',
    border: '1px solid #333',
    scrollbarWidth: 'thin',
    scrollbarColor: '#444 #252525',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '18px',
    maxWidth: '70%',
    lineHeight: '1.5',
    wordBreak: 'break-word',
    fontSize: '15px',
  },
  messageMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#007BFF',
    color: 'white',
    marginLeft: 'auto',
    fontWeight: '500',
  },
  messageOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#8B5A2B',
    color: 'white',
    marginRight: 'auto',
    fontWeight: '500',
  },
  messageTyping: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    color: '#BBB',
    fontStyle: 'italic',
    marginRight: 'auto',
    fontSize: '14px',
    padding: '10px 16px',
  },
  inputContainer: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '1px solid #444',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#2D2D2D',
    color: '#E0E0E0',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#0066CC',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
  },
  placeholder: {
    color: '#888',
    textAlign: 'center',
    marginTop: '20px',
    fontStyle: 'italic',
    opacity: 0.7,
  },
};

export default App;
