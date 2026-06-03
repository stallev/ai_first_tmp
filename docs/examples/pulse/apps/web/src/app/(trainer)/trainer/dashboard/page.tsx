import { Suspense } from "react";

import { Heading } from "@/components/atoms";
import { TrainerDashboardSubmittedToast } from "@/components/trainer/TrainerDashboardSubmittedToast.client";
import { TrainerDashboardKpiGrid } from "@/components/trainer/TrainerDashboardKpiGrid";
import { TrainerRecentReviews } from "@/components/trainer/TrainerRecentReviews";
import { TrainerTodaySessionsList } from "@/components/trainer/TrainerTodaySessionsList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getTrainerDashboardSnapshot } from "@/data/trainer/get-trainer-dashboard.server";
import { getMessages } from "@/lib/messages/server";


export default async function TrainerDashboardPage() {
  const messages = await getMessages();
  const snapshot = await getTrainerDashboardSnapshot();

  return (
    <>
      <Suspense fallback={null}>
        <TrainerDashboardSubmittedToast />
      </Suspense>
      <Heading as="h1" visualLevel="h3">
        {messages.dashboard.trainerTitle}
      </Heading>
      {!snapshot.isApproved ? (
        <Alert className="mt-4">
          <AlertTitle>{messages.trainerReviewBanner.title}</AlertTitle>
          <AlertDescription>{messages.trainerReviewBanner.description}</AlertDescription>
        </Alert>
      ) : null}
      <div className="mt-6 space-y-6">
        <TrainerDashboardKpiGrid snapshot={snapshot} />
        <div className="grid gap-6 md:grid-cols-2">
          <TrainerTodaySessionsList sessions={snapshot.todaySessions} />
          <TrainerRecentReviews reviews={snapshot.recentReviews} />
        </div>
      </div>
    </>
  );
}
