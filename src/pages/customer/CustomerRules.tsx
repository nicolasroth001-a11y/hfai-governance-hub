import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { RuleCard } from "@/components/RuleCard";
import { fetchRules } from "@/lib/api";

export default function CustomerRules() {
  const { t } = useTranslation();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules().then((data) => { setRules(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <SectionHeader title={t("customerRules.title")} description={t("customerRules.description")} />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("customerRules.loading")}</p>
      ) : rules.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("customerRules.noRules")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((r) => (
            <RuleCard
              key={r.id}
              id={r.id}
              name={r.name}
              description={r.description}
              category={r.category}
              severity_default={r.severity_default || r.severity || "medium"}
              violations_count={r.violations_count ?? 0}
              basePath="/customer/rules"
            />
          ))}
        </div>
      )}
    </div>
  );
}
