import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import CreateContent from "@/pages/create-content";
import Schedule from "@/pages/schedule";
import Analytics from "@/pages/analytics";
import ContentLibrary from "@/pages/content-library";
import Team from "@/pages/team";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/create" component={CreateContent} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/library" component={ContentLibrary} />
          <Route path="/team" component={Team} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
