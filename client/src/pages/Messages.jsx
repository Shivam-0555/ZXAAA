import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  
  // Hardcoded room for demo purposes - normally derived from Product + Buyer + Seller IDs
  const room = 'demo_room_123';

  useEffect(() => {
    if (user) {
      socket.emit('join_room', room);
    }
    
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [user]);

  const sendMessage = async () => {
    if (currentMessage !== '') {
      const messageData = {
        room: room,
        author: user.name,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };
      
      await socket.emit('send_message', messageData);
      setMessages((prev) => [...prev, messageData]);
      setCurrentMessage('');
    }
  };

  if (!user) return <div className="p-8 text-[var(--color-zxaaa-muted)]">Please log in to chat.</div>;

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col glass-panel rounded-2xl overflow-hidden border border-[var(--color-zxaaa-border)]">
      <div className="bg-gradient-to-r from-[var(--color-zxaaa-blue)] to-[var(--color-zxaaa-purple)] p-4 font-bold text-white">
        Product Discussion
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.author === user.name ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${msg.author === user.name ? 'bg-[var(--color-zxaaa-purple)] text-white rounded-br-none' : 'bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] rounded-bl-none'}`}>
              <div className="font-bold text-xs opacity-70 mb-1">{msg.author}</div>
              <div>{msg.message}</div>
              <div className="text-[10px] opacity-50 mt-1 text-right">{msg.time}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-[var(--color-zxaaa-border)] bg-[var(--color-zxaaa-bg)] flex gap-2">
        <input 
          type="text" 
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
          placeholder="Type your message..."
          className="flex-1 bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] rounded-full px-4 py-2 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white"
        />
        <button 
          onClick={sendMessage}
          className="bg-[var(--color-zxaaa-purple)] text-white px-6 py-2 rounded-full font-bold hover:opacity-90"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Messages;
