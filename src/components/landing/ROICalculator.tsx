import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, AlertTriangle, ArrowRight, Calendar, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";

const CALENDLY_URL = "mailto:nicolasroth@hfa-i.org?subject=HFAI%20Demo%20Requesthttps://calendly.com/nicolasroth001/hfai-demobody=Hi%20Nicolas%2C%0A%0AI%27d%20like%20to%20book%20a%20demo%20of%20HFAI.%0A%0AName%3A%0ACompany%3A%0ARole%3A%0APreferred%20time%3A%0A";

export function ROICalculator() {
  const navigate = useNavigate();
  const [aiSystems, setAiSystems] = useState(5);
  const [employees, setEmployees] = useState(200);
  const [highRisk, setHighRisk] = useState(2);

  // EU AI Act fine: up to €35M or 7% of global turnover
  // Conservative estimate: avg fine ~€2M for mid-size, scales with systems
  const estimatedRevenue = employees * 150_000; // rough avg revenue per employee
  const maxFine = Math.max(35_000_000, estimatedRevenue * 0.07);
  const likelyFine = Math.min(maxFine, highRisk * 2_000_000 + aiSystems * 500_000);
  
  // Internal compliance team cost
  const internalCost = 280_000 + (aiSystems * 15_000); // 2 FTEs + per-system overhead
  
  // HFAI cost (Pro tier as baseline)
  const hfaiCost = aiSystems <= 3 ? 0 : aiSystems <= 10 ? 99 * 12 : aiSystems <= 25 ? 349 * 12 : 499 * 12;
  
  const savings = internalCost - hfaiCost;
  const riskReduction = Math.min(95, 60 + highRisk * 5);

  const formatCurrency = (n: number) => {
    if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `€${(n / 1_000).toFixed(0)}K`;
    return `€${n.toFixed(0)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-4xl"
    >
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase tracking-[0.2em] text-destructive font-semibold">
          Cost of Inaction
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-2">
          What Non-Compliance Actually Costs You
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
          EU AI Act fines reach up to €35M or 7% of global turnover. Calculate your exposure.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card className="border border-border/40 bg-secondary/10">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" /> Your AI Footprint
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">AI Systems in Production</span>
                <span className="font-semibold text-foreground">{aiSystems}</span>
              </div>
              <Slider
                value={[aiSystems]}
                onValueChange={([v]) => setAiSystems(v)}
                min={1} max={50} step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Company Size (employees)</span>
                <span className="font-semibold text-foreground">{employees.toLocaleString()}</span>
              </div>
              <Slider
                value={[employees]}
                onValueChange={([v]) => setEmployees(v)}
                min={10} max={10000} step={10}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">High-Risk AI Systems</span>
                <span className="font-semibold text-foreground">{highRisk}</span>
              </div>
              <Slider
                value={[highRisk]}
                onValueChange={([v]) => setHighRisk(v)}
                min={0} max={aiSystems} step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="border border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Your Risk Exposure
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-[10px] uppercase tracking-wider text-destructive/80 font-semibold">Maximum Fine Exposure</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(likelyFine)}</p>
                <p className="text-[11px] text-muted-foreground">Per violation under EU AI Act</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Internal Compliance Team</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(internalCost)}<span className="text-xs text-muted-foreground font-normal">/year</span></p>
                <p className="text-[11px] text-muted-foreground">2 FTEs + per-system overhead</p>
              </div>

              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">HFAI Platform Cost</p>
                <p className="text-lg font-bold text-primary">
                  {hfaiCost === 0 ? "Free" : formatCurrency(hfaiCost)}<span className="text-xs text-muted-foreground font-normal">/year</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingDown className="h-3 w-3 text-primary" />
                  <span className="text-[11px] text-primary font-medium">
                    Save {formatCurrency(savings)}/yr · {riskReduction}% risk reduction
                  </span>
                </div>
              </div>
            </div>

            <Button className="w-full gap-2 text-sm" onClick={() => window.open(CALENDLY_URL, "_blank", "noopener,noreferrer")}>
              <Calendar className="h-4 w-4" /> Book a Demo — See Your ROI <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
