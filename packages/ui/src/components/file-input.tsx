/* eslint-disable */
"use client";
// @ts-nocheck
import { Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FileInputProps {
  onChange?: (files: FileList | null) => void;
  value?: File | null;
  accept?: string;
  multiple?: boolean;
  placeholder?: string;
  className?: string;
}

export function FileInput({
  onChange,
  value,
  accept,
  multiple = false,
  placeholder = "Select file",
  className = "",
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(value?.name || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      // @ts-expect-error - a shadcn issue not my issue
      setFileName(multiple ? `${files.length} files selected` : files[0].name);

      onChange?.(files);
    } else {
      setFileName(null);
      onChange?.(null);
    }
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setFileName(null);
    onChange?.(null);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Input
          type="text"
          readOnly
          value={fileName || ""}
          placeholder={placeholder}
          className={`cursor-pointer pr-10 ${className}`}
          onClick={() => inputRef.current?.click()}
        />
        {fileName && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        Browse
      </Button>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
      />
    </div>
  );
}
