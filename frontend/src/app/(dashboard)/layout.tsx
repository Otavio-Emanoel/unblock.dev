export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col selection:bg-indigo-600 selection:text-white">
      {children}
    </div>
  );
}
