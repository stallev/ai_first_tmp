import { Suspense } from "react";

import { AdminPillTabs } from "@/components/admin/AdminPillTabs.client";
import { AdminQueueGridSkeleton } from "@/components/admin/AdminQueueGridSkeleton";
import { ReviewsTabPanel } from "@/components/admin/ReviewsTabPanel.server";
import { PageHeader } from "@/components/ui/PageHeader";
import { getReviewModerationCounts } from "@/data/admin/list-reviews-for-moderation.server";
import {
  getReviewModerationTabs,
  resolveReviewTab,
  REVIEW_TAB_VISIBLE,
} from "@/lib/admin/review-moderation-tabs";
import { getMessages } from "@/lib/messages/server";


type AdminReviewsPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function AdminReviewsPage({  searchParams,
}: AdminReviewsPageProps) {
  const messages = await getMessages();

  const params = await searchParams;
  const activeTab = resolveReviewTab(params.tab);
  const countsData = await getReviewModerationCounts();

  const counts: Record<string, number> = {
    visible: countsData.visible,
    hidden: countsData.hidden,
  };

  const tabs = getReviewModerationTabs(messages).map((tab) => ({
    value: tab.value,
    label: tab.label,
  }));

  return (
    <>
      <PageHeader title={messages.admin.reviews.title} />

      <AdminPillTabs
        activeTab={activeTab}
        tabs={tabs}
        counts={counts}
        basePath="/admin/reviews"
        defaultTab={REVIEW_TAB_VISIBLE}
        ariaLabel={messages.admin.reviews.tabsAriaLabel}
      >
        <Suspense fallback={<AdminQueueGridSkeleton count={4} />}>
          <ReviewsTabPanel tab={activeTab} />
        </Suspense>
      </AdminPillTabs>
    </>
  );
}
