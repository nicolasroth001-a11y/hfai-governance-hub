import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Building2, UserCheck, Settings } from "lucide-react";

const portals = [
  { title: "Customer Portal", description: "View violations, rules, and AI governance data", icon: Building2, url: "/login/customer", color: "bg-info" },
  { title: "Reviewer Portal", description: "Review and approve AI governance violations", icon: UserCheck, url: "/login/reviewer", color: "bg-success" },
  { title: "Admin Portal", description: "Full system management and configuration", icon: Settings, url: "/login/admin", color: "bg-primary" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-section">
      <div className="text-center mb-10">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-6">
          <Shield className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">HFAI</h1>
        <p className="text-muted-foreground mt-2">Human‑First AI Governance Platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-base max-w-3xl w-full">
        {portals.map((portal) => (
          <Link key={portal.url} to={portal.url} className="group">
            <Card className="h-full transition-shadow hover:shadow-card-hover">
              <CardHeader className="text-center">
                <div className={`mx-auto h-10 w-10 rounded-xl ${portal.color} flex items-center justify-center mb-2`}>
                  <portal.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-base">{portal.title}</CardTitle>
                <CardDescription className="text-xs">{portal.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        New customer? <Link to="/signup/customer" className="text-primary hover:underline font-medium">Create an account</Link>
      </p>
    </div>
  );
}
