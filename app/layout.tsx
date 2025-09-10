import ConvexClientProvider from "@/components/ConvexClientProvider";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Heritage Cooperative App",
  description: "Cooperative savings with PiggyVest-like experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang='en' suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
            <ConvexClientProvider>
              <Header />
              {children}
              <Toaster position='top-right' />
              <footer className='mt-16 border-t text-sm text-muted-foreground'>
                <div className='mx-auto max-w-6xl px-4 py-6 sm:py-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
                  <div>
                    © {new Date().getFullYear()} Heritage Cooperative Society
                  </div>
                  <div className='flex gap-4'>
                    <a className='hover:underline' href='/about'>
                      About
                    </a>
                    <a className='hover:underline' href='/faqs'>
                      FAQs
                    </a>
                    <a className='hover:underline' href='/contact'>
                      Contact
                    </a>
                  </div>
                </div>
              </footer>
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
