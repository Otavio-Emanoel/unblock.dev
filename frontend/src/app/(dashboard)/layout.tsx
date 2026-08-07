import Link from "next/link";
import { Header } from "@/components/shared/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col">
      <Header />
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        <nav className="flex items-center gap-4 text-sm font-medium border-b border-white/10 pb-4">
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300">
            Visão Geral
          </Link>
          <Link href="/request" className="text-slate-400 hover:text-white">
            Pedir SOS Bug-Fix
          </Link>
          <Link href="/wallet" className="text-slate-400 hover:text-white">
            Carteira & Saldo
          </Link>
        </nav>
        {children}
      </div>
    </div>
  );
}
