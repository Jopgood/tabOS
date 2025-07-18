"use client";

import { Plus, Check } from "lucide-react";
import { useState, type KeyboardEvent, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { SmartSelectionDisplay } from "./SmartSelectionDisplay";

// Generic base interface
interface SearchableItem {
  id: string;
}

// Search query hook type - supports both flat arrays and grouped results
type UseSearchQuery<T extends SearchableItem> = (
  query: string,
  enabled: boolean,
) => {
  data: T[] | Record<string, T[]> | undefined;
  isLoading: boolean;
};

// Selection mode types
type SelectionMode = "single" | "multiple";

type SelectionResult<T, Mode extends SelectionMode> = Mode extends "single"
  ? T | null
  : T[];

// Dialog configuration interface
interface ItemDialogConfig<
  T extends SearchableItem,
  Mode extends SelectionMode = "single",
> {
  title: string;
  description: string;
  buttonText: string;
  placeholder: string;
  selectionMode: Mode;
  useSearchQuery: UseSearchQuery<T>;
  renderItem: (item: T) => React.ReactNode;
  renderSelectedItem: (item: T) => React.ReactNode;
  getItemLabel: (item: T) => string;

  selectedItems: SelectionResult<T, Mode>;
  onSelectionChange: (selection: SelectionResult<T, Mode>) => void;
  onRemoveItem?: (item: T) => void;

  // Optional: Custom group labels for grouped results
  groupLabels?: Record<string, string>;

  // Optional: Custom dialog styling
  dialogClassName?: string;
}

export const ItemSelectDialog = <
  T extends SearchableItem,
  Mode extends SelectionMode = "single",
>({
  title,
  description,
  buttonText,
  placeholder,
  selectionMode,
  useSearchQuery,
  renderItem,
  renderSelectedItem,
  getItemLabel,
  selectedItems,
  onSelectionChange,
  onRemoveItem,
  groupLabels,
  dialogClassName = "sm:max-w-md", // Default dialog width
}: ItemDialogConfig<T, Mode>) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setSearchTerm("");
      setInputValue("");
    }
  };

  const selectedItemsArray = useMemo(() => {
    if (selectionMode === "single") {
      return selectedItems ? [selectedItems as T] : [];
    }
    return (selectedItems as T[]) || [];
  }, [selectedItems, selectionMode]);

  const { data: rawData, isLoading } = useSearchQuery(
    searchTerm,
    searchTerm.length > 0,
  );

  // Transform data into groups for rendering
  const groupedData = useMemo(() => {
    if (!rawData) return {};

    // If data is already grouped (object with arrays)
    if (!Array.isArray(rawData)) {
      return rawData;
    }

    // If data is a flat array, put it in a single group
    return { items: rawData };
  }, [rawData]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setSearchTerm(inputValue.trim());
    }
  };

  const handleSearch = () => {
    setSearchTerm(inputValue.trim());
  };

  const isSelected = (item: T) => {
    return selectedItemsArray.some((selected) => selected.id === item.id);
  };

  const handleItemClick = (item: T) => {
    if (selectionMode === "single") {
      const newSelection = isSelected(item) ? null : item;
      onSelectionChange(newSelection as SelectionResult<T, Mode>);
      setIsOpen(false);
    } else {
      const newSelection = isSelected(item)
        ? selectedItemsArray.filter((selected) => selected.id !== item.id)
        : [...selectedItemsArray, item];
      onSelectionChange(newSelection as SelectionResult<T, Mode>);
    }
  };

  const totalResults = Object.values(groupedData).reduce(
    (sum, group) => sum + group.length,
    0,
  );

  return (
    <div className="flex flex-col">
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {selectedItemsArray.length === 0 && selectionMode === "single" && (
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4" />
              <span>{buttonText}</span>
            </Button>
          </DialogTrigger>
        )}

        <DialogContent
          className={cn("flex max-h-[90vh] flex-col", dialogClassName)}
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <div className="grid shrink-0 gap-2">
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder={placeholder}
                  value={inputValue}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={!inputValue.trim()}>
                  Search
                </Button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {Object.entries(groupedData).map(([groupKey, items]) => (
                  <div key={groupKey}>
                    {/* Show group header if there are multiple groups */}
                    {Object.keys(groupedData).length > 1 &&
                      items.length > 0 && (
                        <div className="mb-2">
                          <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                            {groupLabels?.[groupKey] ?? groupKey} (
                            {items.length})
                          </h4>
                          <div className="mt-1 h-px bg-border" />
                        </div>
                      )}

                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className={`relative cursor-pointer rounded border p-2 hover:bg-gray-50 ${
                            isSelected(item) ? "border-blue-200 bg-blue-50" : ""
                          }`}
                        >
                          {renderItem(item)}
                          {isSelected(item) && (
                            <Check className="absolute right-2 top-2 h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {totalResults === 0 && searchTerm && !isLoading && (
                  <div className="p-3 text-center text-muted-foreground">
                    <span>No results found for {searchTerm}</span>
                  </div>
                )}

                {isLoading && (
                  <div className="p-3 text-center">
                    <span>Searching...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectionMode === "multiple" && selectedItemsArray.length > 0 && (
            <DialogFooter className="flex items-center border-t p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Selected: {selectedItemsArray.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Done
                </Button>
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <SmartSelectionDisplay
        items={selectedItemsArray}
        renderSelectedItem={renderSelectedItem}
        onRemoveItem={onRemoveItem}
        getItemLabel={getItemLabel}
      />
    </div>
  );
};
