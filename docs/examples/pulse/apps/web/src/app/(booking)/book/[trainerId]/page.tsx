import { Suspense } from "react";

import { BookingWizard } from "@/components/booking/BookingWizard.client";
import { BookingWizardSkeleton } from "@/components/booking/BookingWizardSkeleton";
import { getPublicTrainerProfile } from "@/data/trainer/get-public-trainer-profile.server";
import { BOOKING_WIZARD_STEP } from "@/lib/booking/booking-wizard-utils";

type BookTrainerPageProps = {
  params: Promise<{ trainerId: string }>;
  searchParams: Promise<{ serviceId?: string; step?: string }>;
};

function parseInitialStep(value: string | undefined): number {
  const step = Number(value);
  if (step === BOOKING_WIZARD_STEP.slot || step === BOOKING_WIZARD_STEP.confirm) {
    return step;
  }

  return BOOKING_WIZARD_STEP.service;
}

export default async function BookTrainerPage({
  params,
  searchParams,
}: BookTrainerPageProps) {
  const { trainerId } = await params;
  const query = await searchParams;
  const profile = await getPublicTrainerProfile(trainerId);

  return (
    <Suspense fallback={<BookingWizardSkeleton />}>
      <BookingWizard
        profile={profile}
        initialServiceId={query.serviceId ?? profile.defaultServiceId}
        initialStep={parseInitialStep(query.step)}
      />
    </Suspense>
  );
}
