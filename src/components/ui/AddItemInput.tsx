"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddItemInputProps {
  label: string;
  placeholder: string;
  onAdd: (value: string) => void;
  icon?: ReactNode;
}

export function AddItemInput({
  label,
  placeholder,
  onAdd,
  icon,
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
      <div className="py-1">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="text-sm"
          aria-label={placeholder}
        />
      </div>
    );
  }

  return (
    <div className="py-1">
      <Button
        variant="link"
        size="sm"
        onClick={() => {
          setIsInputMode(true);
          setInputValue("");
        }}
        className="text-muted-foreground"
      >
        {icon || <span className="mr-1">+</span>}
        {label}
      </Button>
    </div>
  );
}
