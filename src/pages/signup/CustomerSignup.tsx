import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function CustomerSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ company_name: "", email: "", password: "", confirm_password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: POST /auth/signup/customer
    fetch("http://localhost:4000/auth/signup/customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => {});
    navigate("/login/customer");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Create Your Account</CardTitle>
          <CardDescription>Start governing your AI systems with HFAI</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input placeholder="Acme Corp" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="admin@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input type="password" placeholder="••••••••" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full">Create Account</Button>
            <p className="text-center text-xs text-card-foreground/50">
              Already have an account?{" "}
              <Link to="/login/customer" className="text-primary hover:underline">Log in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
