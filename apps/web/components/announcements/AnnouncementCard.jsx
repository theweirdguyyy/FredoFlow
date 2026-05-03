import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import ReactionBar from './ReactionBar';
import CommentThread from './CommentThread';

export default function AnnouncementCard({ 
  announcement, 
  currentUserId, 
  canPin,
  onTogglePin, 
  onToggleReaction, 
  onAddComment, 
  onDeleteComment,
  onDelete
}) {
  const [showComments, setShowComments] = useState(false);

  const initials = announcement.author?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?';
  const isPinned = announcement.isPinned;
  
  // Safe HTML rendering
  const createMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  const commentsCount = announcement.comments?.length || 0;

  return (
    <div style={{
      background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
      borderRadius: '12px', padding: '24px', marginBottom: '20px',
      boxShadow: 'var(--shadow-sm)', position: 'relative'
    }}>
      {/* Pinned Badge */}
      {isPinned && (
        <div style={{ position: 'absolute', top: '-10px', right: '20px', background: '#f59e0b', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: 'var(--shadow-sm)' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          PINNED
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px', background: '#6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0
          }}>
            {initials}
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Syne', sans-serif" }}>
              {announcement.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>{announcement.author?.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{new Date(announcement.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
          </div>
        </div>
        
        {/* Actions for Admins */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {canPin && (
            <button 
              onClick={() => onTogglePin(announcement.id)}
              style={{ background: 'none', border: 'none', color: isPinned ? '#f59e0b' : 'var(--text-tertiary)', cursor: 'pointer', transition: 'color 0.15s' }}
              title={isPinned ? "Unpin announcement" : "Pin announcement"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </button>
          )}

          {canPin && ( // canPin implies isAdmin
            <button 
              onClick={onDelete}
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
              title="Delete announcement"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div 
        className="rich-text-content"
        style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}
        dangerouslySetInnerHTML={createMarkup(announcement.content)}
      />

      {/* Actions Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ReactionBar 
          reactions={announcement.reactions || []} 
          currentUserId={currentUserId}
          onToggleReaction={(emoji, hasReacted) => onToggleReaction(announcement.id, emoji, hasReacted)}
        />
        
        <button 
          onClick={() => setShowComments(!showComments)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
        </button>
      </div>

      {/* Comment Thread */}
      {showComments && (
        <CommentThread 
          comments={announcement.comments || []}
          currentUserId={currentUserId}
          onAddComment={(content) => onAddComment(announcement.id, content)}
          onDeleteComment={(commentId) => onDeleteComment(announcement.id, commentId)}
        />
      )}
    </div>
  );
}
