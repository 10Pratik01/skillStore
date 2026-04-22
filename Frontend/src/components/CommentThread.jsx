import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// ── @Mention Input ──────────────────────────────────────────────────────────
export const MentionInput = ({ value, onChange, onSubmit, participants = [], placeholder = 'Write a comment...' }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);

    // Detect @mention
    const cursor = e.target.selectionStart;
    const textBefore = val.slice(0, cursor);
    const match = textBefore.match(/@(\w*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      setMentionQuery(query);
      const filtered = participants.filter(p =>
        p.username.toLowerCase().startsWith(query) || p.username.toLowerCase().includes(query)
      ).slice(0, 6);
      setFilteredUsers(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setShowDropdown(false);
    }
  };

  const insertMention = (username) => {
    const cursor = textareaRef.current.selectionStart;
    const before = value.slice(0, cursor);
    const after = value.slice(cursor);
    const atIndex = before.lastIndexOf('@');
    const newVal = before.slice(0, atIndex) + `@${username} ` + after;
    onChange(newVal);
    setShowDropdown(false);
    textareaRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
    if (e.key === 'Escape') setShowDropdown(false);
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-textMain focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
      />
      <p className="text-[10px] text-gray-400 mt-1">Press Enter to post · Shift+Enter for newline · Type @ to mention someone</p>

      {/* @Mention Dropdown */}
      {showDropdown && (
        <div className="absolute bottom-full mb-1 left-0 w-56 bg-white border border-gray-100 rounded-2xl shadow-soft z-50 overflow-hidden">
          {filteredUsers.map(user => (
            <button
              key={user.id}
              onMouseDown={(e) => { e.preventDefault(); insertMention(user.username); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-purple-400 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-textMain">@{user.username}</span>
              <span className="text-xs text-secondary capitalize ml-auto">{user.role?.toLowerCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Render comment text with @mentions highlighted ──────────────────────────
const renderContent = (text) => {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) =>
    part.startsWith('@')
      ? <span key={i} className="text-primary font-bold cursor-pointer hover:underline">{part}</span>
      : part
  );
};

// ── Single Comment Row ───────────────────────────────────────────────────────
const CommentRow = ({ comment, currentUserId, participants, onReply }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyBox(false);
    } finally {
      setSubmitting(false);
    }
  };

  const mentions = replyText.match(/@(\w+)/g)?.map(m => m.slice(1)) || [];
  const isOwn = comment.authorId === currentUserId;

  return (
    <div className="group">
      <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-400 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-soft-purple">
          {(comment.authorName || 'U').charAt(0).toUpperCase()}
        </div>

        <div className={`flex-1 max-w-[80%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-textMain">{comment.authorName || 'Unknown'}</span>
            <span className="text-[10px] text-secondary">{comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}</span>
          </div>

          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isOwn ? 'bg-primary text-white rounded-tr-sm' : 'bg-gray-100 text-textMain rounded-tl-sm'}`}>
            {renderContent(comment.content)}
          </div>

          {/* Reply trigger */}
          <button
            onClick={() => setShowReplyBox(v => !v)}
            className="text-[11px] text-secondary hover:text-primary font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ↩ Reply
          </button>
        </div>
      </div>

      {/* Replies */}
      {(comment.replies || []).length > 0 && (
        <div className={`mt-3 ml-11 space-y-3 border-l-2 border-gray-100 pl-4`}>
          {comment.replies.map((reply, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {(reply.authorName || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-textMain">{reply.authorName}</span>
                  <span className="text-[10px] text-secondary">{reply.createdAt ? new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
                <div className="bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl text-sm text-textMain">
                  {renderContent(reply.content)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply box */}
      {showReplyBox && (
        <div className="mt-3 ml-11">
          <MentionInput
            value={replyText}
            onChange={setReplyText}
            onSubmit={handleReplySubmit}
            participants={participants}
            placeholder={`Reply to ${comment.authorName}...`}
          />
          <div className="flex gap-2 mt-2">
            <button onClick={() => setShowReplyBox(false)} className="btn-secondary text-xs py-2 px-4">Cancel</button>
            <button onClick={handleReplySubmit} disabled={submitting || !replyText.trim()} className="btn-primary text-xs py-2 px-4 shadow-soft-purple disabled:opacity-50">
              {submitting ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main CommentThread Component ─────────────────────────────────────────────
const CommentThread = ({ lessonId, courseId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef(null);

  const fetchComments = useCallback(async () => {
    if (!lessonId) return;
    try {
      const res = await axios.get(`/api/community/lesson/${lessonId}/comments`);
      setComments(res.data || []);
    } catch (e) {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchComments();
    // Fetch participants for @mention
    if (courseId) {
      axios.get(`/api/orders/course/${courseId}/students`)
        .then(r => setParticipants(r.data || []))
        .catch(() => setParticipants([]));
    }
  }, [lessonId, courseId, fetchComments]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    const mentions = newComment.match(/@(\w+)/g)?.map(m => m.slice(1)) || [];
    try {
      await axios.post(`/api/community/lesson/${lessonId}/comment`, {
        authorId: currentUser?.id || 1,
        authorName: currentUser?.username || 'Student',
        content: newComment,
        mentions,
      });
      setNewComment('');
      fetchComments();
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      console.error('Failed to post comment', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (commentId, replyText) => {
    const mentions = replyText.match(/@(\w+)/g)?.map(m => m.slice(1)) || [];
    await axios.post(`/api/community/comment/${commentId}/reply`, {
      authorId: currentUser?.id || 1,
      authorName: currentUser?.username || 'Student',
      content: replyText,
      mentions,
    });
    fetchComments();
  };

  return (
    <div className="mt-8 border-t border-gray-100 pt-8">
      <h4 className="font-extrabold text-textMain text-base mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Discussion ({comments.length})
      </h4>

      {/* Comment list */}
      <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-2">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-secondary text-sm">
            <div className="text-3xl mb-2">💬</div>
            No comments yet. Start the discussion!
          </div>
        ) : (
          comments.map((c, i) => (
            <CommentRow
              key={c.id || i}
              comment={c}
              currentUserId={currentUser?.id}
              participants={participants}
              onReply={handleReply}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* New comment input */}
      <div className="flex gap-3 items-start">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-400 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-soft-purple mt-0.5">
          {(currentUser?.username || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <MentionInput
            value={newComment}
            onChange={setNewComment}
            onSubmit={handlePostComment}
            participants={participants}
            placeholder="Write a comment... Type @ to mention someone"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handlePostComment}
              disabled={submitting || !newComment.trim()}
              className="btn-primary text-sm py-2.5 px-6 shadow-soft-purple disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentThread;
