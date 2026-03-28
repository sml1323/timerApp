import { useState, useRef, useEffect, useCallback } from 'react';
import { useTopics } from '../hooks/useTopics';
import { useSessionStore } from '../../session/state/sessionStore';
import styles from './TopicDropdown.module.css';

interface TopicDropdownProps {
  selectedTopicId: string | null;
  selectedTopicName: string | null;
  disabled?: boolean;
}

export function TopicDropdown({ selectedTopicId, selectedTopicName, disabled = false }: TopicDropdownProps) {
  const { topics, isLoading, createNewTopic } = useTopics();
  const setSelectedTopic = useSessionStore((s) => s.setSelectedTopic);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = selectedTopicName || '주제 선택';

  const toggle = useCallback(() => {
    if (disabled) return;
    setOpen((prev) => !prev);
    setAdding(false);
    setNewName('');
    setAddError(null);
  }, [disabled]);

  const selectTopic = useCallback((id: string, name: string) => {
    setSelectedTopic(id, name);
    setOpen(false);
  }, [setSelectedTopic]);

  const startAdding = useCallback(() => {
    setAdding(true);
    setAddError(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const cancelAdding = useCallback(() => {
    setAdding(false);
    setNewName('');
    setAddError(null);
  }, []);

  const submitNewTopic = useCallback(async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setAddError(null);
    const result = await createNewTopic(trimmed);
    if (result.ok) {
      setSelectedTopic(result.data.id, result.data.name);
      setAdding(false);
      setNewName('');
      setOpen(false);
    } else {
      setAddError(result.message);
    }
  }, [newName, createNewTopic, setSelectedTopic]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void submitNewTopic();
    } else if (e.key === 'Escape') {
      cancelAdding();
    }
  }, [submitNewTopic, cancelAdding]);

  // Close on outside click or ESC
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button
        className={styles.trigger}
        onClick={toggle}
        disabled={disabled}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.topicName}>{displayName}</span>
        {!disabled && <span className={styles.arrow}>{open ? '▴' : '▾'}</span>}
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox" aria-label="주제 선택">
          {isLoading && <p className={styles.status}>불러오는 중...</p>}

          {!isLoading && topics.map((topic) => (
            <button
              key={topic.id}
              className={styles.item}
              role="option"
              aria-selected={topic.id === selectedTopicId}
              onClick={() => selectTopic(topic.id, topic.name)}
              type="button"
            >
              <span>{topic.name}</span>
              {topic.id === selectedTopicId && <span className={styles.check}>✓</span>}
            </button>
          ))}

          {adding ? (
            <div className={styles.addField}>
              <input
                ref={inputRef}
                className={styles.addInput}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="주제 이름"
                autoFocus
              />
              {addError && <p className={styles.addError}>{addError}</p>}
            </div>
          ) : (
            <button className={styles.addBtn} onClick={startAdding} type="button">
              <span className={styles.addIcon}>+</span> 새 주제
            </button>
          )}
        </div>
      )}
    </div>
  );
}
