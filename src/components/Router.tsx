import { MemberProvider } from '@/integrations';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';
import Layout from '@/components/Layout';
import HomePage from '@/components/pages/HomePage';
import DiscoverPage from '@/components/pages/DiscoverPage';
import ProductDetailPage from '@/components/pages/ProductDetailPage';
import ThemesPage from '@/components/pages/ThemesPage';
import CustomRequestsPage from '@/components/pages/CustomRequestsPage';
import CommunityPage from '@/components/pages/CommunityPage';
import AboutPage from '@/components/pages/AboutPage';
import ContactPage from '@/components/pages/ContactPage';
import CartPage from '@/components/pages/CartPage';
import ProfilePage from '@/components/pages/ProfilePage';
import SellerPage from '@/components/pages/SellerPage';
import CopilotPage from '@/components/pages/CopilotPage';
import { RoleGuard } from '@/components/ui/role-guard';
import LoginPage from '@/components/pages/LoginPage';
import SignupPage from '@/components/pages/SignupPage';
import DashboardPage from '@/components/pages/DashboardPage';
import ProfileSetupPage from '@/components/pages/ProfileSetupPage';

export default function AppRouter() {
  return (
    <MemberProvider>
  <BrowserRouter basename={import.meta.env.VITE_BASE_NAME ?? '/'}>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/themes" element={<ThemesPage />} />
            <Route path="/custom-requests" element={<CustomRequestsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<CartPage />} />
            <Route path="/sell" element={<SellerPage />} />
            <Route
              path="/copilot"
              element={
                <RoleGuard allow={["artisan"]} fallback="/sell">
                  <CopilotPage />
                </RoleGuard>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile/setup" element={
              <MemberProtectedRoute messageToSignIn="Sign in to complete your profile">
                <ProfileSetupPage />
              </MemberProtectedRoute>
            } />
            <Route path="/profile" element={
              <MemberProtectedRoute messageToSignIn="Sign in to access your profile">
                <ProfilePage />
              </MemberProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </MemberProvider>
  );
}
