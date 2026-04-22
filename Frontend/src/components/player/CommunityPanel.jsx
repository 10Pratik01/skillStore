import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Client } from '@stomp/stompjs';

const CommunityPanel = ({ courseId, user }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`/api/community/course/${courseId}`);
        setPosts(res.data || []);
      } catch (e) {}
    };
    fetchHistory();

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const stompClient = new Client({
      webSocketFactory: () => new WebSocket(`${proto}://${window.location.host}/ws/community/websocket`),
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/course/${courseId}`, (msg) => {
          if (msg.body) setPosts(prev => [...prev, JSON.parse(msg.body)]);
        });
      },
    });
    stompClient.activate();
    return () => stompClient.deactivate();
  }, [courseId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || sending) return;
    setSending(true);
    try {
      await axios.post(`/api/community/course/${courseId}/post`, {
        authorId: user?.id || 1,
        authorName: user?.username || 'Student',
        content: newPost,
      });
      setNewPost('');
    } catch (err) {}
    finally { setSending(false); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-secondary text-sm">
            <div className="text-3xl mb-2">💬</div>
            No messages yet. Start the conversation!
          </div>
        ) : (
          posts.map((p, i) => {
            const isMe = p.authorId === (user?.id || 1);
            return (
              <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">{p.authorName}</span>
                <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] shadow-sm leading-relaxed ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-gray-100 text-textMain rounded-tl-sm'}`}>
                  {p.content}
                </div>
                {p.createdAt && (
                  <span className="text-[10px] text-secondary mt-1">
                    {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex gap-2 items-center">
        <input
          type="text"
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm text-textMain focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          placeholder="Message the community..."
        />
        <button
          type="submit"
          disabled={sending || !newPost.trim()}
          className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-soft-purple hover:bg-primaryHover transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4 rotate-90 translate-x-px" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default CommunityPanel;
