export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-baseline gap-0 ${className}`}>
      <span className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">Зем</span>
      <span className="text-3xl font-black text-green-600 leading-none">+</span>
    </div>
  );
}

export function LogoWhite({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-baseline gap-0 ${className}`}>
      <span className="text-2xl font-extrabold text-white tracking-tight leading-none">Зем</span>
      <span className="text-3xl font-black text-green-300 leading-none">+</span>
    </div>
  );
}
