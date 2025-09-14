import { MemberProvider } from '@/integrations';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';
import { ToastProvider } from '@/components/ui/toast-provider';
import Layout from '@/components/Layout';
import HomePage from '@/components/pages/HomePage';
import DiscoverPage from '@/components/pages/DiscoverPage';
import DiscoveryPage from '@/components/pages/DiscoveryPage';
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
import RoleSelectPage from '@/components/pages/RoleSelectPage';
import AnalyticsPage from '@/components/pages/AnalyticsPage';
import PricingOptimizerPage from '@/components/pages/PricingOptimizerPage';

export default function AppRouter() {
  return (
    <ToastProvider>
      <MemberProvider>
        <BrowserRouter basename={import.meta.env.VITE_BASE_NAME ?? '/'}>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path='/discover' element={<DiscoverPage />} />
              <Route path='/discovery' element={<DiscoveryPage />} />
              <Route path='/product/:id' element={<ProductDetailPage />} />
              <Route path='/themes' element={<ThemesPage />} />
              <Route path='/custom-requests' element={<CustomRequestsPage />} />
              <Route path='/community' element={<CommunityPage />} />
              <Route path='/about' element={<AboutPage />} />
              <Route path='/contact' element={<ContactPage />} />
              <Route path='/cart' element={<CartPage />} />
              <Route path='/wishlist' element={<CartPage />} />

              <Route
                path='/sell'
                element={
                  <RoleGuard allow={['artisan']} fallback='/dashboard'>
                    <SellerPage />
                  </RoleGuard>
                }
              />
              <Route
                path='/copilot'
                element={
                  <RoleGuard allow={['artisan']} fallback='/dashboard'>
                    <CopilotPage />
                  </RoleGuard>
                }
              />
              <Route
                path='/analytics'
                element={
                  <RoleGuard allow={['artisan']} fallback='/dashboard'>
                    <AnalyticsPage />
                  </RoleGuard>
                }
              />
              <Route
                path='/pricing-optimizer'
                element={
                  <RoleGuard allow={['artisan']} fallback='/dashboard'>
                    <PricingOptimizerPage />
                  </RoleGuard>
                }
              />

              <Route path='/login' element={<LoginPage />} />
              <Route path='/signup' element={<SignupPage />} />
              <Route path='/choose-role' element={<RoleSelectPage />} />

              <Route path='/dashboard' element={
                <MemberProtectedRoute messageToSignIn='Sign in to access your dashboard'>
                  <DashboardPage />
                </MemberProtectedRoute>
              } />
              <Route path='/profile/setup' element={
                <MemberProtectedRoute messageToSignIn='Sign in to complete your profile'>
                  <ProfileSetupPage />
                </MemberProtectedRoute>
              } />
              <Route path='/profile' element={
                <MemberProtectedRoute messageToSignIn='Sign in to access your profile'>
                  <ProfilePage />
                </MemberProtectedRoute>
              } />

              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </MemberProvider>
    </ToastProvider>
  );
}
