import type { Tab } from "@tabos/api/db/schema";
import { cn } from "@tabos/ui/cn";
import { X } from "lucide-react";
// Updated TabItem component with browser-style appearance
import { useState } from "react";

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onActivate: () => void;
  onDelete: () => void;
  onTitleChange?: (newTitle: string) => void;
}

export const TabItem = ({
  tab,
  isActive,
  onActivate,
  onDelete,
  onTitleChange,
}: TabItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(tab.title);

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== tab.title) {
      onTitleChange?.(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setEditTitle(tab.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "relative group flex items-center min-w-[120px] max-w-[240px] h-8 px-3 cursor-pointer select-none",
        "border-t border-l border-r border-gray-300",
        "hover:bg-gray-50 transition-all duration-150",
        // Tab shape styling with pseudo-elements for rounded bottom corners
        "before:absolute before:bottom-0 before:left-0 before:w-2 before:h-2",
        "before:bg-gray-100 before:rounded-br-lg",
        "after:absolute after:bottom-0 after:right-0 after:w-2 before:h-2",
        "after:bg-gray-100 after:rounded-bl-lg",
        // Active/inactive styling
        isActive
          ? "bg-white border-gray-400 z-10 -mb-px border-b-0"
          : "bg-gray-50 border-gray-300 mb-px border-b",
        "rounded-t-lg",
      )}
      onClick={!isEditing ? onActivate : undefined}
    >
      {/* Favicon */}
      <div className="w-4 h-4 rounded bg-blue-500 mr-2 flex-shrink-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-sm"></div>
      </div>

      {/* Title / Input */}
      {isEditing ? (
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSaveTitle}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          autoFocus
          className="flex-1 text-sm bg-transparent border-none outline-none text-gray-700"
        />
      ) : (
        <span
          className="flex-1 text-sm text-gray-700 truncate pr-1 cursor-pointer"
          onDoubleClick={() => setIsEditing(true)}
          title={tab.title}
        >
          {tab.title}
        </span>
      )}

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
          "hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-150",
          "ml-1 text-gray-500 hover:text-gray-700",
        )}
        aria-label={`Close ${tab.title}`}
      >
        <X size={12} />
      </button>
    </div>
  );
};
