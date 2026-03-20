import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SpaceIn — Premium Commercial Real Estate in Noida",
    template: "%s | SpaceIn",
  },
  description:
    "Discover premium commercial spaces in Noida. Office spaces, coworking hubs, retail outlets, warehouses, and showrooms — handpicked, verified, and ready for your business.",
  keywords: [
    "commercial real estate",
    "Noida",
    "office space",
    "coworking",
    "retail space",
    "warehouse",
    "commercial property",
  ],
  openGraph: {
    title: "SpaceIn — Premium Commercial Real Estate in Noida",
    description:
      "Discover premium commercial spaces in Noida. Handpicked, verified, and ready.",
    type: "website",
    locale: "en_IN",
    siteName: "SpaceIn",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                fontSize: "0.9rem",
              },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "var(--bg-secondary)",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "var(--bg-secondary)",
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
