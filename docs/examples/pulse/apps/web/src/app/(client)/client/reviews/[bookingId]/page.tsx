import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { Heading } from "@/components/atoms";
import { ReviewBookingContext } from "@/components/client/ReviewBookingContext";
import { ReviewForm } from "@/components/client/ReviewForm.client";
import { resolveClientReviewPageAccess } from "@/data/client/get-client-review-form.server";
import { getMessages } from "@/lib/messages/server";


type ClientReviewPageProps = {
  params: Promise<{ bookingId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getMessages();
  return {
    title: messages.review.metaTitle,
  };
}

export default async function ClientReviewPage({ params }: ClientReviewPageProps) {
  const messages = await getMessages();
  const { bookingId } = await params;
  const access = await resolveClientReviewPageAccess(bookingId);

  if (access.status === "redirect") {
    redirect(`/client/bookings/${access.bookingId}`);
  }

  if (access.status === "not_found") {
    notFound();
  }

  const context = access.context;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 py-4 pb-6">
      <Heading as="h1" visualLevel="h2">
        {messages.review.heading}
      </Heading>
      <ReviewBookingContext context={context} />
      <ReviewForm bookingId={context.bookingId} />
    </div>
  );
}
