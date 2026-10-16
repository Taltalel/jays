import { Nav } from "@/components/nav";
import { requireOwner } from "@/lib/auth";

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const { email } = await requireOwner();
  return (
    <>
      <Nav email={email} />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}
