
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import TokenMarketplace from "./pages/TokenMarketplace";
import CommunityDetail from "./pages/CommunityDetail";
import Gallery from "./pages/Gallery";
import Governance from "./pages/Governance";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Metaverse from "./pages/Metaverse";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/token-marketplace" element={<TokenMarketplace />} />
          <Route path="/community/:id" element={<CommunityDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/events" element={<Events />} />
          <Route path="/metaverse" element={<Metaverse />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
