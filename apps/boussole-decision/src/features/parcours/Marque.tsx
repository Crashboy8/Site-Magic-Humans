/** Emblème de « Où j'en suis ? » : un chemin pointillé, deux étapes et le drapeau d'arrivée. */
export function MarqueParcours({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="#FFF5D9" />
      <path d="M6.5 30 C 11 23, 16 31, 21.5 24 S 29 15, 31 13" fill="none" stroke="#3A2F24" strokeWidth="1.7" strokeLinecap="round" strokeDasharray="0.4 3.4" />
      <circle cx="7" cy="29.5" r="2.8" fill="#D4532C" />
      <circle cx="21.5" cy="24" r="2.8" fill="#1F9E8C" />
      <path d="M31 5.5v11" stroke="#3A2F24" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M31.4 6.2h6.4l-2 2.8 2 2.8h-6.4z" fill="#E0A526" />
    </svg>
  );
}
