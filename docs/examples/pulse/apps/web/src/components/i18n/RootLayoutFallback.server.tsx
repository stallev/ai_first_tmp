import { PulseGoogleAnalytics } from "@/components/analytics/PulseGoogleAnalytics";
import { RootLayoutProviders } from "@/components/i18n/RootLayoutProviders";
import { DEFAULT_LOCALE } from "@/lib/i18n/constants";
import { getMessagesForLocale } from "@/lib/messages";
import { cn } from "@/lib/utils";

type RootLayoutFallbackProps = {
  children: React.ReactNode;
  fontClassName: string;
};

export function RootLayoutFallback({
  children,
  fontClassName,
}: RootLayoutFallbackProps) {
  const messages = getMessagesForLocale(DEFAULT_LOCALE);

  return (
    <html
      lang={DEFAULT_LOCALE}
      suppressHydrationWarning
      className={cn(fontClassName, "h-full antialiased")}
    >
      <body className="min-h-full flex flex-col">
        <RootLayoutProviders locale={DEFAULT_LOCALE} messages={messages}>
          {children}
        </RootLayoutProviders>
      </body>
      <PulseGoogleAnalytics />
    </html>
  );
}
