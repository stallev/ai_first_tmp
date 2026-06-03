import { auth } from "@/auth";
import { PulseGoogleAnalytics } from "@/components/analytics/PulseGoogleAnalytics";
import { RootLayoutProviders } from "@/components/i18n/RootLayoutProviders";
import { resolveLocale } from "@/lib/i18n/resolve-locale";
import { getMessages } from "@/lib/messages/server";
import { cn } from "@/lib/utils";

type RootLayoutContentProps = {
  children: React.ReactNode;
  fontClassName: string;
};

export async function RootLayoutContent({
  children,
  fontClassName,
}: RootLayoutContentProps) {
  const session = await auth();
  const locale = await resolveLocale({
    sessionLocale: session?.user?.locale,
  });
  const messages = await getMessages(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(fontClassName, "h-full antialiased")}
    >
      <body className="min-h-full flex flex-col">
        <RootLayoutProviders locale={locale} messages={messages}>
          {children}
        </RootLayoutProviders>
      </body>
      <PulseGoogleAnalytics />
    </html>
  );
}
