// LeadsComponents/LeadAtoms.jsx
import { initials, avatarColor, STATUS_STYLES } from "./LeadsConstants";

// ─── Avatar ────────────────────────────────────────────────────────────────────

export function Avatar({ name = "", size = 36 }) {
  const bg = avatarColor(name);
  const fontSize = Math.round(size * 0.36);
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 tracking-wide shadow-sm"
      style={{ width: size, height: size, background: bg, fontSize }}
    >
      {initials(name)}
    </div>
  );
}

// ─── StatusBadge ───────────────────────────────────────────────────────────────

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.new;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${s.bg} ${s.text} ${s.ring}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full opacity-70 flex-shrink-0"
        style={{ background: "currentColor" }}
      />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}