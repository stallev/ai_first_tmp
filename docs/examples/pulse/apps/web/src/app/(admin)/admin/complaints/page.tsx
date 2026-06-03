import { Suspense } from "react";

import { COMPLAINT_STATUS } from "@pulse/domain";

import { AdminPillTabs } from "@/components/admin/AdminPillTabs.client";
import { AdminQueueGridSkeleton } from "@/components/admin/AdminQueueGridSkeleton";
import { ComplaintsTabPanel } from "@/components/admin/ComplaintsTabPanel.server";
import { PageHeader } from "@/components/ui/PageHeader";
import { getComplaintCounts } from "@/data/admin/list-complaints.server";
import { getComplaintModerationTabs, resolveComplaintTab } from "@/lib/admin/complaint-moderation-tabs";
import { getMessages } from "@/lib/messages/server";


type AdminComplaintsPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function AdminComplaintsPage({  searchParams,
}: AdminComplaintsPageProps) {
  const messages = await getMessages();

  const params = await searchParams;
  const activeTab = resolveComplaintTab(params.tab, messages);
  const counts = await getComplaintCounts();

  const tabs = getComplaintModerationTabs(messages).map((tab) => ({
    value: tab.value,
    label: tab.label,
  }));

  return (
    <>
      <PageHeader title={messages.admin.complaints.title} />

      <AdminPillTabs
        activeTab={activeTab}
        tabs={tabs}
        counts={counts}
        basePath="/admin/complaints"
        defaultTab={COMPLAINT_STATUS.OPEN}
        ariaLabel={messages.admin.complaints.tabsAriaLabel}
      >
        <Suspense fallback={<AdminQueueGridSkeleton count={4} />}>
          <ComplaintsTabPanel status={activeTab} />
        </Suspense>
      </AdminPillTabs>
    </>
  );
}
