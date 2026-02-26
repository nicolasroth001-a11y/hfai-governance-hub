import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Building2, UserCheck, Settings } from "lucide-react";

const portals = [
  { title: "Customer Portal", description: "View violations, rules, and AI governance data", icon: Building2, url: "/login/customer" },
  { title: "Reviewer Portal", description: "Review and approve AI governance violations", icon: UserCheck, url: "/login/reviewer" },
  { title: "Admin Portal", description: "Full system management and configuration", icon: Settings, url: "/login/admin" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
      <div className="text-center mb-12">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/90 flex items-center justify-center mb-5">
          <Shield className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-page text-foreground">HFAI</h1>
        <p className="text-body text-muted-foreground mt-2">Human‑First AI Governance Platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        {portals.map((portal) => (
          <Link key={portal.url} to={portal.url} className="group">
            <Card className="h-full hover:shadow-card-hover transition-all duration-200 group-hover:-translate-y-0.5">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <portal.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-body font-semibold">{portal.title}</CardTitle>
                <CardDescription>{portal.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-2 text-caption text-muted-foreground">
        <p>
          New customer? <Link to="/signup/customer" className="text-primary hover:underline font-medium">Create an account</Link>
        </p>
        <p>
          <Link to="/pricing/contact" className="text-primary hover:underline font-medium">Contact for Pricing</Link>
        </p>
      </div>
    </div>
  );
}
