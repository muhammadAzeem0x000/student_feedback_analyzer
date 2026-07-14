import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SignalRoom — Anonymous Course Feedback", template: "%s · SignalRoom" },
  description: "Privacy-aware course feedback, thoughtful reflection, and evidence-grounded AI teaching insights.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "SignalRoom — Anonymous Course Feedback",
    description: "Hear the room. Improve the next one.",
    type: "website",
    images: [{ url: "/og.png", width: 1744, height: 908, alt: "SignalRoom anonymous course feedback dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SignalRoom — Anonymous Course Feedback",
    description: "Hear the room. Improve the next one.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
