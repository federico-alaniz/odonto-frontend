import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reservar Turno - Sistema Odontológico",
  description: "Reserve su turno de manera rápida y sencilla",
};

export default function ReservarTurnoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
