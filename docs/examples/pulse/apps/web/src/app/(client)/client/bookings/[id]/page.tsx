import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ClientBookingDetailActions } from "@/components/client/ClientBookingDetailActions.client";
import { ClientBookingDetailPanel } from "@/components/client/ClientBookingDetailPanel";
import { ForbiddenShell } from "@/components/shell/ForbiddenShell";
import { resolveClientBookingAccess } from "@/data/client/get-client-booking-detail.server";
import { getMessages } from "@/lib/messages/server";


type ClientBookingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getMessages();
  return {
    title: messages.booking.detail.metaTitle,
  };
}

export default async function ClientBookingDetailPage({  params,
}: ClientBookingDetailPageProps) {
  const messages = await getMessages();
  const { id } = await params;
  const access = await resolveClientBookingAccess(id);

  if (access.status === "not_found") {
    notFound();
  }

  if (access.status === "forbidden") {
    return (
      <ForbiddenShell
        title={messages.booking.detail.forbiddenTitle}
        description={messages.booking.detail.forbiddenDescription}
        ctaLabel={messages.booking.detail.forbiddenCta}
        ctaHref="/client/bookings"
      />
    );
  }

  const booking = access.booking;

  return (
    <ClientBookingDetailPanel
      booking={booking}
      actions={
        <ClientBookingDetailActions
          bookingId={booking.id}
          priceCents={booking.priceCents}
          canCancel={booking.canCancel}
          canLeaveReview={booking.canLeaveReview}
          canFileComplaint={booking.canFileComplaint}
          canRequestRefund={booking.canRequestRefund}
        />
      }
    />
  );
}
