import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import MentionInput from '../shared/MentionInput';

export default function CommentThread({ comments = [], currentUserId, onAddComment, onDeleteComment }) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [mentionedUserIds, setMentionedUserIds] = useState([]);
  const { members } = useWorkspaceStore();
  
  const displayComments = expanded ? comments : comments.slice(0, 2);

  // Parse for mentions and simple rendering
  const renderContent = (text) => {
    return text.split(/(<@[\w-]+>)/g).map((chunk, i) => {
      const match = chunk.match(/<@([\w-]+)>/);
      if (match) {
        const uid = match[1];
        const mem = members.find((m) => m.userId === uid);
        return <span key={i} style={{ color: '#6366f1', fontWeight: 600 }}>@{mem?.user?.name || 'Unknown'}</span>;
      }
      return <span key={i}>{chunk}</span>;
    });
  };

  const submitComment = () => {
    if (!content.trim()) return;
    onAddComment(content, mentionedUserIds);
    setContent('');
    setMentionedUserIds([]);
  };

  return (
    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-primary)', paddingTop: '16px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {comments.length} Comment{comments.length !== 1 ? 's' : ''}
        </span>
        {comments.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
          >
            {expanded ? 'Show less' : `View all ${comments.length}`}
          </button>
        )}
      </div>

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {displayComments.map((c) => {
          const initials = c.user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U';
          const isOwn = c.userId === currentUserId;
          return (
            <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.user?.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  {isOwn && (
                    <button onClick={() => onDeleteComment(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer' }}>Delete</button>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '2px', wordBreak: 'break-word' }}>
                  {renderContent(c.content)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Field */}
      <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <MentionInput
          value={content}
          onChange={setContent}
          onMentionIdsChange={setMentionedUserIds}
          placeholder="Write a comment... (Type @ to mention)"
          textareaStyle={{
            minHeight: '40px',
            borderRadius: '20px',
            paddingRight: '44px',
            fontSize: '13px'
          }}
        />

        <button
          onClick={submitComment}
          disabled={!content.trim()}
          style={{
            position: 'absolute', right: '6px', top: '6px',
            width: '28px', height: '28px', borderRadius: '50%',
            background: content.trim() ? '#6366f1' : 'transparent',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: content.trim() ? 'pointer' : 'default', transition: 'background 0.15s',
            zIndex: 10
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={content.trim() ? '#fff' : 'var(--text-tertiary)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
