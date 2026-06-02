import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 px-8 md:px-14 py-8 mt-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-gray-400 leading-relaxed max-w-md">
          © 2026 PaySmart. Prices and offers are indicative and updated periodically.
          Always verify the final price and offer applicability at checkout.
        </p>
        <nav className="flex items-center gap-6">
          <Link href="/about"   className="text-xs text-gray-400 hover:text-gray-700 transition-colors">About</Link>
          <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Privacy</Link>
          <Link href="/terms"   className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
