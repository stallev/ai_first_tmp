"use client";

import { useRouter } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatModerationTabLabel } from "@/lib/admin/format-tab-label";
import { cn } from "@/lib/utils";

export type AdminPillTabConfig = {
  value: string;
  label: string;
};

export type AdminPillTabsProps = {
  activeTab: string;
  tabs: AdminPillTabConfig[];
  counts: Record<string, number>;
  basePath: string;
  defaultTab: string;
  ariaLabel: string;
  children: React.ReactNode;
};

export function AdminPillTabs({
  activeTab,
  tabs,
  counts,
  basePath,
  defaultTab,
  ariaLabel,
  children,
}: AdminPillTabsProps) {
  const router = useRouter();

  const handleTabChange = (value: string) => {
    const nextUrl =
      value === defaultTab ? basePath : `${basePath}?tab=${value}`;
    router.replace(nextUrl);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
      <TabsList
        variant="pill"
        aria-label={ariaLabel}
        className={cn(
          "max-w-full",
          "w-fit",
          "-mx-4 overflow-x-auto px-4 no-scrollbar",
          "md:mx-0 md:px-0 md:overflow-visible",
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {formatModerationTabLabel(tab.label, counts[tab.value] ?? 0)}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeTab}>{children}</TabsContent>
    </Tabs>
  );
}
