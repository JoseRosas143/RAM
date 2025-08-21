import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase.js';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);
    try {
      // Call Firebase Callable Function vetChat
      const vetChatFn = httpsCallable(functions, 'vetChat');
      const result = await vetChatFn({ message: input });
      const reply = result.data.reply || '';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4 border p-4 rounded">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className="p-2 rounded bg-gray-200 inline-block">{msg.content}</span>
          </div>
        ))}
        {loading && <p>La IA está escribiendo…</p>}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta"
        />
        <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded">
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatBot;