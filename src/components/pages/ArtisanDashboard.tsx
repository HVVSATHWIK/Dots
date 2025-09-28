import { Link } from 'react-router-dom';
import { Package, DollarSign, ShoppingCart, Target, BarChart3, Users, TrendingUp, Award, Palette, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { useMember } from '@/integrations';
import { useEffect, useState } from 'react';
import { getDb } from '@/integrations/members/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ArtisanTutorial from '@/components/ui/ArtisanTutorial';
import Icon from '@/components/ui/icons';

export default function ArtisanDashboard() {
  const { user } = useMember();
  const { t } = useTranslation();
  const [salesData, setSalesData] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [firestoreIndexError, setFirestoreIndexError] = useState<{ message: string; url?: string } | null>(null);

  useEffect(() => {
    const loadArtisanData = async () => {
      if (!user) return;

      try {
        const db = getDb();

        // Check profile completion
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data() as any;
          setProfileComplete(!!userData.profileComplete);
          // Show onboarding for new artisans with no products
          if (!userData.profileComplete || !userData.hasCreatedProduct) {
            setShowOnboarding(true);
          }
        } else {
          setShowOnboarding(true);
        }

        // Load recent sales/orders
        const ordersRef = collection(db, 'orders');
        let orders: any[] = [];
        try {
          const q = query(
            ordersRef,
            where('sellerId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
          const ordersSnap = await getDocs(q);
          orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err: any) {
          if (err?.code === 'failed-precondition' && /index/i.test(err?.message || '')) {
            const match = (err.message || '').match(/https:\/\/console\.firebase\.google\.com\/[^\s)]+/);
            setFirestoreIndexError({
              message: 'Some dashboard queries require a Firestore composite index. Click below to create it.',
              url: match?.[0]
            });
            const qNoOrder = query(ordersRef, where('sellerId', '==', user.uid), limit(5));
            const ordersSnap = await getDocs(qNoOrder);
            orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          } else {
            throw err;
          }
        }
        setSalesData(orders);

        // Load products
        const productsRef = collection(db, 'products');
        let productsData: any[] = [];
        try {
          const productsQuery = query(
            productsRef,
            where('sellerId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(6)
          );
          const productsSnap = await getDocs(productsQuery);
          productsData = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err: any) {
          if (err?.code === 'failed-precondition' && /index/i.test(err?.message || '')) {
            if (!firestoreIndexError?.url) {
              const match = (err.message || '').match(/https:\/\/console\.firebase\.google\.com\/[^\s)]+/);
              setFirestoreIndexError({
                message: 'Some dashboard queries require a Firestore composite index. Click below to create it.',
                url: match?.[0]
              });
            }
            const productsNoOrder = query(productsRef, where('sellerId', '==', user.uid), limit(6));
            const productsSnap = await getDocs(productsNoOrder);
            productsData = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          } else {
            throw err;
          }
        }
        setProducts(productsData);

        // Calculate analytics
        const totalSales = orders.reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        const analyticsData = {
          totalSales,
          totalOrders,
          avgOrderValue,
          productsListed: productsData.length,
          topProduct: productsData.length > 0 ? (productsData[0] as any).name || 'Product' : 'No products yet'
        };
        setAnalytics(analyticsData);

      } catch (error) {
        console.error('Error loading artisan data:', error);
      }
    };

    loadArtisanData();
  }, [user]);

  useEffect(() => {
    // Check if tutorial has been completed
    const tutorialCompleted = localStorage.getItem(`tutorial_completed_artisan_${user?.uid}`);
    if (!tutorialCompleted && user && profileComplete !== false) {
      setShowTutorial(true);
    }
  }, [user, profileComplete]);

  const handleTutorialComplete = () => {
    if (user) {
      localStorage.setItem(`tutorial_completed_artisan_${user.uid}`, 'true');
    }
    setShowTutorial(false);
  };

  const artisanStats = [
    {
      label: t('artisan.products'),
      value: analytics?.productsListed?.toString() || '0',
      icon: Package,
      change: '+2 this month',
      color: 'text-purple-600'
    },
    {
      label: 'Total Sales',
      value: `₹${(analytics?.totalSales || 0).toLocaleString()}`,
      icon: DollarSign,
      change: '+₹12,300',
      color: 'text-green-600'
    },
    {
      label: 'Orders Received',
      value: analytics?.totalOrders?.toString() || '0',
      icon: ShoppingCart,
      change: '+15 this month',
      color: 'text-blue-600'
    },
    {
      label: 'Avg Order Value',
      value: `₹${Math.round(analytics?.avgOrderValue || 0).toLocaleString()}`,
      icon: Target,
      change: '+₹120',
      color: 'text-orange-600'
    }
  ];

  // If profile is not complete, show setup prompt
  if (profileComplete === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center space-y-6"
        >
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <Palette className="w-10 h-10 text-purple-600" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-primary mb-2">Complete Your Artisan Profile</h1>
            <p className="font-paragraph text-primary/70">
              Set up your artisan profile to unlock your dashboard, AI tools, and start selling your crafts.
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full bg-purple-600 text-white hover:bg-purple-700">
              <Link to="/profile/setup">
                <Award className="w-4 h-4 mr-2" />
                Complete Profile Setup
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/discover">
                Browse Marketplace
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold text-primary mb-2">
            {t('artisan.dashboard')}
          </h1>
          <p className="font-paragraph text-primary/70">
            Manage your artisan business, track sales, and grow your craft
          </p>
          <Badge className="mt-2 bg-purple-100 text-purple-800">{t('role.artisan')}</Badge>
        </motion.div>

        {firestoreIndexError && (
          <div className="mb-8 p-4 border border-yellow-200 bg-yellow-50 rounded">
            <p className="font-paragraph text-sm text-yellow-900">
              {firestoreIndexError.message}
            </p>
            {firestoreIndexError.url && (
              <a
                href={firestoreIndexError.url}
                target="_blank"
                rel="noreferrer"
                className="font-heading text-sm text-yellow-900 underline mt-2 inline-block"
              >
                Create index in Firebase Console
              </a>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {artisanStats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-paragraph text-sm text-primary/60 mb-1">
                        {stat.label}
                      </p>
                      <p className="font-heading text-2xl font-bold text-primary">
                        {stat.value}
                      </p>
                      <p className={`font-paragraph text-xs mt-1 ${stat.color}`}>
                        {stat.change}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* New Artisan Onboarding */}
        {showOnboarding && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Palette className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  Welcome to Your Artisan Journey!
                  <Icon name="sparkles" size={24} className="text-purple-600" />
                </h2>
                <p className="font-paragraph text-primary/70 mb-6 max-w-2xl mx-auto">
                  Ready to share your beautiful crafts with the world? Our AI-powered tools will help you create compelling product listings, optimize pricing, and grow your artisan business.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon name="robot" size={28} className="text-blue-600" />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-primary mb-2">AI Assistant</h3>
                    <p className="font-paragraph text-xs text-primary/60">Generate descriptions, titles, and pricing with AI</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon name="barchart" size={28} className="text-green-600" />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-primary mb-2">Smart Analytics</h3>
                    <p className="font-paragraph text-xs text-primary/60">Track sales, optimize pricing, grow your business</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon name="lock" size={28} className="text-orange-600" />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-primary mb-2">Authenticity Verified</h3>
                    <p className="font-paragraph text-xs text-primary/60">Mint certificates to prove authenticity</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="bg-purple-600 text-white hover:bg-purple-700 font-heading font-bold">
                    <Link to="/copilot">
                      <Wand2 className="w-4 h-4 mr-2" />
                      Start with AI Copilot
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                    <Link to="/profile/setup">
                      <Award className="w-4 h-4 mr-2" />
                      Complete Profile
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowOnboarding(false)}
                    className="text-primary/60"
                  >
                    Maybe later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Recent Sales */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-xl font-bold text-primary">
                    Recent Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesData.length > 0 ? salesData.map((order: any, index: number) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <Image
                          src={order.image || 'https://static.wixstatic.com/media/d7d9fb_5cfd34919f104f608e9aaec1e6bb70e4~mv2.png?originWidth=128&originHeight=128'}
                          alt={order.productName}
                          width={60}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-heading font-bold text-primary mb-1">
                            {order.productName}
                          </h3>
                          <p className="font-paragraph text-sm text-primary/60">
                            Buyer: {order.buyerName || 'Anonymous'} • {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-heading font-bold text-primary">
                            ₹{order.totalAmount?.toLocaleString() || '0'}
                          </p>
                          <Badge
                            variant={order.status === 'completed' ? 'default' : 'secondary'}
                            className={order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                          >
                            {order.status || 'Processing'}
                          </Badge>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-8">
                        <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="font-paragraph text-primary/60">No sales yet</p>
                        <p className="font-paragraph text-sm text-primary/50 mt-2">Start by listing your first product!</p>
                      </div>
                    )}
                  </div>
                  {salesData.length > 0 && (
                    <div className="mt-6 text-center">
                      <Button asChild variant="outline">
                        <Link to="/analytics">
                          View All Sales
                          <BarChart3 className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* My Products */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-xl font-bold text-primary">
                    {t('artisan.products')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.length > 0 ? products.slice(0, 4).map((product: any, index: number) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <Image
                          src={product.images?.[0] || 'https://static.wixstatic.com/media/d7d9fb_5cfd34919f104f608e9aaec1e6bb70e4~mv2.png?originWidth=128&originHeight=128'}
                          alt={product.name}
                          width={80}
                          className="w-20 h-20 object-cover rounded-lg mb-3"
                        />
                        <h4 className="font-heading font-bold text-sm text-primary mb-1 truncate">
                          {product.name}
                        </h4>
                        <p className="font-paragraph text-xs text-primary/60 mb-2">
                          ₹{product.price?.toLocaleString() || '0'}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {product.status || 'Active'}
                        </Badge>
                      </motion.div>
                    )) : (
                      <div className="col-span-2 text-center py-8">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="font-paragraph text-primary/60 mb-2">No products listed yet</p>
                        <Button asChild size="sm">
                          <Link to="/copilot">
                            <Palette className="w-4 h-4 mr-2" />
                            Create Your First Product
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                  {products.length > 4 && (
                    <div className="mt-6 text-center">
                      <Button asChild variant="outline">
                        <Link to="/sell">
                          View All Products
                          <Package className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-lg font-bold text-primary">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full justify-start bg-purple-600 text-white hover:bg-purple-700">
                    <Link to="/copilot">
                      <Palette className="w-4 h-4 mr-2" />
                      AI Listing Copilot
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/sell">
                      <Package className="w-4 h-4 mr-2" />
                      Add New Product
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/analytics">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Sales Analytics
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/pricing-optimizer">
                      <Target className="w-4 h-4 mr-2" />
                      Pricing Optimizer
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/community">
                      <Users className="w-4 h-4 mr-2" />
                      Artisan Community
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="font-heading text-lg font-bold text-primary flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white/50 rounded-lg">
                    <h4 className="font-heading font-bold text-sm text-primary mb-2">Top Performing Product</h4>
                    <p className="font-paragraph text-sm text-primary/70">
                      {analytics?.topProduct || 'No products yet'} - {analytics?.totalOrders > 0 ? 'Leading your sales' : 'Ready to shine'}
                    </p>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg">
                    <h4 className="font-heading font-bold text-sm text-primary mb-2">AI Recommendation</h4>
                    <p className="font-paragraph text-sm text-primary/70">
                      {analytics?.totalOrders > 0
                        ? 'Consider adding more nature-inspired designs - trending 23% this month'
                        : 'Start by listing 3-5 unique products to build your portfolio'
                      }
                    </p>
                  </div>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/copilot">
                      <Target className="w-4 h-4 mr-2" />
                      Get AI Insights
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Artisan Onboarding */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="font-heading text-lg font-bold text-primary flex items-center">
                    <Award className="w-5 h-5 mr-2 text-green-600" />
                    Artisan Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className={`flex items-center space-x-2 ${products.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${products.length > 0 ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      <span className="font-paragraph text-sm">List your first product</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${salesData.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${salesData.length > 0 ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      <span className="font-paragraph text-sm">Make your first sale</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${analytics?.totalSales > 10000 ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${analytics?.totalSales > 10000 ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      <span className="font-paragraph text-sm">Reach ₹10,000 in sales</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${analytics?.totalOrders > 50 ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${analytics?.totalOrders > 50 ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      <span className="font-paragraph text-sm">Complete 50 orders</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tutorial Modal */}
      <ArtisanTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />
    </div>
  );
}