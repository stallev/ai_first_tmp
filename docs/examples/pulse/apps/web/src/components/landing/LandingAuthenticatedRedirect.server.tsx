import { redirect } from "next/navigation";

import { getRoleHome } from "@pulse/policy-edge";

import { auth } from "@/auth";

export async function LandingAuthenticatedRedirect() {
  const session = await auth();

  if (session?.user?.role) {
    redirect(getRoleHome(session.user.role));
  }

  return null;
}
