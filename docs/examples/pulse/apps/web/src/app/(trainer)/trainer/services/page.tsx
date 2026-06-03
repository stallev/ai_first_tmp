import type { Metadata } from "next";

import { TrainerServicesList } from "@/components/trainer/TrainerServicesList.client";
import { getTrainerServicesForEdit } from "@/data/trainer/get-trainer-services-for-edit.server";
import { getMessages } from "@/lib/messages/server";


export async function generateMetadata(): Promise<Metadata> {
  const messages = await getMessages();
  return {
    title: messages.trainer.services.metaTitle,
  };
}

export default async function TrainerServicesPage() {
  const messages = await getMessages();
  const { services } = await getTrainerServicesForEdit();

  return <TrainerServicesList initialServices={services} />;
}
