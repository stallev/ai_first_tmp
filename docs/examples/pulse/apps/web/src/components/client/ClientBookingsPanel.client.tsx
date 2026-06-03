"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { BookingListItem } from "@/components/booking/BookingListItem.client";
import { ClientBookingCancelDialog } from "@/components/client/ClientBookingCancelDialog.client";
import { Button } from "@/components/ui/button";
import { CustomLink } from "@/components/ui/CustomLink";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ClientBookingListEntry } from "@/data/client/get-client-bookings.server";
import {
  CLIENT_BOOKING_TABS,
  groupBookingsByTab,
  type ClientBookingTab,
} from "@/lib/booking/booking-tab-utils";
import { useMessages } from "@/components/i18n/LocaleProvider.client";

import { PRODUCT_TOAST_DURATION_MS } from "@/lib/ui/product-toast";

export type ClientBookingsPanelProps = {
  bookings: ClientBookingListEntry[];
};

export function ClientBookingsPanel({ bookings }: ClientBookingsPanelProps) {
  const messages = useMessages();

  const tabLabels: Record<ClientBookingTab, string> = {
    upcoming: messages.booking.list.tabs.upcoming,
    past: messages.booking.list.tabs.past,
    cancelled: messages.booking.list.tabs.cancelled,
  };

  const emptyCopy: Record<
    ClientBookingTab,
    { title: string; description: string }
  > = {
    upcoming: messages.booking.list.empty.upcoming,
    past: messages.booking.list.empty.past,
    cancelled: messages.booking.list.empty.cancelled,
  };
  const grouped = groupBookingsByTab(bookings);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const handleCancelClick = (bookingId: string) => {
    setCancelBookingId(bookingId);
    setCancelOpen(true);
  };

  const handleJoinClick = () => {
    toast.info(messages.placeholders.sessionVideo, {
      duration: PRODUCT_TOAST_DURATION_MS,
    });
  };

  return (
    <>
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList variant="pill" aria-label={messages.booking.list.title}>
          {CLIENT_BOOKING_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tabLabels[tab]}
            </TabsTrigger>
          ))}
        </TabsList>

        {CLIENT_BOOKING_TABS.map((tab) => {
          const items = grouped[tab];
          const emptyStateCopy = emptyCopy[tab];

          return (
            <TabsContent key={tab} value={tab} className="space-y-2.5">
              {items.length === 0 ? (
                <Empty className="border-border bg-card lg:col-span-2">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CalendarIcon aria-hidden />
                    </EmptyMedia>
                    <EmptyTitle>{emptyStateCopy.title}</EmptyTitle>
                    <EmptyDescription>{emptyStateCopy.description}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button asChild>
                      <CustomLink href="/trainers">
                        {messages.booking.list.empty.cta}
                      </CustomLink>
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="grid grid-cols-1 items-stretch gap-2.5 md:grid-cols-2">
                  {items.map((booking) => (
                    <BookingListItem
                      key={booking.id}
                      booking={booking}
                      tab={tab}
                      className="h-full"
                      onCancelClick={() => handleCancelClick(booking.id)}
                      onJoinClick={handleJoinClick}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <ClientBookingCancelDialog
        bookingId={cancelBookingId}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
    </>
  );
}
