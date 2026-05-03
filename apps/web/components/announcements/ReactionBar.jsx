import React from 'react';

const COMMON_EMOJIS = ['👍', '🎉', '❤️', '🚀', '👀'];

export default function ReactionBar({ reactions = [], currentUserId, onToggleReaction }) {
  // Group reactions by emoji
  const grouped = reactions.reduce((acc, curr) => {
    if (!acc[curr.emoji]) {
      acc[curr.emoji] = { count: 0, users: [] };
    }
    acc[curr.emoji].count += 1;
    acc[curr.emoji].users.push(curr.userId);
    return acc;
  }, {});

  // Identify emojis that have at least one reaction, plus a default set to pick from
  const activeEmojis = Object.keys(grouped);
  const showDefaults = activeEmojis.length === 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
      {activeEmojis.map((emoji) => {
        const hasReacted = grouped[emoji].users.includes(currentUserId);
        return (
          <button
            key={emoji}
            onClick={() => onToggleReaction(emoji, hasReacted)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '4px 8px', borderRadius: '12px',
              background: hasReacted ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
              border: `1px solid ${hasReacted ? '#6366f1' : 'var(--border-primary)'}`,
              fontSize: '12px', fontWeight: 500, cursor: 'pointer',
              color: hasReacted ? '#6366f1' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            <span>{emoji}</span>
            <span>{grouped[emoji].count}</span>
          </button>
        );
      })}

      {showDefaults && COMMON_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onToggleReaction(emoji, false)}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '26px', height: '26px', borderRadius: '50%',
            background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
            fontSize: '14px', cursor: 'pointer', transition: 'transform 0.1s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {emoji}
        </button>
      ))}

      {/* Add Reaction Button (shows menu of emojis in a real app, here we can just show defaults if not empty) */}
      {!showDefaults && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '26px', height: '26px', borderRadius: '50%',
              background: 'var(--bg-secondary)', border: '1px dashed var(--border-secondary)',
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}
            onClick={(e) => {
              // Very simple inline reaction picker toggle
              const picker = e.currentTarget.nextElementSibling;
              if (picker) picker.style.display = picker.style.display === 'none' ? 'flex' : 'none';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <div style={{
            display: 'none', position: 'absolute', bottom: '100%', left: '0',
            marginBottom: '8px', background: 'var(--bg-primary)', padding: '6px',
            borderRadius: '8px', border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-md)', gap: '4px', zIndex: 10,
          }}>
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={(e) => {
                  const hasReacted = grouped[emoji]?.users.includes(currentUserId);
                  onToggleReaction(emoji, !!hasReacted);
                  e.currentTarget.parentElement.style.display = 'none';
                }}
                style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
