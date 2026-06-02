'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, CreditCard } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

// ── Auth button + sheet ────────────────────────────────────────────

export function UserButton() {
  const { user, authLoading, signIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (authLoading) return <div className="w-8 h-8" />;

  const handleSignIn = async () => {
    setBusy(true);
    try { await signIn(); setOpen(false); }
    catch {}
    finally { setBusy(false); }
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center"
        aria-label={user ? 'Account' : 'Sign in'}
      >
        {user ? (
          user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full ring-2 ring-blue-100" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
              {user.displayName?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )
        ) : (
          <span className="text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1 hover:border-blue-300 hover:text-blue-600 transition-colors">
            Sign in
          </span>
        )}
      </button>

      {/* Bottom sheet */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-white w-full max-w-md rounded-t-2xl p-6 pb-10 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {user ? (
              /* ── Signed-in state ── */
              <>
                <div className="flex items-center gap-3 mb-5">
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold">
                      {user.displayName?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{user.displayName}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-xs text-green-700">Card list syncing across your devices</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full border border-gray-200 text-sm text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              /* ── Signed-out state ── */
              <>
                <div className="text-center mb-6">
                  <div className="text-lg font-semibold text-gray-900 mb-1">Sign in to PaySmart</div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Sync your card list across devices. No account number or payment details needed.
                  </p>
                </div>
                <button
                  onClick={handleSignIn}
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <GoogleIcon />
                  {busy ? 'Signing in…' : 'Continue with Google'}
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-3">
                  We only store which cards you have. No card numbers, no personal data.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ── Nav components ─────────────────────────────────────────────────

export function BottomNav() {
  const path = usePathname();
  const items = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/profile', label: 'Cards', icon: CreditCard },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex z-10">
      {items.map(({ href, label, icon: Icon }) => {
        const active = path === href || (href !== '/' && path.startsWith(href));
        return (
          <Link key={href} href={href} className="flex-1 flex flex-col items-center py-2 gap-0.5">
            <Icon size={20} className={active ? 'text-blue-600' : 'text-gray-400'} />
            <span className={`text-[10px] ${active ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function TopNav({ title, back }: { title?: string; back?: string }) {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
      <div className="flex items-center gap-3">
        {back && (
          <Link href={back} className="text-gray-500 -ml-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
          </Link>
        )}
        <div>
          <div className="text-base font-semibold text-blue-700 tracking-tight">
            {title ?? 'PaySmart'}
          </div>
          {!title && <div className="text-[10px] text-gray-400">effective price finder</div>}
        </div>
      </div>
      <UserButton />
    </header>
  );
}
