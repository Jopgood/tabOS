"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Generic base interface
interface SearchableItem {
  id: string;
}

const ModalSelectionDisplay = <T extends SearchableItem>({
  items,
  renderSelectedItem,
  onRemoveItem,
  getItemLabel,
}: {
  items: T[];
  renderSelectedItem: (item: T) => React.ReactNode;
  onRemoveItem?: (item: T) => void;
  getItemLabel: (item: T) => string;
  compactThreshold?: number;
}) => {
  const [showManageModal, setShowManageModal] = useState(false);

  if (items.length === 0) return null;

  const getAvatarText = (item: T) => {
    const label = getItemLabel(item);
    // Extract first letter, or first letter of each word for multi-word labels
    const words = label.trim().split(/\s+/);
    if (words.length > 1) {
      return words
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
    }
    return label[0]?.toUpperCase() ?? "?";
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 p-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{items.length} selected</Badge>
          <div className="flex -space-x-1">
            {items.slice(0, 3).map((item) => (
              <Avatar
                key={item.id}
                className="h-6 w-6 border-2 border-background"
                title={getItemLabel(item)}
              >
                <AvatarFallback className="text-xs">
                  {getAvatarText(item)}
                </AvatarFallback>
              </Avatar>
            ))}
            {items.length > 3 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                +{items.length - 3}
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowManageModal(true)}
        >
          Manage
        </Button>
      </div>

      {/* Modal for managing selections */}
      <Dialog open={showManageModal} onOpenChange={setShowManageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Selections</DialogTitle>
            <DialogDescription>
              Remove items you no longer want selected.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded border p-2"
              >
                <div className="flex items-center gap-2">
                  {renderSelectedItem(item)}
                </div>
                {onRemoveItem && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowManageModal(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const SmartSelectionDisplay = <T extends SearchableItem>({
  items,
  renderSelectedItem,
  onRemoveItem,
  getItemLabel,
}: {
  items: T[];
  renderSelectedItem: (item: T) => React.ReactNode;
  onRemoveItem?: (item: T) => void;
  getItemLabel: (item: T) => string;
}) => {
  if (items.length === 0) return null;

  // 0 items: nothing
  // 1 item: regular badges
  // 1+ items: compact mode with modal

  if (items.length == 1) {
    return (
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className="flex flex-1 items-center gap-2 truncate"
            >
              {renderSelectedItem(item)}
            </Badge>
            {onRemoveItem && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(item)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <ModalSelectionDisplay
      items={items}
      renderSelectedItem={renderSelectedItem}
      onRemoveItem={onRemoveItem}
      getItemLabel={getItemLabel}
    />
  );
};
