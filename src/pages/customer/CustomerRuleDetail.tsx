import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { ArrowLeft } from "lucide-react";

export default function CustomerRuleDetail() {
  const { t } = useTranslation();
  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/customer/rules" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("customerRuleDetail.backToRules")}
        </Link>
        <SectionHeader title={t("customerRuleDetail.title")} description={t("customerRuleDetail.description")} />
      </div>
      <p className="text-sm text-card-foreground/50">{t("customerRuleDetail.noBackend")}</p>
    </div>
  );
}
