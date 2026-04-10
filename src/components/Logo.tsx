export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 44 40" className="w-10 h-9" fill="none">
        <path d="M22 2L2 18h6v20h28V18h6L22 2z" fill="#16a34a" />
        <rect x="14" y="22" width="16" height="4" rx="2" fill="white" />
        <rect x="20" y="16" width="4" height="16" rx="2" fill="white" />
      </svg>
      <span className="text-xl font-extrabold text-gray-900 tracking-tight">
        ЗемПлюс
      </span>
    </div>
  );
}

export function LogoWhite({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 44 40" className="w-10 h-9" fill="none">
        <path d="M22 2L2 18h6v20h28V18h6L22 2z" fill="#22c55e" />
        <rect x="14" y="22" width="16" height="4" rx="2" fill="white" />
        <rect x="20" y="16" width="4" height="16" rx="2" fill="white" />
      </svg>
      <span className="text-xl font-extrabold text-white tracking-tight">
        ЗемПлюс
      </span>
    </div>
  );
}
