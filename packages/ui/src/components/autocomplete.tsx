import { Command as CommandPrimitive } from "cmdk";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./command";
import { Input } from "./input";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";
import { Skeleton } from "./skeleton";

// First, let's define the types for both regular items and grouped items
type RegularItem<T extends string> = {
  value: T;
  label: string;
  group?: undefined;
  items?: undefined;
};

type GroupedItem<T extends string> = {
  group: string;
  items: Array<{
    value: T;
    label: string;
  }>;
  value?: undefined;
  label?: undefined;
};

// A union type that can be either a regular item or a grouped item
type Item<T extends string> = RegularItem<T> | GroupedItem<T>;

// Update the Props type to use this union type
type Props<T extends string> = {
  selectedValue: T;
  onSelectedValueChange: (value: T) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  items: Item<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  placeholder?: string;
};

export function AutoComplete<T extends string>({
  selectedValue,
  onSelectedValueChange,
  searchValue,
  onSearchValueChange,
  items,
  isLoading,
  emptyMessage = "No items.",
  placeholder = "Search...",
}: Props<T>) {
  const [open, setOpen] = useState(false);

  const labels = useMemo(() => {
    const result: Record<string, string> = {};

    items.forEach((item) => {
      if (item.group && Array.isArray(item.items)) {
        // Handle grouped items
        item.items.forEach((option) => {
          result[option.value] = option.label;
        });
      } else if (item.value !== undefined && item.label !== undefined) {
        // Handle regular items
        result[item.value] = item.label;
      }
    });

    return result;
  }, [items]);

  const reset = () => {
    onSelectedValueChange("" as T);
    onSearchValueChange("");
  };

  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Only reset if:
    // 1. We're not clicking on the dropdown list
    // 2. There's a search value but no selected value
    // 3. The search value doesn't match any known label
    if (
      !e.relatedTarget?.hasAttribute("cmdk-list") &&
      searchValue &&
      !selectedValue &&
      !Object.values(labels).some(
        (label) => label.toLowerCase() === searchValue.toLowerCase(),
      )
    ) {
      reset();
    }

    // If we have a selected value, ensure the search value matches its label
    if (
      selectedValue &&
      labels[selectedValue] &&
      searchValue !== labels[selectedValue]
    ) {
      onSearchValueChange(labels[selectedValue]);
    }
  };

  const onSelectItem = (inputValue: string) => {
    if (inputValue === selectedValue) {
      reset();
    } else {
      // First update the search value to match the label
      onSearchValueChange(labels[inputValue] ?? "");
      // Then update the selected value
      onSelectedValueChange(inputValue as T);
    }
    setOpen(false);
  };

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <PopoverAnchor asChild>
            <CommandPrimitive.Input
              asChild
              value={searchValue}
              onValueChange={(value) => {
                onSearchValueChange(value);
                // Open dropdown when user starts typing
                if (value.trim().length > 0) {
                  setOpen(true);
                } else {
                  setOpen(false);
                }
              }}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Escape") {
                  setOpen(false);
                } else if (searchValue.trim().length > 0) {
                  setOpen(true);
                }
              }}
              onMouseDown={() => {
                if (searchValue.trim().length > 0) {
                  setOpen(true);
                }
              }}
              onFocus={() => {
                if (searchValue.trim().length > 0) {
                  setOpen(true);
                }
              }}
              onBlur={onInputBlur}
            >
              <Input placeholder={placeholder} />
            </CommandPrimitive.Input>
          </PopoverAnchor>
          {!open && <CommandList aria-hidden="true" className="hidden" />}
          <PopoverContent
            asChild
            onOpenAutoFocus={(e: Event) => e.preventDefault()}
            onInteractOutside={(e: Event) => {
              if (
                e.target instanceof Element &&
                e.target.hasAttribute("cmdk-input")
              ) {
                e.preventDefault();
              }
            }}
            className="w-[--radix-popover-trigger-width] p-0"
          >
            <CommandList>
              {isLoading && (
                <CommandPrimitive.Loading>
                  <div className="p-1">
                    <Skeleton className="h-6 w-full" />
                  </div>
                </CommandPrimitive.Loading>
              )}

              {!isLoading && items.length === 0 ? (
                <CommandEmpty>{emptyMessage ?? "No items."}</CommandEmpty>
              ) : null}

              {!isLoading && items.length > 0 && (
                <>
                  {items.map((item) => {
                    // Check if the item has a group property with nested items
                    if (item.group && Array.isArray(item.items)) {
                      // Only render the CommandGroup if it has items
                      if (item.items.length > 0) {
                        return (
                          <CommandGroup key={item.group} heading={item.group}>
                            {item.items.map((option) => (
                              <CommandItem
                                key={option.value}
                                value={option.value}
                                onMouseDown={(e: React.MouseEvent) =>
                                  e.preventDefault()
                                }
                                onSelect={onSelectItem}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedValue === option.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {option.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        );
                      }
                      // Return null if the group has no items
                      return null;
                    }

                    // Regular item without grouping
                    return (
                      <CommandItem
                        key={item.value}
                        value={item.value}
                        onMouseDown={(e: React.MouseEvent) =>
                          e.preventDefault()
                        }
                        onSelect={onSelectItem}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedValue === item.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {item.label}
                      </CommandItem>
                    );
                  })}
                </>
              )}
            </CommandList>
          </PopoverContent>
        </Command>
      </Popover>
    </div>
  );
}
