import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { ArrowLeft } from "lucide-react";

export default function AdminRuleDetail() {
  const { t } = useTranslation();
  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/admin/rules" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("adminRuleDetail.backToRules")}
        </Link>
        <SectionHeader title={t("adminRuleDetail.title")} description={t("adminRuleDetail.description")} />
      </div>
      <p className="text-sm text-card-foreground/50">{t("adminRuleDetail.noRoute")}</p>
    </div>
  );
}
