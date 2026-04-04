import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Trash2, Eye } from "lucide-react";
import { fetchAdminOrganizations, deleteOrganization, fetchOrgCounts } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface OrgRow {
  id: string; name: string; contact_email: string | null; api_key: string | null;
  created_at: string; userCount?: number; systemCount?: number; violationCount?: number;
}

export default function AdminCustomers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [rawOrgs, counts] = await Promise.all([fetchAdminOrganizations(), fetchOrgCounts()]);
      const enriched: OrgRow[] = rawOrgs.map((o: any) => ({
        ...o, userCount: counts[o.id]?.user_count ?? 0,
        systemCount: counts[o.id]?.system_count ?? 0, violationCount: counts[o.id]?.violation_count ?? 0,
      }));
      setOrgs(enriched);
    } catch (err: any) {
      toast({ title: t("adminCustomers.errorLoading"), description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteOrganization(id);
      toast({ title: t("adminCustomers.customerDeleted") });
      load();
    } catch (err: any) {
      toast({ title: t("adminCustomers.error"), description: err.message, variant: "destructive" });
    }
  };

  const columns: DataTableColumn<OrgRow>[] = [
    { key: "name", header: t("adminCustomers.organization"), render: (row) => (
      <Link to={`/admin/customers/${row.id}`} className="font-medium text-primary hover:underline">{row.name}</Link>
    )},
    { key: "contact_email", header: t("adminCustomers.contact"), render: (row) => <span className="text-muted-foreground">{row.contact_email || "—"}</span> },
    { key: "userCount", header: t("adminCustomers.users"), render: (row) => <Badge variant="secondary">{row.userCount ?? 0}</Badge> },
    { key: "systemCount", header: t("adminCustomers.aiSystems"), render: (row) => <Badge variant="secondary">{row.systemCount ?? 0}</Badge> },
    { key: "violationCount", header: t("adminCustomers.violations"), render: (row) => (
      <Badge variant={row.violationCount ? "destructive" : "secondary"}>{row.violationCount ?? 0}</Badge>
    )},
    { key: "created_at", header: t("adminCustomers.created"), render: (row) => (
      <span className="text-muted-foreground text-xs">{new Date(row.created_at).toLocaleDateString()}</span>
    )},
    { key: "actions", header: "", render: (row) => (
      <div className="flex items-center gap-1 justify-end">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/customers/${row.id}`)}>
          <Eye className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("adminCustomers.deleteTitle", { name: row.name })}</AlertDialogTitle>
              <AlertDialogDescription>{t("adminCustomers.deleteDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("adminCustomers.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(row.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t("adminCustomers.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )},
  ];

  return (
    <div className="space-y-section">
      <div className="flex items-center justify-between">
        <SectionHeader title={t("adminCustomers.title")} description={t("adminCustomers.description")} />
        <Button onClick={() => navigate("/admin/customers/create")} className="gap-2">
          <Plus className="h-4 w-4" /> {t("adminCustomers.addCustomer")}
        </Button>
      </div>
      <DataTable columns={columns} data={orgs} rowKey={(r) => r.id} loading={loading} emptyMessage={t("adminCustomers.noCustomers")} />
    </div>
  );
}
