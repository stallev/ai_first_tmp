import "server-only";

import {
  BOOKING_STATUS,
  canClientCancelBooking,
  type BookingStatus,
} from "@pulse/domain";
import { getPrisma } from "@pulse/db";

import { getPolicySessionContext } from "@/server/auth/session-to-policy-context";

export type ClientBookingListEntry = {
  id: string;
  status: BookingStatus;
  serviceNameSnapshot: string;
  startsAtUtc: string;
  trainerName: string;
  trainerPhotoUrl: string | null;
  canCancel: boolean;
  hasReview: boolean;
  reviewRating: number | null;
};

export async function getClientBookings(): Promise<ClientBookingListEntry[]> {
  const ctx = await getPolicySessionContext();
  if (!ctx) {
    return [];
  }

  const prisma = getPrisma();
  const bookings = await prisma.booking.findMany({
    where: { clientId: ctx.userId },
    orderBy: { startsAt: "desc" },
    select: {
      id: true,
      status: true,
      serviceNameSnapshot: true,
      startsAt: true,
      review: { select: { id: true, rating: true } },
      trainerProfile: {
        select: {
          photoUrl: true,
          user: { select: { fullName: true } },
        },
      },
    },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    status: booking.status,
    serviceNameSnapshot: booking.serviceNameSnapshot,
    startsAtUtc: booking.startsAt.toISOString(),
    trainerName: booking.trainerProfile.user.fullName,
    trainerPhotoUrl: booking.trainerProfile.photoUrl,
    canCancel: canClientCancelBooking({
      status: booking.status,
      startsAtUtc: booking.startsAt.toISOString(),
    }),
    hasReview: booking.review !== null,
    reviewRating: booking.review?.rating ?? null,
  }));
}

export async function getClientNextSession(): Promise<ClientBookingListEntry | null> {
  const ctx = await getPolicySessionContext();
  if (!ctx) {
    return null;
  }

  const prisma = getPrisma();
  const booking = await prisma.booking.findFirst({
    where: {
      clientId: ctx.userId,
      status: { in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
      startsAt: { gte: new Date() },
    },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      status: true,
      serviceNameSnapshot: true,
      startsAt: true,
      review: { select: { id: true, rating: true } },
      trainerProfile: {
        select: {
          photoUrl: true,
          user: { select: { fullName: true } },
        },
      },
    },
  });

  if (!booking) {
    return null;
  }

  return {
    id: booking.id,
    status: booking.status,
    serviceNameSnapshot: booking.serviceNameSnapshot,
    startsAtUtc: booking.startsAt.toISOString(),
    trainerName: booking.trainerProfile.user.fullName,
    trainerPhotoUrl: booking.trainerProfile.photoUrl,
    canCancel: canClientCancelBooking({
      status: booking.status,
      startsAtUtc: booking.startsAt.toISOString(),
    }),
    hasReview: booking.review !== null,
    reviewRating: booking.review?.rating ?? null,
  };
}
