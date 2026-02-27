import { createContext, useContext, ReactNode } from "react";

interface DemoModeContextValue {
  isDemo: true;
  identities: {
    admin: { name: string; email: string };
    reviewer: { name: string; email: string };
    customer: { name: string; email: string };
  };
  disabledMessage: string;
}

const demoValue: DemoModeContextValue = {
  isDemo: true,
  identities: {
    admin: { name: "Demo Admin", email: "admin@hfai.demo" },
    reviewer: { name: "Demo Reviewer", email: "reviewer@hfai.demo" },
    customer: { name: "Demo Customer", email: "customer@acme.demo" },
  },
  disabledMessage: "Not available in Demo Mode.",
};

const DemoModeContext = createContext<DemoModeContextValue>(demoValue);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  return (
    <DemoModeContext.Provider value={demoValue}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}
