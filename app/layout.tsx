import ConvexClientProvider from "@/components/ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Heritage Multipurpose Cooperative Society",
  description:
    "Save daily, build wealth, and access loans. Heritage Cooperative helps Nigerians grow together.",
  manifest: "/manifest.webmanifest",
  themeColor: "#059669",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Heritage Cooperative",
    // Splash screens for all common iOS screen sizes
    startupImage: [
      // iPhone SE (1st & 2nd gen)
      { url: "/splashscreen?w=640&h=1136", media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" },
      // iPhone 8 / SE 3rd gen
      { url: "/splashscreen?w=750&h=1334", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
      // iPhone 8 Plus
      { url: "/splashscreen?w=1242&h=2208", media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone X / XS / 11 Pro
      { url: "/splashscreen?w=1125&h=2436", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone XR / 11
      { url: "/splashscreen?w=828&h=1792", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" },
      // iPhone XS Max / 11 Pro Max
      { url: "/splashscreen?w=1242&h=2688", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone 12 / 13 / 14
      { url: "/splashscreen?w=1170&h=2532", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone 12 Pro Max / 13 Pro Max / 14 Plus
      { url: "/splashscreen?w=1284&h=2778", media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone 14 Pro
      { url: "/splashscreen?w=1179&h=2556", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone 14 Pro Max
      { url: "/splashscreen?w=1290&h=2796", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone 15 / 15 Pro
      { url: "/splashscreen?w=1179&h=2556", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone 15 Plus / 15 Pro Max
      { url: "/splashscreen?w=1290&h=2796", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
      // iPad Mini
      { url: "/splashscreen?w=1536&h=2048", media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" },
      // iPad Air / Pro 10.5"
      { url: "/splashscreen?w=1668&h=2224", media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" },
      // iPad Pro 11"
      { url: "/splashscreen?w=1668&h=2388", media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" },
      // iPad Pro 12.9"
      { url: "/splashscreen?w=2048&h=2732", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ConvexClientProvider>
              {children}
              <Toaster position="top-right" richColors />
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
