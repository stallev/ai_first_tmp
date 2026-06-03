import { Suspense } from "react";

import { Heading } from "@/components/atoms";
import { LoginForm } from "@/components/auth/LoginForm.client";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { getMessages } from "@/lib/messages/server";


function LoginFormFallback() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  );
}

export default async function LoginPage() {
  const messages = await getMessages();
  return (
    <div className="flex flex-1 flex-col justify-center py-8">
      <Container variant="narrow" className="mx-auto w-full max-w-md px-4">
        <Heading as="h1" className="mb-6 text-center">
          {messages.auth.login.title}
        </Heading>
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </Container>
    </div>
  );
}
