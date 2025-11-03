import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SidebarLayout from "@/components/SidebarLayout";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { RoleSwitcher } from "@/components/testing/RoleSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediCore - Sistema de Gestión Médica",
  description: "Sistema integral de gestión médica para clínicas y hospitales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastProvider>
            <SidebarLayout>
              {children}
            </SidebarLayout>
            {/* Testing component - remove in production */}
            <RoleSwitcher />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
