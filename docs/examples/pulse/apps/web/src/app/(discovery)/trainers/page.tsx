import { Suspense } from "react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogTrainerGridSkeleton } from "@/components/catalog/CatalogTrainerGridSkeleton";
import { CatalogTrainerGrid } from "@/components/catalog/CatalogTrainerGrid.server";
import { CatalogActiveFilterChips } from "@/components/catalog/filters/CatalogActiveFilterChips.client";
import { CatalogFilterSheet } from "@/components/catalog/filters/CatalogFilterSheet.client";
import { CatalogFilterSidebar } from "@/components/catalog/filters/CatalogFilterSidebar.client";
import { CatalogSearchInput } from "@/components/catalog/filters/CatalogSearchInput.client";
import { getCatalogFilterOptions } from "@/data/catalog/get-catalog-filter-options.server";
import { parseCatalogSearchParams } from "@/lib/catalog/parse-catalog-search-params";
import { getCatalogFilterSidebarKey } from "@/lib/catalog/catalog-filter-draft";
import { getMessages } from "@/lib/messages/server";


export async function generateMetadata(): Promise<Metadata> {
  const messages = await getMessages();
  return {
    title: messages.catalog.meta.title,
    description: messages.catalog.meta.description,
  };
}

type TrainersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TrainersPage({  searchParams,
}: TrainersPageProps) {
  const messages = await getMessages();
  const query = parseCatalogSearchParams(await searchParams);
  const filterOptions = await getCatalogFilterOptions();

  return (
    <div className="space-y-4">
      <PageHeader title={messages.catalog.title} />

      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">
        <CatalogFilterSidebar
          key={getCatalogFilterSidebarKey(query)}
          query={query}
          options={filterOptions}
        />

        <div className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <CatalogSearchInput query={query} className="flex-1" />
            <CatalogFilterSheet query={query} options={filterOptions} />
          </div>

          <CatalogActiveFilterChips
            query={query}
            options={filterOptions}
            className="-mx-4 px-4"
          />

          <Suspense fallback={<CatalogTrainerGridSkeleton />}>
            <CatalogTrainerGrid query={query} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
