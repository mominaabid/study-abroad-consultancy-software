// LeadsComponents/LeadsConstants.jsx
// ─── Stage Pipeline ────────────────────────────────────────────────────────────

export const STAGES = [
  { key: "new",        label: "New",        color: "#3b82f6" },
  { key: "contacted",  label: "Contacted",  color: "#f59e0b" },
  { key: "counseling", label: "Counseling", color: "#8b5cf6" },
  { key: "evaluated",  label: "Evaluated",  color: "#f97316" },
  { key: "applied",    label: "Applied",    color: "#06b6d4" },
  { key: "visa",       label: "Visa",       color: "#ec4899" },
  { key: "success",    label: "Success",    color: "#10b981" },
  { key: "lost",       label: "Lost",       color: "#6b7280" },
];

export const STATUS_STYLES = {
  new:        { bg: "bg-blue-50",    text: "text-blue-700",    ring: "ring-blue-200"    },
  contacted:  { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200"   },
  counseling: { bg: "bg-violet-50",  text: "text-violet-700",  ring: "ring-violet-200"  },
  evaluated:  { bg: "bg-orange-50",  text: "text-orange-700",  ring: "ring-orange-200"  },
  applied:    { bg: "bg-cyan-50",    text: "text-cyan-700",    ring: "ring-cyan-200"    },
  visa:       { bg: "bg-pink-50",    text: "text-pink-700",    ring: "ring-pink-200"    },
  success:    { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
  lost:       { bg: "bg-gray-100",   text: "text-gray-600",    ring: "ring-gray-200"    },
};

export const COUNTRIES = [
  "All Countries","UK","USA","Canada","Australia","Germany",
  "France","Japan","UAE","China","India","Brazil","Mexico",
];

export const SOURCES = [
  "website","walkin","whatsapp","email","facebook",
  "referral","google_ads","linkedin","agent",
];

export const STUDY_LEVELS = ["Bachelor","Master","PhD","Diploma","Short Course"];

export const EMPTY_FORM = {
  name: "", email: "", phone: "",
  source: "website", preferred_country: "",
  study_level: "", counsellor_id: null,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function avatarColor(name = "") {
  const colors = [
    "#0d9488","#7c3aed","#db2777","#ea580c",
    "#2563eb","#16a34a","#dc2626","#9333ea",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}