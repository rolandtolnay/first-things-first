"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

interface AddItemInputProps {
  label: string;
  placeholder: string;
  onAdd: (value: string) => void;
  icon?: ReactNode;
  wrapperClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export function AddItemInput({
  label,
  placeholder,
  onAdd,
  icon,
  wrapperClassName,
  inputClassName,
  buttonClassName,
}: AddItemInputProps) {
  const [isInputMode, setIsInputMode] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isInputMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputMode]);

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onAdd(trimmed);
    }
    setInputValue("");
    setIsInputMode(false);
  };

  const handleCancel = () => {
    setInputValue("");
    setIsInputMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      handleSubmit();
    } else {
      handleCancel();
    }
  };

  if (isInputMode) {
    return (
      <div className={wrapperClassName} style={{ padding: '4px 0' }}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClassName || "w-full bg-transparent focus:outline-none"}
          style={
            inputClassName
              ? undefined
              : {
                  fontSize: '13px',
                  border: `1px solid var(--border-emphasis)`,
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 10px',
                  backgroundColor: 'var(--bg-card)',
                }
          }
          aria-label={placeholder}
        />
      </div>
    );
  }

  return (
    <div className={wrapperClassName} style={{ padding: '4px 0' }}>
      <button
        type="button"
        onClick={() => {
          setIsInputMode(true);
          setInputValue("");
        }}
        className={buttonClassName || "flex items-center gap-1 transition-colors cursor-pointer"}
        style={
          buttonClassName
            ? undefined
            : {
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
              }
        }
        onMouseEnter={(e) => {
          if (!buttonClassName) {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!buttonClassName) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }
        }}
      >
        {icon || <span className="mr-1">+</span>}
        {label}
      </button>
    </div>
  );
}
