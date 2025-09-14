import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Target, Calendar, Download, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMember } from '@/integrations';
import { getDb } from '@/integrations/members/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const { user } = useMember();
  const [analytics, setAnalytics] = useState<any>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      const db = getDb();

      // Get all orders for this artisan
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('sellerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const ordersSnap = await getDocs(q);
      const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate analytics
      const totalSales = orders.reduce((sum, order: any) => sum + (order.totalAmount || order.amount || 0), 0);
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Group by month for trends
      const monthlyData = orders.reduce((acc: any, order: any) => {
        const date = order.createdAt?.toDate?.() || order.date?.toDate?.() || new Date(order.createdAt || order.date);
        if (date) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          acc[monthKey] = (acc[monthKey] || 0) + (order.totalAmount || order.amount || 0);
        }
        return acc;
      }, {});

      // Top products analysis
      const productSales = orders.reduce((acc: any, order: any) => {
        const productName = order.productName || order.product?.name || order.name || 'Unknown Product';
        acc[productName] = (acc[productName] || 0) + (order.totalAmount || order.amount || 0);
        return acc;
      }, {});

      const topProducts = Object.entries(productSales)
        .sort(([,a]: any, [,b]: any) => b - a)
        .slice(0, 5);

      setAnalytics({
        totalSales,
        totalOrders,
        avgOrderValue,
        monthlyData,
        topProducts,
        growth: calculateGrowth(monthlyData)
      });

      setSalesData(orders.slice(0, 10)); // Show last 10 orders
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowth = (monthlyData: any) => {
    const months = Object.keys(monthlyData).sort();
    if (months.length < 2) return 0;

    const current = monthlyData[months[months.length - 1]] || 0;
    const previous = monthlyData[months[months.length - 2]] || 0;

    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold text-primary mb-2">
            Sales Analytics
          </h1>
          <p className="font-paragraph text-primary/70">
            Track your performance and get AI-powered insights
          </p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-paragraph text-sm text-primary/60 mb-1">Total Sales</p>
                  <p className="font-heading text-2xl font-bold text-primary">
                    ₹{analytics?.totalSales?.toLocaleString() || '0'}
                  </p>
                  <p className="font-paragraph text-xs text-green-600 mt-1">
                    +{analytics?.growth || 0}% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-paragraph text-sm text-primary/60 mb-1">Total Orders</p>
                  <p className="font-heading text-2xl font-bold text-primary">
                    {analytics?.totalOrders || 0}
                  </p>
                  <p className="font-paragraph text-xs text-blue-600 mt-1">
                    Avg ₹{Math.round(analytics?.avgOrderValue || 0)} per order
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-paragraph text-sm text-primary/60 mb-1">Avg Order Value</p>
                  <p className="font-heading text-2xl font-bold text-primary">
                    ₹{Math.round(analytics?.avgOrderValue || 0)}
                  </p>
                  <p className="font-paragraph text-xs text-purple-600 mt-1">
                    Industry avg: ₹850
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-paragraph text-sm text-primary/60 mb-1">Growth Rate</p>
                  <p className="font-heading text-2xl font-bold text-primary">
                    {analytics?.growth || 0}%
                  </p>
                  <p className="font-paragraph text-xs text-orange-600 mt-1">
                    Monthly growth
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Sales */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-xl font-bold text-primary">
                    Recent Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesData.slice(0, 5).map((sale: any, index: number) => (
                      <motion.div
                        key={sale.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-100"
                      >
                        <div>
                          <h3 className="font-heading font-bold text-primary mb-1">
                            {sale.productName || 'Product'}
                          </h3>
                          <p className="font-paragraph text-sm text-primary/60">
                            {sale.buyerName || 'Anonymous'} • {sale.createdAt ? new Date(sale.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-heading font-bold text-primary">
                            ₹{sale.totalAmount?.toLocaleString() || '0'}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {sale.status || 'Completed'}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-xl font-bold text-primary">
                    Monthly Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics?.monthlyData || {}).slice(-6).map(([month, amount]: [string, any]) => (
                      <div key={month} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-primary/60" />
                          <span className="font-paragraph text-sm text-primary">
                            {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <span className="font-heading font-bold text-primary">
                          ₹{amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-xl font-bold text-primary">
                  Top Performing Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topProducts?.map(([product, sales]: [string, number], index: number) => (
                    <motion.div
                      key={product}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-neonaccent/20 rounded-full flex items-center justify-center">
                          <span className="font-heading font-bold text-sm text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-primary">
                            {product}
                          </h3>
                          <p className="font-paragraph text-sm text-primary/60">
                            {((sales / (analytics?.totalSales || 1)) * 100).toFixed(1)}% of total sales
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-heading font-bold text-primary">
                          ₹{sales.toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-lg font-bold text-primary">
                    AI Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-heading font-bold text-sm text-primary mb-2">💡 Pricing Strategy</h4>
                    <p className="font-paragraph text-sm text-primary/70">
                      Your average order value of ₹{Math.round(analytics?.avgOrderValue || 0)} is
                      {analytics?.avgOrderValue > 850 ? ' above' : ' below'} the market average.
                      Consider {analytics?.avgOrderValue > 850 ? 'maintaining' : 'gradually increasing'} prices for premium positioning.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-heading font-bold text-sm text-primary mb-2">📈 Growth Opportunities</h4>
                    <p className="font-paragraph text-sm text-primary/70">
                      Your {analytics?.growth || 0}% monthly growth rate is
                      {parseFloat(analytics?.growth || 0) > 10 ? ' excellent' : ' good'}.
                      Focus on your top product "{analytics?.topProducts?.[0]?.[0] || 'best seller'}" to drive further growth.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-lg font-bold text-primary">
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-heading font-bold text-sm text-primary mb-2">🎯 Next Steps</h4>
                    <ul className="font-paragraph text-sm text-primary/70 space-y-1">
                      <li>• Use AI Copilot to create listings for similar products</li>
                      <li>• Focus on photography improvements for better conversion</li>
                      <li>• Consider bundling complementary products</li>
                      <li>• Engage more with the artisan community</li>
                    </ul>
                  </div>

                  <Button className="w-full bg-neonaccent text-primary hover:bg-neonaccent/90">
                    <Target className="w-4 h-4 mr-2" />
                    Get Personalized AI Strategy
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-xl font-bold text-primary">
                  Export Your Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="w-6 h-6 mb-2" />
                    <span className="font-paragraph text-sm">Sales Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="w-6 h-6 mb-2" />
                    <span className="font-paragraph text-sm">Analytics PDF</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Share2 className="w-6 h-6 mb-2" />
                    <span className="font-paragraph text-sm">Share Dashboard</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}