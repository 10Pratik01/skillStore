import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Client } from '@stomp/stompjs';

// ── Notification type → icon/color mapping ───────────────────────────────────
const TYPE_META = {
  NEW_TASK:     { icon: '📚', color: 'bg-blue-50 text-blue-600',   label: 'New Task' },
  SUBMISSION:   { icon: '📎', color: 'bg-amber-50 text-amber-600', label: 'Submission' },
  GRADED:       { icon: '🏆', color: 'bg-green-50 text-green-600', label: 'Graded' },
  COMMENT:      { icon: '💬', color: 'bg-purple-50 text-purple-600', label: 'Comment' },
  MENTION:      { icon: '🔔', color: 'bg-primary/10 text-primary',  label: 'Mention' },
  ENROLLMENT:   { icon: '🎓', color: 'bg-indigo-50 text-indigo-600', label: 'New Student' },
};

const getRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ── Main NotificationCenter Component ────────────────────────────────────────
const NotificationCenter = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Fetch on mount ────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/community/notifications/user/${userId}`);
      setNotifications(res.data || []);
    } catch (e) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ── STOMP real-time subscription ─────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    fetchNotifications();

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const stompClient = new Client({
      webSocketFactory: () => new WebSocket(`${proto}://${window.location.host}/ws/community/websocket`),
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/notifications/${userId}`, (msg) => {
          if (msg.body) {
            const notif = JSON.parse(msg.body);
            setNotifications(prev => [notif, ...prev]);
          }
        });
      },
    });
    stompClient.activate();
    return () => stompClient.deactivate();
  }, [userId, fetchNotifications]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!e.target.closest('#notification-center')) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const markRead = async (id) => {
    try {
      await axios.patch(`/api/community/notifications/read/${id}`);
    } catch (e) {}
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => axios.patch(`/api/community/notifications/read/${n.id}`).catch(() => {})));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div id="notification-center" className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-11 h-11 rounded-full bg-white border border-gray-100 shadow-soft flex items-center justify-center text-secondary hover:text-primary hover:border-primary/30 transition-all"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-3 w-96 bg-white border border-gray-100 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] z-50 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-textMain">Notifications</h4>
              {unreadCount > 0 && (
                <span className="bg-primary text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary font-bold hover:text-primaryHover transition-colors hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="flex gap-3"><div className="w-10 h-10 bg-gray-100 rounded-2xl animate-pulse shrink-0" /><div className="flex-1 space-y-2"><div className="h-3 bg-gray-100 rounded animate-pulse" /><div className="h-2 bg-gray-100 rounded animate-pulse w-2/3" /></div></div>)}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="text-4xl mb-3">🎉</div>
                <p className="font-bold text-textMain mb-1">All caught up!</p>
                <p className="text-secondary text-sm">No notifications right now.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const meta = TYPE_META[n.type] || TYPE_META.COMMENT;
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50/80 ${!n.read ? 'bg-primary/[0.03]' : ''}`}
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-2xl ${meta.color} flex items-center justify-center text-lg shrink-0`}>
                      {meta.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${n.read ? 'text-secondary' : 'text-textMain font-semibold'}`}>
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="text-[11px] text-secondary">{getRelativeTime(n.timestamp || n.createdAt)}</span>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-secondary font-medium">{notifications.length} total notifications</span>
            <button onClick={fetchNotifications} className="text-xs text-primary font-bold hover:underline">Refresh</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
