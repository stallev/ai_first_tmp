import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ClientDashboardCategories } from "@/components/client/ClientDashboardCategories";
import { ClientDashboardFeaturedTrainers } from "@/components/client/ClientDashboardFeaturedTrainers.server";
import { ClientDashboardFeaturedTrainersSkeleton } from "@/components/client/ClientDashboardFeaturedTrainersSkeleton";
import { ClientDashboardGreeting } from "@/components/client/ClientDashboardGreeting";
import {
  ClientDashboardSearchEntry,
  ClientNextSessionCard,
} from "@/components/client/ClientNextSessionCard";
import { getClientNextSession } from "@/data/client/get-client-bookings.server";
import { getMessages } from "@/lib/messages/server";

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getMessages();
  return {
    title: messages.dashboard.clientTitle,
  };
}

export default async function ClientDashboardPage() {
  const messages = await getMessages();
  const session = await auth();
  const displayName =
    session?.user?.name?.trim() || messages.common.guestClientName;
  const nextSession = await getClientNextSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6 pb-6">
      <ClientDashboardGreeting name={displayName} />
      <ClientDashboardSearchEntry />

      <div className="min-w-0 space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <ClientNextSessionCard session={nextSession} />
          <Suspense fallback={<ClientDashboardFeaturedTrainersSkeleton />}>
            <ClientDashboardFeaturedTrainers />
          </Suspense>
        </div>

        <aside className="min-w-0 space-y-6">
          <ClientDashboardCategories />
        </aside>
      </div>
    </div>
  );
}
