import Link from "next/link";
import { auth } from "@/auth";
import { AppMark } from "@/components/brand/AppMark";
import { NavbarClient } from "@/components/layout/NavbarClient";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg">
          <AppMark />
        </Link>
        <NavbarClient session={session} />
      </div>
    </header>
  );
}
