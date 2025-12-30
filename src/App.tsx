import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import GameDetail from "./pages/GameDetail";
import GamesList from "./pages/GamesList";
import Announcements from "./pages/Announcements";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGames from "./pages/admin/AdminGames";
import AdminTags from "./pages/admin/AdminTags";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminPopups from "./pages/admin/AdminPopups";
import AdminWidgets from "./pages/admin/AdminWidgets";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import NotFound from "./pages/NotFound";
import PopupModal from "./components/popup/PopupModal";
import FloatingWidgets from "./components/floating/FloatingWidgets";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PopupModal />
          <FloatingWidgets />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/games" element={<GamesList />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/announcement/:id" element={<AnnouncementDetail />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="games" element={<AdminGames />} />
              <Route path="tags" element={<AdminTags />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="popups" element={<AdminPopups />} />
              <Route path="widgets" element={<AdminWidgets />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
