import {
  useCreateTab,
  useOrderedTabs,
  useSetActiveTab,
} from "@/hooks/use-tabs";
import { useTabStore } from "@tabos/stores";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@tabos/ui/sidebar";

import type { LucideIcon } from "lucide-react";

export function NavPrimary({
  items,
}: {
  items: {
    title: string;
    icon: LucideIcon;
    type: string;
  }[];
}) {
  const { data: orderedTabs } = useOrderedTabs();
  const createTab = useCreateTab();
  const setActiveTab = useSetActiveTab();
  const { setActiveTab: storeSetActiveTab } = useTabStore();

  const handleCreateTab = (type: string) => {
    const lastTab = orderedTabs?.[orderedTabs.length - 1];

    createTab.mutate(
      {
        title: "New Tab " + (orderedTabs?.length || 0),
        type: type,
        afterId: lastTab?.id,
      },
      {
        onSuccess: (newTab) => {
          // Set the new tab as active
          setActiveTab.mutate({ id: newTab.id });
          storeSetActiveTab(newTab.id);
        },
      }
    );
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="px-1.5 md:px-0">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={{
                  children: item.title,
                  hidden: false,
                }}
                className="px-2.5 md:px-2"
                onClick={() => handleCreateTab(item.type)}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
