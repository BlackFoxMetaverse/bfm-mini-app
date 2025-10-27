import { motion } from "framer-motion";

function Segmented({ value, onChange, cls }: any) {
  return (
    <div
      role="tablist"
      aria-label="Leaderboard scope"
      className={`${cls.card} mx-auto mt-3 flex w-full max-w-[360px] items-center justify-between p-1`}
    >
      {[
        { id: "weekly", label: "Weekly" },
        { id: "all", label: "All Time" },
      ].map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          className={`relative h-9 flex-1 rounded-xl text-sm font-semibold transition ${
            value === t.id ? "text-white" : "text-white/70"
          }`}
          onClick={() => onChange(t.id)}
        >
          {value === t.id && (
            <motion.span
              layoutId="seg-bg"
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/40 to-fuchsia-500/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          <span className="relative z-10">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
export default Segmented;
