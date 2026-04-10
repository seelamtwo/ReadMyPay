import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[min(100%,1600px)] px-4 py-8 sm:px-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
