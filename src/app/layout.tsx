import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SidebarLayout from "@/components/SidebarLayout";
import { ToastProvider } from "@/components/ui/ToastProvider";
import Providers from "./providers";
import { AuthProvider } from "@/hooks/useAuth";
import { ConsultationProvider } from "@/contexts/ConsultationContext";
// import { RoleSwitcher } from "@/components/testing/RoleSwitcher"; // Desactivado - usar roles reales del login

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
        <Providers>
          <AuthProvider>
            <ConsultationProvider>
              <ToastProvider>
                <SidebarLayout>
                  {children}
                </SidebarLayout>
                {/* Testing component - desactivado para usar roles reales del login */}
                {/* <RoleSwitcher /> */}
              </ToastProvider>
            </ConsultationProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
