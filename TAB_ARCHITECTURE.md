# Tab System Architecture

## Overview
TabOS implements a browser-like tab system with a linked-list ordering structure, client-side state management, and optimistic updates.

## Data Flow Architecture

### Database Schema (`apps/api/src/db/schema.ts`)
```typescript
tabs = {
  id: uuid (primary key)
  userId: text (user ownership)
  title: text (display name)
  content: jsonb (tab content)
  afterId: uuid (linked-list pointer)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Key Design**: Uses `afterId` to create a linked-list structure for tab ordering, where each tab points to the tab it comes after.

### Backend API (`apps/api/src/trpc/routers/tabs.ts`)

#### Core Endpoints:
- `list`: Returns all user tabs (unordered)
- `create`: Creates new tab with optional `afterId` positioning
- `delete`: Removes tab and relinks the chain to maintain order
- `update`: Updates tab title/content
- `updatePosition`: Changes tab position in the linked list
- `getById`: Retrieves specific tab

#### Transaction Safety:
- Tab deletion uses database transactions to maintain chain integrity
- Cycle detection prevents infinite loops in positioning
- User ownership validation on all operations

### Frontend Data Flow

#### 1. Data Fetching (`apps/core/src/hooks/use-tabs.ts`)
```typescript
useOrderedTabs() → buildTabOrder() → ordered tab array
```
- Fetches raw tabs from API
- Builds ordered array from linked-list structure
- Provides React Query caching and invalidation

#### 2. UI Components

**TabBar (`apps/core/src/components/tab-bar.tsx`)**:
- Renders ordered tabs using `useOrderedTabs()`
- Handles tab creation with positioning
- Manages tab deletion with optimistic updates
- Integrates with Zustand store for active tab state

**TabItem (`apps/core/src/components/tab-item.tsx`)**:
- Individual tab component with edit capabilities
- Handles click events for activation
- Provides close functionality

#### 3. State Management (`packages/stores/src/tab-store.ts`)
```typescript
TabStore = {
  activeTabId: string | null
  setActiveTab: (id) => void
  clearActiveTab: () => void
  handleTabDeletion: (deletedId, tabs) => void
}
```

**Smart Fallback Logic**: When active tab is deleted, automatically selects:
1. Next tab in order
2. Previous tab if no next
3. First tab if no previous
4. `null` if no tabs remain

## Data Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Database      │    │   tRPC API       │    │   React Query   │
│   (PostgreSQL)  │◄──►│   (Backend)      │◄──►│   (Cache)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Zustand       │    │   Tab Bar        │    │   Tab Hooks     │
│   (UI State)    │◄──►│   (UI Layer)     │◄──►│   (Data Layer)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Key Operations

### Creating a Tab
1. User clicks "+" button in TabBar
2. `handleCreateTab()` calls `createTab.mutate()`
3. API validates and inserts new tab with `afterId`
4. React Query invalidates cache
5. UI re-renders with new tab

### Deleting a Tab
1. User clicks "X" button on tab
2. `handleDeleteTab()` calls Zustand's `handleTabDeletion()`
3. Zustand updates active tab if needed (fallback logic)
4. `deleteTab.mutate()` with optimistic update
5. API removes tab and relinks chain in transaction
6. React Query invalidates cache

### Activating a Tab
1. User clicks on tab
2. `onClick` calls `setActiveTab(tab.id)`
3. Zustand updates `activeTabId`
4. UI re-renders with new active styles

## Current State
- ✅ Linked-list ordering with cycle prevention
- ✅ Optimistic updates for smooth UX
- ✅ Client-side active tab state management
- ✅ Smart fallback when active tab is deleted
- ✅ Transaction-safe operations
- ❌ Active tab persistence across sessions

## Recommended Enhancement: Active Tab Persistence

Add database persistence for active tab state:

```typescript
// Schema addition
isActive: boolean("is_active").default(false)

// New API endpoint
setActiveTab: protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.transaction(async (tx) => {
      // Clear all active tabs for user
      await tx.update(tabs)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(tabs.userId, ctx.auth.userId));
      
      // Set new active tab
      await tx.update(tabs)
        .set({ isActive: true, updatedAt: new Date() })
        .where(and(eq(tabs.id, input.id), eq(tabs.userId, ctx.auth.userId)));
    });
  })
```

This would enable:
- Cross-device active tab synchronization
- Session recovery after browser refresh
- Better user experience continuity