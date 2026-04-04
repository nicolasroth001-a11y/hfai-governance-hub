import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Users, Bot, AlertTriangle, Plug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { deleteOrganization } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminCustomerDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const [orgRes, usersRes, systemsRes, violationsRes] = await Promise.all([
        supabase.from("organizations").select("*").eq("id", id).single(),
        supabase.from("profiles").select("*").eq("org_id", id).order("created_at", { ascending: false }),
        supabase.from("ai_systems").select("*").eq("org_id", id).order("created_at", { ascending: false }),
        supabase.from("violations").select("*").eq("org_id", id).order("created_at", { ascending: false }),
      ]);
      setOrg(orgRes.data);
      setUsers(usersRes.data ?? []);
      setSystems(systemsRes.data ?? []);
      setViolations(violationsRes.data ?? []);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteOrganization(id);
      toast({ title: t("adminCustomerDetail.customerDeleted") });
      navigate("/admin/customers");
    } catch (err: any) {
      toast({ title: t("adminCustomerDetail.error"), description: err.message, variant: "destructive" });
    }
  };

  const userColumns: DataTableColumn<any>[] = [
    { key: "name", header: t("adminCustomerDetail.name"), render: (r) => <span className="font-medium">{r.name || "—"}</span> },
    { key: "email", header: t("adminCustomerDetail.email"), render: (r) => <span className="text-muted-foreground">{r.email}</span> },
    { key: "role", header: t("adminCustomerDetail.role"), render: (r) => <Badge variant="outline">{r.role}</Badge> },
    { key: "created_at", header: t("adminCustomerDetail.joined"), render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span> },
  ];

  const systemColumns: DataTableColumn<any>[] = [
    { key: "name", header: t("adminCustomerDetail.system"), render: (r) => (
      <Link to={`/admin/violations?system=${r.id}`} className="font-medium text-primary hover:underline">{r.name}</Link>
    )},
    { key: "provider", header: t("adminCustomerDetail.providerCol"), render: (r) => <span className="text-muted-foreground">{r.provider || "—"}</span> },
    { key: "risk_level", header: t("adminCustomerDetail.risk"), render: (r) => (
      <Badge variant={r.risk_level === "high" ? "destructive" : r.risk_level === "medium" ? "default" : "secondary"}>
        {r.risk_level || "—"}
      </Badge>
    )},
    { key: "status", header: t("adminCustomerDetail.status"), render: (r) => <Badge variant="outline">{r.status || "active"}</Badge> },
  ];

  const violationColumns: DataTableColumn<any>[] = [
    { key: "id", header: t("adminCustomerDetail.violation"), render: (r) => (
      <Link to={`/admin/violations/${r.id}`} className="font-medium text-primary hover:underline">{r.id.slice(0, 8)}…</Link>
    )},
    { key: "severity", header: t("adminCustomerDetail.severity"), render: (r) => (
      <Badge variant={r.severity === "critical" || r.severity === "high" ? "destructive" : "secondary"}>{r.severity}</Badge>
    )},
    { key: "status", header: t("adminCustomerDetail.status"), render: (r) => <Badge variant="outline">{r.status}</Badge> },
    { key: "created_at", header: t("adminCustomerDetail.date"), render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span> },
  ];

  if (loading) {
    return (
      <div className="space-y-section">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-40 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="space-y-section">
        <Link to="/admin/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("adminCustomerDetail.backToCustomers")}
        </Link>
        <SectionHeader title={t("adminCustomerDetail.notFound")} description={t("adminCustomerDetail.notFoundDesc")} />
      </div>
    );
  }

  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/admin/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("adminCustomerDetail.backToCustomers")}
        </Link>
        <div className="flex items-center justify-between">
          <SectionHeader title={org.name} description={org.contact_email || t("adminCustomerDetail.noContact")} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">{t("adminCustomerDetail.deleteCustomer")}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("adminCustomerDetail.deleteTitle", { name: org.name })}</AlertDialogTitle>
                <AlertDialogDescription>{t("adminCustomerDetail.deleteDescription")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("adminCustomerDetail.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t("adminCustomerDetail.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ContentCard icon={Users} title={t("adminCustomerDetail.users")}>
          <p className="text-2xl font-bold">{users.length}</p>
        </ContentCard>
        <ContentCard icon={Bot} title={t("adminCustomerDetail.aiSystems")}>
          <p className="text-2xl font-bold">{systems.length}</p>
        </ContentCard>
        <ContentCard icon={AlertTriangle} title={t("adminCustomerDetail.violations")}>
          <p className="text-2xl font-bold">{violations.length}</p>
        </ContentCard>
        <ContentCard icon={Plug} title={t("adminCustomerDetail.provider")}>
          <p className="text-sm font-medium text-card-foreground">OpenAI Proxy</p>
        </ContentCard>
      </div>

      <ContentCard icon={Users} title={`${t("adminCustomerDetail.users")} (${users.length})`}>
        <DataTable columns={userColumns} data={users} rowKey={(r) => r.id} emptyMessage={t("adminCustomerDetail.noUsers")} pageSize={5} />
      </ContentCard>

      <ContentCard icon={Bot} title={`${t("adminCustomerDetail.aiSystems")} (${systems.length})`}>
        <DataTable columns={systemColumns} data={systems} rowKey={(r) => r.id} emptyMessage={t("adminCustomerDetail.noSystems")} pageSize={5} />
      </ContentCard>

      <ContentCard icon={AlertTriangle} title={`${t("adminCustomerDetail.violations")} (${violations.length})`}>
        <DataTable columns={violationColumns} data={violations} rowKey={(r) => r.id} emptyMessage={t("adminCustomerDetail.noViolations")} pageSize={5} />
      </ContentCard>
    </div>
  );
}
