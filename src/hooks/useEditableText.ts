import { useState, useRef, useEffect, useCallback } from "react";

export function useEditableText(currentValue: string, onSave: (value: string) => void) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(currentValue);
  }, [currentValue]);

  const startEdit = useCallback(() => {
    setIsEditing(true);
    setEditValue(currentValue);
  }, [currentValue]);

  const save = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== currentValue) {
      onSave(trimmed);
    }
    setIsEditing(false);
  }, [editValue, currentValue, onSave]);

  const cancel = useCallback(() => {
    setEditValue(currentValue);
    setIsEditing(false);
  }, [currentValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        save();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    },
    [save, cancel]
  );

  return { isEditing, editValue, setEditValue, inputRef, startEdit, save, cancel, handleKeyDown };
}
