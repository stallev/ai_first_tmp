import { Suspense } from "react";

import { AdminTrainersTabs } from "@/components/admin/AdminTrainersTabs.client";
import { TrainerApplicationsGridSkeleton } from "@/components/admin/TrainerApplicationsGridSkeleton";
import { TrainerApplicationsTabPanel } from "@/components/admin/TrainerApplicationsTabPanel.server";
import { PageHeader } from "@/components/ui/PageHeader";
import { getTrainerApplicationCounts } from "@/data/admin/list-trainer-applications.server";
import { resolveTrainerModerationTab } from "@/lib/admin/trainer-moderation-tabs";
import { getMessages } from "@/lib/messages/server";


type AdminTrainersPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function AdminTrainersPage({  searchParams,
}: AdminTrainersPageProps) {
  const messages = await getMessages();

  const params = await searchParams;
  const activeTab = resolveTrainerModerationTab(params.tab, messages);
  const counts = await getTrainerApplicationCounts();

  return (
    <>
      <PageHeader title={messages.admin.moderation.title} />

      <AdminTrainersTabs activeTab={activeTab} counts={counts}>
        <Suspense fallback={<TrainerApplicationsGridSkeleton />}>
          <TrainerApplicationsTabPanel status={activeTab} />
        </Suspense>
      </AdminTrainersTabs>
    </>
  );
}
