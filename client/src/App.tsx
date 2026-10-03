import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { Route, Switch } from "wouter";

function Router() {
  return <Switch><Route component={Home} /></Switch>;
}

export default function App() {
  return <ErrorBoundary>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider><Toaster/><Router/></TooltipProvider>
    </ThemeProvider>
  </ErrorBoundary>;
}
