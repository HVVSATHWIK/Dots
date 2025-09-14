import { Link } from 'react-router-dom';
import { Package, Heart, ShoppingCart, Star, Calendar, ArrowRight, BarChart3, Users, DollarSign, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { useMember } from '@/integrations';
import { useEffect, useState } from 'react';
import { getDb } from '@/integrations/members/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { member, user } = useMember();
  const role = member?.role || 'buyer';
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      if (!user) {
        setProfileComplete(null);
        return;
      }
      try {
        const db = getDb();
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfileComplete(!!(snap.data() as any).profileComplete);
        } else {
          setProfileComplete(false);
        }

        // Load role-specific data
        if (role === 'artisan') {
          await loadArtisanData(user.uid);
        }
      } catch {
        setProfileComplete(false);
      }
    };
    run();
  }, [user?.uid, role]);

  const loadArtisanData = async (userId: string) => {
    try {
      const db = getDb();
      // Get recent sales/orders for this artisan
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('sellerId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const ordersSnap = await getDocs(q);
      const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSalesData(orders);

      // Calculate analytics
      const analyticsData = {
        totalSales: orders.reduce((sum, order: any) => sum + (order.totalAmount || order.amount || 0), 0),
        totalOrders: orders.length,
        avgOrderValue: orders.length > 0 ? orders.reduce((sum, order: any) => sum + (order.totalAmount || order.amount || 0), 0) / orders.length : 0,
        topProduct: 'Handwoven Basket' // This would come from actual data
      };
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading artisan data:', error);
    }
  };

  // Sample data for buyers
  const recentOrders = [
    {
      id: 'ORD-2024-001',
      name: 'Handpainted Madhubani Art',
      artist: 'Priya Sharma',
      price: 2500,
      status: 'Delivered',
      image: 'https://static.wixstatic.com/media/d7d9fb_5cfd34919f104f608e9aaec1e6bb70e4~mv2.png?originWidth=128&originHeight=128',
      date: '2024-01-20'
    },
    {
      id: 'ORD-2024-002',
      name: 'Brass Ganesha Sculpture',
      artist: 'Rajesh Kumar',
      price: 4200,
      status: 'In Transit',
      image: 'https://static.wixstatic.com/media/d7d9fb_e728ae46c79040c69c3029351c7d49d8~mv2.png?originWidth=128&originHeight=128',
      date: '2024-01-18'
    }
  ];

  const recommendations = [
    {
      id: 1,
      name: 'Warli Art Canvas',
      artist: 'Deepak Tribal',
      price: 2200,
      rating: 4.7,
      image: 'https://static.wixstatic.com/media/d7d9fb_c4f7592c8deb4549bf6418c8b27ca31d~mv2.png?originWidth=256&originHeight=192'
    },
    {
      id: 2,
      name: 'Silver Jewelry Set',
      artist: 'Kavita Singh',
      price: 5500,
      rating: 4.9,
      image: 'https://static.wixstatic.com/media/d7d9fb_c85b094ce787472dbf494bf395bba5fc~mv2.png?originWidth=256&originHeight=192'
    },
    {
      id: 3,
      name: 'Wooden Elephant Figurine',
      artist: 'Suresh Reddy',
      price: 1500,
      rating: 4.5,
      image: 'https://static.wixstatic.com/media/d7d9fb_d4adc63553bc4e7da26ae94e177fe87e~mv2.png?originWidth=256&originHeight=192'
    }
  ];

  const buyerStats = [
    { label: 'Orders Placed', value: '12', icon: Package, change: '+2 this month' },
    { label: 'Wishlist Items', value: '8', icon: Heart, change: '3 new items' },
    { label: 'Total Spent', value: '₹24,500', icon: ShoppingCart, change: '+₹8,200' },
    { label: 'Reviews Given', value: '9', icon: Star, change: '4.8 avg rating' }
  ];

  const artisanStats = [
    { label: 'Products Listed', value: '23', icon: Package, change: '+5 this month' },
    { label: 'Total Sales', value: analytics?.totalSales ? `₹${analytics.totalSales.toLocaleString()}` : '₹45,200', icon: DollarSign, change: '+₹12,300' },
    { label: 'Orders Received', value: analytics?.totalOrders?.toString() || '67', icon: ShoppingCart, change: '+15 this month' },
    { label: 'Avg Order Value', value: analytics?.avgOrderValue ? `₹${Math.round(analytics.avgOrderValue).toLocaleString()}` : '₹673', icon: Target, change: '+₹120' }
  ];

  const stats = role === 'buyer' ? buyerStats : artisanStats;

  if (role === 'artisan' && profileComplete === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="font-heading text-2xl font-bold text-primary">Finish Your Profile</h1>
          <p className="font-paragraph text-primary/70">Complete your artisan profile to unlock your dashboard and AI Copilot tools.</p>
          <a href="/profile/setup" className="inline-block bg-neonaccent text-primary px-4 py-2 rounded-md font-heading font-bold hover:bg-neonaccent/90">Go to Profile Setup</a>
        </div>
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
            Welcome back, {member?.profile?.nickname || member?.contact?.firstName || 'User'}!
          </h1>
          <p className="font-paragraph text-primary/70">
            {role === 'buyer'
              ? "Discover authentic handmade crafts and manage your orders"
              : "Manage your artisan business and track your success"
            }
          </p>
          {role === 'artisan' && (
            <Badge className="mt-2 bg-neonaccent text-primary">Artisan Dashboard</Badge>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat) => {
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
                      <p className="font-paragraph text-xs text-green-600 mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-neonaccent/20 rounded-full flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

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
                    {role === 'buyer' ? 'Recent Orders' : 'Recent Sales'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(role === 'buyer' ? recentOrders : salesData).map((item: any, index: number) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <Image
                          src={item.image || 'https://static.wixstatic.com/media/d7d9fb_5cfd34919f104f608e9aaec1e6bb70e4~mv2.png?originWidth=128&originHeight=128'}
                          alt={item.name || item.productName}
                          width={60}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-heading font-bold text-primary mb-1">
                            {item.name || item.productName}
                          </h3>
                          <p className="font-paragraph text-sm text-primary/60">
                            {role === 'buyer'
                              ? `by ${item.artist} • ${new Date(item.date).toLocaleDateString()}`
                              : `Buyer: ${item.buyerName || 'Anonymous'} • ${item.createdAt ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Recent'}`
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-heading font-bold text-primary">
                            ₹{(item.price || item.totalAmount || 0).toLocaleString()}
                          </p>
                          <Badge
                            variant={item.status === 'Delivered' || item.status === 'completed' ? 'default' : 'secondary'}
                            className={item.status === 'Delivered' || item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                          >
                            {item.status || 'Processing'}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Button asChild variant="outline">
                      <Link to={role === 'buyer' ? '/profile' : '/analytics'}>
                        View All {role === 'buyer' ? 'Orders' : 'Sales'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
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
                  {role === 'buyer' ? (
                    <>
                      <Button asChild className="w-full justify-start" variant="outline">
                        <Link to="/discover">
                          <Package className="w-4 h-4 mr-2" />
                          Browse Artworks
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
                          View Wishlist
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild className="w-full justify-start bg-neonaccent text-primary hover:bg-neonaccent/90">
                        <Link to="/copilot">
                          <Package className="w-4 h-4 mr-2" />
                          AI Listing Copilot
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
                          <DollarSign className="w-4 h-4 mr-2" />
                          Pricing Optimizer
                        </Link>
                      </Button>
                      <Button asChild className="w-full justify-start" variant="outline">
                        <Link to="/community">
                          <Users className="w-4 h-4 mr-2" />
                          Artisan Community
                        </Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Role-specific content */}
            {role === 'buyer' ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-heading text-lg font-bold text-primary">
                      Recommended for You
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
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-heading text-lg font-bold text-primary">
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-neonaccent/10 rounded-lg">
                      <h4 className="font-heading font-bold text-sm text-primary mb-2">Top Performing Product</h4>
                      <p className="font-paragraph text-sm text-primary/70">
                        {analytics?.topProduct || 'Handwoven Basket'} - 45% of your sales
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-heading font-bold text-sm text-primary mb-2">AI Recommendation</h4>
                      <p className="font-paragraph text-sm text-primary/70">
                        Consider adding more nature-inspired designs - trending 23% this month
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}