"use client";

import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";

export type RouteSegmentErrorProps = {
  pageTitle: string;
  title: string;
  description: string;
  retryLabel: string;
  reset: () => void;
};

export function RouteSegmentError({
  pageTitle,
  title,
  description,
  retryLabel,
  reset,
}: RouteSegmentErrorProps) {
  return (
    <div className="space-y-4">
      <PageHeader title={pageTitle} />
      <Alert variant="destructive">
        <AlertCircleIcon aria-hidden />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>{description}</span>
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            {retryLabel}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
