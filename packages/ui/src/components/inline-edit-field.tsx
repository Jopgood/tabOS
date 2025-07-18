"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface InlineEditFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  type?: string;
  debounceMs?: number;
}

export function InlineEditField({
  value,
  onValueChange,
  placeholder = "Click to edit...",
  className,
  displayClassName,
  type = "text",
  debounceMs = 0,
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempValue, setTempValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    setTempValue(value);
  }, [value]);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  // Auto-save with debounce
  React.useEffect(() => {
    if (isEditing && tempValue !== value) {
      // Clear existing timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new timeout for auto-save
      debounceRef.current = setTimeout(() => {
        onValueChange(tempValue);
      }, debounceMs);
    }

    // Cleanup timeout on unmount
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [tempValue, value, isEditing, onValueChange, debounceMs]);

  const handleCancel = () => {
    // Clear any pending auto-save
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setTempValue(value);
    setIsEditing(false);
  };

  const handleFinishEditing = () => {
    // Clear debounce and save immediately
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onValueChange(tempValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFinishEditing();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleFinishEditing}
          onKeyDown={handleKeyDown}
          className={cn(
            "border-0 border-b-2 border-primary bg-transparent px-2 outline-none",
            "focus:border-primary focus:ring-0",
            "inline-block text-left",
            className,
          )}
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer rounded-sm px-2 transition-colors hover:bg-muted/50",
        "border-b-2 border-transparent",
        "min-h-[1.5rem] w-full text-left",
        className,
        displayClassName,
      )}
    >
      {value || (
        <span className="italic text-muted-foreground">{placeholder}</span>
      )}
    </div>
  );
}
