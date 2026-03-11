import { motion } from "framer-motion";

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<200ms", label: "Detection Speed" },
  { value: "100%", label: "Audit Coverage" },
  { value: "24/7", label: "Human Review" },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="text-center"
        >
          <div className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">{stat.value}</div>
          <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
