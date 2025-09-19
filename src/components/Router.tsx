import { MemberProvider } from '@/integrations';
import { Routes, Route, Navigate, BrowserRouter, useNavigate } from 'react-router-dom';
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
import BuyerDashboard from '@/components/pages/BuyerDashboard';
import ArtisanDashboard from '@/components/pages/ArtisanDashboard';
import ProfileSetupPage from '@/components/pages/ProfileSetupPage';
import RoleSelectPage from '@/components/pages/RoleSelectPage';
import AnalyticsPage from '@/components/pages/AnalyticsPage';
import PricingOptimizerPage from '@/components/pages/PricingOptimizerPage';
import { useMember } from '@/integrations';
import { useEffect } from 'react';
import '@/i18n/config'; // Initialize i18n

// Component to redirect users to role-specific dashboards
function DashboardRedirect() {
  const { member } = useMember();
  const navigate = useNavigate();

  useEffect(() => {
    if (member?.role === 'buyer') {
      navigate('/buyer/dashboard', { replace: true });
    } else if (member?.role === 'artisan') {
      navigate('/artisan/dashboard', { replace: true });
    } else {
      // If no role is set, redirect to role selection
      navigate('/choose-role', { replace: true });
    }
  }, [member, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="font-paragraph text-primary/70">Loading your dashboard...</p>
      </div>
    </div>
  );
}

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
              <Route path='/discovery' element={<Navigate to='/discover' replace />} />
              <Route path='/product/:id' element={<ProductDetailPage />} />
              <Route path='/themes' element={<ThemesPage />} />
              <Route path='/themes/:category' element={<ThemesPage />} />
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
                  <DashboardRedirect />
                </MemberProtectedRoute>
              } />
              <Route path='/buyer/dashboard' element={
                <MemberProtectedRoute messageToSignIn='Sign in to access your dashboard'>
                  <RoleGuard allow={['buyer']} fallback='/dashboard'>
                    <BuyerDashboard />
                  </RoleGuard>
                </MemberProtectedRoute>
              } />
              <Route path='/artisan/dashboard' element={
                <MemberProtectedRoute messageToSignIn='Sign in to access your dashboard'>
                  <RoleGuard allow={['artisan']} fallback='/dashboard'>
                    <ArtisanDashboard />
                  </RoleGuard>
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
