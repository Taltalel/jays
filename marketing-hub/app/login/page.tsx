import { buttonClass } from "@/components/ui";
import { signInWithGoogle } from "./actions";

const ERRORS: Record<string, string> = {
  not_allowed: "That Google account isn't allowed. Only the Hub owner can sign in.",
  oauth: "Google sign-in didn't complete. Try again.",
  not_configured: "The Hub isn't configured yet: Supabase env vars are missing.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-panel p-6">
        <div className="text-xs uppercase tracking-widest text-dim">Jay&apos;s Fort Lauderdale</div>
        <h1 className="mt-1 text-xl font-semibold">Tal&apos;s Marketing Hub</h1>
        <p className="mt-2 text-sm text-muted">Private. Sign in with the marketing Google account.</p>

        {error && ERRORS[error] && (
          <div className="mt-4 rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad">{ERRORS[error]}</div>
        )}

        {configured ? (
          <form action={signInWithGoogle} className="mt-6">
            <button className={`${buttonClass("primary")} w-full`}>Sign in with Google</button>
          </form>
        ) : (
          <div className="mt-6 rounded-lg border border-line bg-panel-2 px-3 py-3 text-sm text-muted">
            Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel, then
            redeploy.
          </div>
        )}
      </div>
    </main>
  );
}
