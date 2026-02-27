import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Play } from "lucide-react";
import { DemoDisabled } from "@/components/DemoDisabled";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReviewerLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-section">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Reviewer Portal</CardTitle>
          <CardDescription>Sign in to review AI governance violations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button className="w-full gap-2" size="lg" onClick={() => navigate("/reviewer/dashboard")}>
            <Play className="h-4 w-4" />
            Enter Demo as Reviewer
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/40" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or sign in</span></div>
          </div>
          <DemoDisabled>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">Email</Label>
                <Input id="email" type="email" disabled placeholder="reviewer@hfai.com" className="bg-card border-card-foreground/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-card-foreground">Password</Label>
                <Input id="password" type="password" disabled placeholder="••••••••" className="bg-card border-card-foreground/10" />
              </div>
              <Button type="button" disabled className="w-full">Log In</Button>
            </form>
          </DemoDisabled>
        </CardContent>
      </Card>
    </div>
  );
}
