import type { Metadata } from "next";
import { Host_Grotesk, Unbounded } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  variable: "--font-host",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Premio Natura500",
  description: "Oportunidades de financiamiento y reconocimiento para innovacion regenerativa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${hostGrotesk.variable} ${unbounded.variable}`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
