import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-chat.example.com"),
  title: {
    default: "Nova — AI Chat Assistant",
    template: "%s · Nova",
  },
  description:
    "Nova is a fast, elegant AI chat assistant with Markdown, code highlighting, and a premium glassmorphism interface.",
  keywords: [
    "AI chat",
    "AI assistant",
    "DeepSeek",
    "Next.js",
    "chatbot",
    "Nova AI",
  ],
  authors: [{ name: "Nova AI" }],
  openGraph: {
    title: "Nova — AI Chat Assistant",
    description:
      "A fast, elegant AI chat assistant with Markdown, code highlighting, and a premium glassmorphism interface.",
    type: "website",
    siteName: "Nova",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nova — AI Chat Assistant",
    description:
      "A fast, elegant AI chat assistant with Markdown, code highlighting, and a premium glassmorphism interface.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07080d" },
    { media: "(prefers-color-scheme: light)", color: "#f7f7fb" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="app-backdrop min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-center"
            richColors
            theme="system"
            toastOptions={{
              style: {
                fontFamily: "var(--font-body)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
