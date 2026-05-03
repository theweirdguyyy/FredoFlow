'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';

export default function MentionInput({ 
  value, 
  onChange, 
  onMentionIdsChange,
  placeholder = "Write a comment...",
  style = {},
  textareaStyle = {}
}) {
  const { members } = useWorkspaceStore();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [mentionStart, setMentionStart] = useState(-1);
  const [filterText, setFilterText] = useState('');
  
  // Track mapping of name -> userId to extract IDs on change
  const [mentions, setMentions] = useState([]); // Array of { name, userId }

  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter members based on filterText
  useEffect(() => {
    if (showSuggestions) {
      const filtered = members
        .filter(m => m.user?.name?.toLowerCase().includes(filterText.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
      setSuggestionIndex(0);
    }
  }, [filterText, showSuggestions, members]);

  // Sync mentionedUserIds when value or mentions mapping changes
  useEffect(() => {
    if (onMentionIdsChange) {
      const regex = /@(\w+(\s\w+)?)/g;
      const matches = [...value.matchAll(regex)];
      const namesInText = matches.map(m => m[1]);
      
      const ids = mentions
        .filter(m => namesInText.includes(m.name))
        .map(m => m.userId);
        
      onMentionIdsChange([...new Set(ids)]);
    }
  }, [value, mentions, onMentionIdsChange]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    onChange(val);

    // Detect @
    const textBeforeCursor = val.slice(0, pos);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    
    // Check if @ is at start or after a space/newline
    if (lastAt !== -1 && (lastAt === 0 || textBeforeCursor[lastAt - 1] === ' ' || textBeforeCursor[lastAt - 1] === '\n')) {
      const textAfterAt = textBeforeCursor.slice(lastAt + 1);
      
      // If there's a space far after @, close suggestions (allow space in name for filtering but be careful)
      if (textAfterAt.length > 20) {
        setShowSuggestions(false);
      } else {
        setMentionStart(lastAt);
        setFilterText(textAfterAt);
        setShowSuggestions(true);
        updateCoords(pos);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const updateCoords = (pos) => {
    if (!textareaRef.current) return;
    const { offsetLeft, offsetTop } = textareaRef.current;
    
    // Position suggestions relative to the textarea
    setCoords({
      top: offsetTop - 120, // Position above the input
      left: offsetLeft + 20
    });
  };

  const insertMention = useCallback((member) => {
    const textBeforeAt = value.slice(0, mentionStart);
    const textAfterMention = value.slice(textareaRef.current.selectionStart);
    const name = member.user.name;
    const newMention = `@${name} `;
    const newVal = textBeforeAt + newMention + textAfterMention;
    
    // Add to mentions mapping
    setMentions(prev => [...prev, { name, userId: member.userId }]);
    
    onChange(newVal);
    setShowSuggestions(false);

    setTimeout(() => {
      textareaRef.current.focus();
      const newPos = mentionStart + newMention.length;
      textareaRef.current.setSelectionRange(newPos, newPos);
    }, 0);
  }, [value, mentionStart, onChange]);

  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(suggestions[suggestionIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', ...style }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%',
          minHeight: '40px',
          padding: '10px 14px',
          boxSizing: 'border-box',
          fontSize: '14px',
          fontFamily: "'DM Sans', sans-serif",
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '8px',
          outline: 'none',
          color: 'var(--text-primary)',
          resize: 'none',
          transition: 'border-color 0.15s',
          ...textareaStyle
        }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: coords.top,
            left: coords.left,
            zIndex: 1000,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            width: '200px',
            overflow: 'hidden',
            animation: 'fadeIn 0.1s ease'
          }}
        >
          {suggestions.map((m, idx) => (
            <div 
              key={m.userId}
              onClick={() => insertMention(m)}
              onMouseEnter={() => setSuggestionIndex(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                background: idx === suggestionIndex ? 'var(--bg-secondary)' : 'transparent',
                transition: 'background 0.1s'
              }}
            >
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1',
                color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {m.user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {m.user?.name}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
