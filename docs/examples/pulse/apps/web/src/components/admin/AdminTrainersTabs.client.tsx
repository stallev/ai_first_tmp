"use client";

import { useRouter } from "next/navigation";
import type { TrainerStatus } from "@pulse/domain";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatModerationTabLabel,
  getTrainerModerationTabs,
} from "@/lib/admin/trainer-moderation-tabs";
import { useMessages } from "@/components/i18n/LocaleProvider.client";

import { cn } from "@/lib/utils";

export type AdminTrainersTabsProps = {
  activeTab: TrainerStatus;
  counts: Record<TrainerStatus, number>;
  children: React.ReactNode;
};

export function AdminTrainersTabs({
  activeTab,
  counts,
  children,
}: AdminTrainersTabsProps) {
  const messages = useMessages();
  const tabs = getTrainerModerationTabs(messages);
  const router = useRouter();

  const handleTabChange = (value: string) => {
    const nextUrl =
      value === tabs[0]?.value
        ? "/admin/trainers"
        : `/admin/trainers?tab=${value}`;
    router.replace(nextUrl);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
      <TabsList
        variant="pill"
        aria-label={messages.admin.moderation.tabsAriaLabel}
        className={cn(
          "max-w-full",
          "w-fit",
          "-mx-4 overflow-x-auto px-4 no-scrollbar",
          "md:mx-0 md:px-0 md:overflow-visible",
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {formatModerationTabLabel(tab.label, counts[tab.value])}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeTab}>{children}</TabsContent>
    </Tabs>
  );
}
