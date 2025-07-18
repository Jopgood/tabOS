// apps/core/src/hooks/useTabActions.ts
import { api } from "@/trpc/client";

export function useTabActions() {
  const utils = api.useUtils();
  const createMutation = api.tabs.create.useMutation();
  const deleteMutation = api.tabs.delete.useMutation();
  const updatePositionMutation = api.tabs.updatePosition.useMutation();
  const updateMutation = api.tabs.update.useMutation();
  const setActiveMutation = api.tabs.setActive.useMutation();

  const addTab = async (input: {
    title: string;
    afterId?: string;
    content?: any;
  }) => {
    return await createMutation.mutateAsync({
      title: input.title,
      afterId: input.afterId,
      content: input.content,
    });
  };

  const removeTab = async (input: { id: string }) => {
    return await deleteMutation.mutateAsync({ id: input.id });
  };

  const moveTab = async (tabId: string, afterId?: string) => {
    return await updatePositionMutation.mutateAsync({
      id: tabId,
      afterId: afterId,
    });
  };

  const updateTab = async (input: {
    id: string;
    title?: string;
    content?: any;
  }) => {
    return await updateMutation.mutateAsync(input);
  };

  const setActiveTab = async (input: { id: string }) => {
    return await setActiveMutation.mutateAsync(input);
  };

  return {
    addTab,
    removeTab,
    moveTab,
    updateTab,
    setActiveTab,
    isAdding: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isMoving: updatePositionMutation.isPending,
    isUpdating: updateMutation.isPending,
    isSettingActive: setActiveMutation.isPending,
  };
}
