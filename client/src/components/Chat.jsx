import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const Chat = ({ roomId, username }) => {
  const [message, setmessage] = useState([]);
  const [inputValue, setinputValue] = useState('');
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);

  const scrolltoEnd = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrolltoEnd();
  }, [message]);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    // joining the room by giving data
    socket.emit('join-room', { roomId, username });

    // system messages
    socket.on('user-joined', (data) => {
      setmessage((prev) => [...prev, data]);
    });

    socket.on('user-left', (d) => {
      setmessage((p) => [...p, d]);
    });

    // receiving messages
    socket.on('recieve-message', (d) => {
      setmessage((p) => [...p, d]);
      console.log(d.text)
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, username]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || !socketRef.current) return;
    const msgData = {
      roomId,
      text: inputValue,
      sender: username,
    };
    socketRef.current.emit('send-message', msgData);

    setinputValue('');
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg text-zinc-100">
      {/* Chat Header */}
      <div className="px-4 py-2.5 bg-zinc-800/80 border-b border-zinc-700/60 font-semibold text-xs text-zinc-300 uppercase tracking-wider flex items-center justify-between shrink-0">
        <span>Room Chat</span>
        <span className="text-[11px] text-zinc-400 font-mono font-normal">#{roomId}</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 bg-zinc-950/60 min-h-0">
        {message.map((msg, index) => {
          if (msg.system) {
            return (
              <div key={index} className="text-center text-[11px] text-zinc-500 italic my-1">
                {msg.message} ({msg.timestamp})
              </div>
            );
          }

          const isMe = msg.sender === username;

          return (
            <div
              key={msg.id || index}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="text-[10px] text-zinc-400 mb-0.5 px-1">
                {isMe ? 'You' : msg.sender} • {msg.timestamp}
              </div>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed break-words shadow-xs ${
                  isMe
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-zinc-800 text-zinc-200 border border-zinc-700/60 rounded-tl-none'
                }`}
              >
                {msg.text || msg.inputValue}
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-2.5 bg-zinc-900 border-t border-zinc-800 flex gap-2 shrink-0">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setinputValue(e.target.value)}
          className="flex-1 bg-zinc-950 text-zinc-100 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-zinc-500 transition-all"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm cursor-pointer shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
