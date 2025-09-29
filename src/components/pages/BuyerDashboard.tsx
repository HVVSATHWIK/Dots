import { Link } from 'react-router-dom';
import { Package, Heart, ShoppingCart, Star, Calendar, ArrowRight, Award, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { useMember } from '@/integrations';
import { useEffect, useState } from 'react';
import { getDb } from '@/integrations/members/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/icons';
import { useTranslation } from 'react-i18next';
import BuyerTutorial from '@/components/ui/BuyerTutorial';

export default function BuyerDashboard() {
  const { user } = useMember();
  const { t } = useTranslation();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [firestoreIndexError, setFirestoreIndexError] = useState<{ message: string; url?: string } | null>(null);

  useEffect(() => {
    const loadBuyerData = async () => {
      if (!user) return;

      try {
        const db = getDb();

        // Load recent orders
        const ordersRef = collection(db, 'orders');
        let orders: any[] = [];
        try {
          const q = query(
            ordersRef,
            where('buyerId', '==', user.uid),
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
            // Fallback without orderBy
            const qNoOrder = query(ordersRef, where('buyerId', '==', user.uid), limit(5));
            const ordersSnap = await getDocs(qNoOrder);
            orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          } else {
            throw err;
          }
        }
        setRecentOrders(orders);

        // Calculate stats
        const totalSpent = orders.reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);
        const statsData = {
          ordersPlaced: orders.length,
          totalSpent,
          wishlistItems: 8, // This would come from wishlist collection
          reviewsGiven: 9 // This would come from reviews collection
        };
        setStats(statsData);
        
        // Show onboarding for new buyers with no orders
        if (orders.length === 0) {
          setShowOnboarding(true);
        }

        // Load personalized recommendations (this would be from AI/ML service)
        setRecommendations([
          {
            id: 1,
            name: 'Warli Art Canvas',
            artist: 'Deepak Tribal',
            price: 2200,
            rating: 4.7,
            image: 'https://static.wixstatic.com/media/d7d9fb_c4f7592c8deb4549bf6418c8b27ca31d~mv2.png?originWidth=256&originHeight=192',
            category: 'Traditional Art'
          },
          {
            id: 2,
            name: 'Silver Jewelry Set',
            artist: 'Kavita Singh',
            price: 5500,
            rating: 4.9,
            image: 'https://static.wixstatic.com/media/d7d9fb_c85b094ce787472dbf494bf395bba5fc~mv2.png?originWidth=256&originHeight=192',
            category: 'Jewelry'
          },
          {
            id: 3,
            name: 'Wooden Elephant Figurine',
            artist: 'Suresh Reddy',
            price: 1500,
            rating: 4.5,
            image: 'https://static.wixstatic.com/media/d7d9fb_d4adc63553bc4e7da26ae94e177fe87e~mv2.png?originWidth=256&originHeight=192',
            category: 'Woodwork'
          }
        ]);

      } catch (error) {
        console.error('Error loading buyer data:', error);
      }
    };

    loadBuyerData();
  }, [user]);

  useEffect(() => {
    // Check if tutorial has been completed
    const tutorialCompleted = localStorage.getItem(`tutorial_completed_buyer_${user?.uid}`);
    if (!tutorialCompleted && user) {
      setShowTutorial(true);
    }
  }, [user]);

  const handleTutorialComplete = () => {
    if (user) {
      localStorage.setItem(`tutorial_completed_buyer_${user.uid}`, 'true');
    }
    setShowTutorial(false);
  };

  const buyerStats = [
    {
      label: t('buyer.orders'),
      value: stats?.ordersPlaced?.toString() || '0',
      icon: Package,
      change: '+2 this month',
      color: 'text-blue-600'
    },
    {
      label: t('buyer.wishlist'),
      value: stats?.wishlistItems?.toString() || '0',
      icon: Heart,
      change: '3 new items',
      color: 'text-red-600'
    },
    {
      label: 'Total Spent',
      value: `₹${(stats?.totalSpent || 0).toLocaleString()}`,
      icon: ShoppingCart,
      change: '+₹8,200',
      color: 'text-green-600'
    },
    {
      label: 'Reviews Given',
      value: stats?.reviewsGiven?.toString() || '0',
      icon: Star,
      change: '4.8 avg rating',
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold text-primary mb-2">
            {t('buyer.dashboard')}
          </h1>
          <p className="font-paragraph text-primary/70">
            Discover authentic handmade crafts and manage your collection
          </p>
          <Badge className="mt-2 bg-blue-100 text-blue-800">{t('role.buyer')}</Badge>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {buyerStats.map((stat) => {
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
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* New Buyer Onboarding */}
        {showOnboarding && recentOrders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  Welcome to DOTS Marketplace!
                  <Icon name="sparkles" size={24} className="text-blue-600" />
                </h2>
                <p className="font-paragraph text-primary/70 mb-6 max-w-2xl mx-auto">
                  Discover authentic handcrafted treasures made by talented artisans across India. Each piece tells a story and supports traditional craftsmen.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon name="palette" size={28} className="text-green-600" />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-primary mb-2">Authentic Crafts</h3>
                    <p className="font-paragraph text-xs text-primary/60">Each product is verified authentic with AI-powered certificates</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon name="target" size={28} className="text-orange-600" />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-primary mb-2">Support Artisans</h3>
                    <p className="font-paragraph text-xs text-primary/60">Buy directly from makers and support traditional crafts</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon name="gem" size={28} className="text-purple-600" />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-primary mb-2">Unique Collection</h3>
                    <p className="font-paragraph text-xs text-primary/60">Find one-of-a-kind pieces you won't see anywhere else</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="bg-blue-600 text-white hover:bg-blue-700 font-heading font-bold">
                    <Link to="/discover">
                      <Package className="w-4 h-4 mr-2" />
                      Explore Marketplace
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    <Link to="/discover?category=trending">
                      <Star className="w-4 h-4 mr-2" />
                      See What's Trending
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-xl font-bold text-primary">
                    {t('buyer.orders')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.length > 0 ? recentOrders.map((order: any, index: number) => (
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
                            by {order.artistName} • {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-heading font-bold text-primary">
                            ₹{order.totalAmount?.toLocaleString() || '0'}
                          </p>
                          <Badge
                            variant={order.status === 'delivered' ? 'default' : 'secondary'}
                            className={order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                          >
                            {order.status || 'Processing'}
                          </Badge>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="font-paragraph text-primary/60">{t('messages.noData')}</p>
                        <Button asChild className="mt-4">
                          <Link to="/discover">{t('buyer.discover')}</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                  {recentOrders.length > 0 && (
                    <div className="mt-6 text-center">
                      <Button asChild variant="outline">
                        <Link to="/profile">
                          {t('actions.view')} All {t('buyer.orders')}
                          <ArrowRight className="w-4 h-4 ml-2" />
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
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-lg font-bold text-primary">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full justify-start bg-blue-600 text-white hover:bg-blue-700">
                    <Link to="/discover">
                      <Package className="w-4 h-4 mr-2" />
                      {t('buyer.discover')}
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/custom-requests">
                      <Calendar className="w-4 h-4 mr-2" />
                      Custom Request
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/wishlist">
                      <Heart className="w-4 h-4 mr-2" />
                      {t('buyer.wishlist')}
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/themes">
                      <MapPin className="w-4 h-4 mr-2" />
                      Browse by Themes
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Personalized Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-lg font-bold text-primary">
                    {t('buyer.recommendations')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <Link
                        to={`/product/${item.id}`}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading font-bold text-sm text-primary truncate">
                            {item.name}
                          </h4>
                          <p className="font-paragraph text-xs text-primary/60">
                            by {item.artist}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-heading font-bold text-sm text-primary">
                              ₹{item.price.toLocaleString()}
                            </span>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-paragraph text-xs text-primary ml-1">
                                {item.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Onboarding Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="font-heading text-lg font-bold text-primary flex items-center">
                    <Award className="w-5 h-5 mr-2 text-blue-600" />
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="font-paragraph text-sm text-primary/80">Explore different art categories</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="font-paragraph text-sm text-primary/80">Save items to your wishlist</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="font-paragraph text-sm text-primary/80">Request custom artwork</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="font-paragraph text-sm text-primary/80">Complete your first purchase!</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tutorial Modal */}
      <BuyerTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />
    </div>
  );
}