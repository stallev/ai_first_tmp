"use client";

import { AdminPageError } from "@/components/admin/AdminPageError";
import { useMessages } from "@/components/i18n/LocaleProvider.client";


export default function AdminDashboardError({  reset,
}: {
  reset: () => void;
}) {
  const messages = useMessages();

  return (
    <AdminPageError
      pageTitle={messages.dashboard.adminTitle}
      title={messages.admin.shared.loadError}
      description={messages.admin.shared.loadErrorDescription}
      retryLabel={messages.admin.shared.retry}
      reset={reset}
    />
  );
}
