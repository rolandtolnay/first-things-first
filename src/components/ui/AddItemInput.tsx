"use client";

import { useState, useRef, useEffect } from "react";

interface AddItemInputProps {
  label: string;
  placeholder: string;
  onAdd: (value: string) => void;
  wrapperClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export function AddItemInput({
  label,
  placeholder,
  onAdd,
  wrapperClassName = "",
  inputClassName = "",
  buttonClassName = "",
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
      <div className={wrapperClassName}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClassName}
          aria-label={placeholder}
        />
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        onClick={() => {
          setIsInputMode(true);
          setInputValue("");
        }}
        className={buttonClassName}
      >
        <span className="mr-1">+</span>
        {label}
      </button>
    </div>
  );
}
