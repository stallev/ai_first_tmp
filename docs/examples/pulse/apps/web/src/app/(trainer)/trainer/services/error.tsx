"use client";

import { RouteSegmentError } from "@/components/shell/RouteSegmentError";
import { useMessages } from "@/components/i18n/LocaleProvider.client";


export default function TrainerServicesError({  reset,
}: {
  reset: () => void;
}) {
  const messages = useMessages();

  return (
    <RouteSegmentError
      pageTitle={messages.trainer.services.title}
      title={messages.common.segmentError.title}
      description={messages.common.segmentError.description}
      retryLabel={messages.common.segmentError.retry}
      reset={reset}
    />
  );
}
