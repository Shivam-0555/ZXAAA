import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import {
  Send, MessageSquare, Search,
  ArrowLeft, Package, RefreshCw, CheckCheck, Loader2
} from 'lucide-react';

const socket = io('http://localhost:5000');

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const sellerParam = searchParams.get('seller');
  const sellerNameParam = searchParams.get('sellerName');
  const productParam = searchParams.get('product');
  const titleParam = searchParams.get('title');

  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConvoList, setShowConvoList] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch real conversation threads from API
  const fetchConversations = async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/messages/conversations', config);
      const convos = data.data || [];
      setConversations(convos);

      // If URL params exist, initiate or select that conversation
      if (sellerParam) {
        const existing = convos.find(c => 
          c.otherUser?._id?.toString() === sellerParam.toString() &&
          (!productParam || c.product?._id?.toString() === productParam.toString())
        );

        if (existing) {
          setActiveConvo(existing);
          setShowConvoList(false);
        } else {
          // New conversation object from query params
          const newConvo = {
            id: `${sellerParam}_${productParam || 'general'}`,
            otherUser: {
              _id: sellerParam,
              name: sellerNameParam || 'Seller',
            },
            product: {
              _id: productParam,
              title: titleParam || 'Product Discussion',
            },
            lastMessage: 'Start a new conversation',
            createdAt: new Date().toISOString(),
            isNew: true,
          };
          setActiveConvo(newConvo);
          setShowConvoList(false);
        }
      } else if (convos.length > 0 && !activeConvo) {
        setActiveConvo(convos[0]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user, sellerParam, productParam]);

  // Fetch messages for active conversation
  const fetchActiveMessages = async () => {
    if (!user || !activeConvo || !activeConvo.otherUser?._id) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const otherId = activeConvo.otherUser._id;
      const prodId = activeConvo.product?._id || 'general';
      const { data } = await axios.get(`http://localhost:5000/api/messages/${otherId}/${prodId}`, config);
      setMessages(data.data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    if (activeConvo) {
      fetchActiveMessages();

      // Join socket room
      const roomId = `room_${[user._id, activeConvo.otherUser._id].sort().join('_')}_${activeConvo.product?._id || 'gen'}`;
      socket.emit('join_room', roomId);
    }
  }, [activeConvo]);

  // Socket listener
  useEffect(() => {
    const handleReceive = (data) => {
      setMessages(prev => [...prev, data]);
    };

    socket.on('receive_message', handleReceive);
    return () => {
      socket.off('receive_message', handleReceive);
    };
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || !user || !activeConvo) return;
    setSending(true);

    const content = currentMessage.trim();
    const receiverId = activeConvo.otherUser._id;
    const productId = activeConvo.product?._id;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/messages', {
        receiver: receiverId,
        product: productId,
        content: content,
      }, config);

      const saved = data.data;

      // Socket emit
      const roomId = `room_${[user._id, receiverId].sort().join('_')}_${productId || 'gen'}`;
      socket.emit('send_message', { ...saved, room: roomId });

      setMessages(prev => [...prev, saved]);
      setCurrentMessage('');

      // Refresh conversations list to update order
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConvos = conversations.filter(c =>
    c.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.product?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-[var(--color-zxaaa-primary-bg)] border border-[var(--color-zxaaa-primary-glow)]">
          <MessageSquare size={36} className="text-[var(--color-zxaaa-primary)]" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Login Required</h2>
        <p className="text-[var(--color-zxaaa-muted)] mb-6 text-center max-w-sm font-bold">
          Sign in to chat directly with verified buyers and sellers in your city.
        </p>
        <Link to="/login" className="btn-primary px-8 py-3">Sign In to Chat</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-10rem)] md:h-[calc(100vh-8.5rem)] flex rounded-[28px] overflow-hidden shadow-2xl px-2 sm:px-0"
      style={{ border: '1px solid var(--color-zxaaa-border)', background: 'var(--color-zxaaa-card)' }}>

      {/* ── LEFT PANEL: Real Conversations List ── */}
      <div className={`${showConvoList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 lg:w-96 border-r border-[var(--color-zxaaa-border)] shrink-0`}
        style={{ background: 'var(--color-zxaaa-bg)' }}>

        {/* Header */}
        <div className="p-5 border-b border-[var(--color-zxaaa-border)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Messages</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[var(--color-zxaaa-primary-bg)] text-[var(--color-zxaaa-primary)] border border-[var(--color-zxaaa-primary-glow)]">
                {conversations.length}
              </span>
            </div>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search chat or product..."
              className="w-full bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-[var(--color-zxaaa-muted)] focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] transition-colors font-bold"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={24} className="text-[var(--color-zxaaa-primary)] animate-spin" />
              <p className="text-xs font-bold text-[var(--color-zxaaa-muted)]">Loading messages...</p>
            </div>
          ) : filteredConvos.length === 0 && !activeConvo?.isNew ? (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)]">
                <MessageSquare size={24} className="text-[var(--color-zxaaa-muted)]" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">No Conversations Yet</h3>
              <p className="text-xs text-[var(--color-zxaaa-muted)] leading-relaxed mb-4 max-w-xs">
                Browse products on the marketplace and click <strong>"Chat"</strong> on any item to talk to the seller.
              </p>
              <Link to="/explore" className="btn-primary px-4 py-2 text-xs">
                Browse Products
              </Link>
            </div>
          ) : (
            filteredConvos.map((convo) => {
              const isSelected = activeConvo?.id === convo.id;
              const otherName = convo.otherUser?.name || 'User';
              const initial = otherName.charAt(0).toUpperCase();
              const prodTitle = convo.product?.title || 'Product Discussion';

              return (
                <button
                  key={convo.id}
                  onClick={() => { setActiveConvo(convo); setShowConvoList(false); }}
                  className={`w-full text-left p-4 flex items-start gap-3.5 hover:bg-[var(--color-zxaaa-card)] transition-all border-b border-[var(--color-zxaaa-border)] relative ${
                    isSelected ? 'bg-[var(--color-zxaaa-primary-bg)] border-l-4 border-l-[var(--color-zxaaa-primary)]' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black text-white shadow-md"
                      style={{ background: 'linear-gradient(135deg, var(--color-zxaaa-primary), #2563eb)' }}>
                      {initial}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-black text-white truncate">{otherName}</span>
                      <span className="text-[10px] font-bold text-[var(--color-zxaaa-muted)] shrink-0 ml-1">
                        {convo.createdAt ? new Date(convo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-[var(--color-zxaaa-primary)] truncate mb-1 flex items-center gap-1">
                      <Package size={11} className="shrink-0" /> {prodTitle}
                    </p>
                    <p className="text-[11px] text-[var(--color-zxaaa-muted)] truncate max-w-[170px] font-medium">
                      {convo.lastMessage || 'Click to view chat'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Active Chat Area ── */}
      <div className={`${!showConvoList ? 'flex' : 'hidden'} md:flex flex-col flex-1 min-w-0`}>

        {activeConvo ? (
          <>
            {/* Chat Header */}
            <div className="h-18 px-5 py-3 flex items-center justify-between border-b border-[var(--color-zxaaa-border)] shrink-0"
              style={{ background: 'var(--color-zxaaa-card)' }}>
              <div className="flex items-center gap-3.5 min-w-0">
                <button onClick={() => setShowConvoList(true)} className="md:hidden text-[var(--color-zxaaa-muted)] hover:text-white p-1">
                  <ArrowLeft size={22} />
                </button>

                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-black text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--color-zxaaa-primary), #2563eb)' }}>
                  {(activeConvo.otherUser?.name || 'U').charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <span className="text-sm font-black text-white truncate block">
                    {activeConvo.otherUser?.name || 'User'}
                  </span>
                  <p className="text-[11px] font-bold text-[var(--color-zxaaa-muted)] truncate flex items-center gap-1 mt-0.5">
                    <Package size={11} className="shrink-0 text-[var(--color-zxaaa-primary)]" />
                    <span className="truncate">{activeConvo.product?.title || 'Direct Chat'}</span>
                  </p>
                </div>
              </div>

              {activeConvo.product?._id && (
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/swap?id=${activeConvo.product._id}`}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                  >
                    <RefreshCw size={13} /> Swap
                  </Link>
                </div>
              )}
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4"
              style={{ background: 'var(--color-zxaaa-bg)' }}>

              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 bg-[var(--color-zxaaa-primary-bg)] border border-[var(--color-zxaaa-primary-glow)]">
                    <MessageSquare size={28} className="text-[var(--color-zxaaa-primary)]" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Start the discussion</h3>
                  <p className="text-xs text-[var(--color-zxaaa-muted)] max-w-xs font-bold">
                    Ask about {activeConvo.product?.title || 'this item'}, arrange meetup, or discuss pricing.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const senderId = msg.sender?._id || msg.sender;
                  const isMe = senderId?.toString() === user._id?.toString();
                  const senderName = isMe ? 'You' : (msg.sender?.name || activeConvo.otherUser?.name || 'User');
                  const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                  return (
                    <div key={msg._id || idx} className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && (
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 mb-1"
                          style={{ background: 'linear-gradient(135deg, var(--color-zxaaa-primary), #2563eb)' }}>
                          {senderName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className={`flex flex-col gap-1 max-w-[75%] sm:max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
                        {!isMe && (
                          <span className="text-[10px] font-bold text-[var(--color-zxaaa-muted)] ml-1">{senderName}</span>
                        )}
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                            isMe ? 'text-white rounded-br-none' : 'text-white rounded-bl-none'
                          }`}
                          style={isMe ? {
                            background: 'var(--color-zxaaa-primary)',
                            boxShadow: '0 4px 14px var(--color-zxaaa-primary-glow)',
                          } : {
                            background: 'var(--color-zxaaa-card)',
                            border: '1px solid var(--color-zxaaa-border)',
                          }}
                        >
                          {msg.content || msg.message}
                        </div>
                        <span className="text-[9px] font-bold text-[var(--color-zxaaa-muted)] px-1 flex items-center gap-1">
                          {timeStr}
                          {isMe && <CheckCheck size={12} className="text-emerald-400" />}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 border-t border-[var(--color-zxaaa-border)] shrink-0"
              style={{ background: 'var(--color-zxaaa-card)' }}>
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeConvo.otherUser?.name || 'user'}...`}
                  className="flex-1 bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-2xl px-5 py-3 text-sm text-white placeholder:text-[var(--color-zxaaa-muted)] focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] transition-colors font-medium"
                />

                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || sending}
                  className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  style={{ background: 'var(--color-zxaaa-primary)', boxShadow: '0 4px 14px var(--color-zxaaa-primary-glow)' }}
                >
                  <Send size={18} className="text-white translate-x-0.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)]">
              <MessageSquare size={32} className="text-[var(--color-zxaaa-muted)]" />
            </div>
            <h3 className="text-lg font-black text-white mb-1">Your Direct Messages</h3>
            <p className="text-xs text-[var(--color-zxaaa-muted)] font-bold max-w-sm mb-6">
              Select a conversation from the left or open a product and click "Chat" to message any seller.
            </p>
            <Link to="/explore" className="btn-primary px-6 py-2.5 text-xs">
              Explore Products
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default Messages;
