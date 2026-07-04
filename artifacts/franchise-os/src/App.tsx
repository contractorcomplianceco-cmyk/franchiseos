import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Locations from "@/pages/locations";
import LocationDetail from "@/pages/location-detail";
import Compliance from "@/pages/compliance";
import Tasks from "@/pages/tasks";
import Expansion from "@/pages/expansion";
import Documents from "@/pages/documents";
import Assistant from "@/pages/assistant";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/locations" component={Locations} />
        <Route path="/locations/:id" component={LocationDetail} />
        <Route path="/compliance" component={Compliance} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/expansion" component={Expansion} />
        <Route path="/documents" component={Documents} />
        <Route path="/assistant" component={Assistant} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
