import { useState, useEffect } from 'react';
import { Search, Heart, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMember } from '@/integrations';
import { generate } from '@/integrations/ai';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  artisan: string;
  location: string;
  category: string;
  image: string;
  tags: string[];
  description: string;
}

interface AIRecommendation {
  type: 'personalized' | 'trending' | 'similar' | 'seasonal';
  title: string;
  description: string;
  products: Product[];
}

export default function DiscoveryPage() {
  const { } = useMember();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');

  // Mock product data - in real app, this would come from API
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Handwoven Silk Scarf',
      price: 2500,
      rating: 4.8,
      artisan: 'Priya Sharma',
      location: 'Jaipur, Rajasthan',
      category: 'textiles',
      image: 'https://static.wixstatic.com/media/d7d9fb_5cfd34919f104f608e9aaec1e6bb70e4~mv2.png?originWidth=128&originHeight=128',
      tags: ['silk', 'handwoven', 'traditional'],
      description: 'Beautiful handwoven silk scarf with traditional motifs'
    },
    {
      id: '2',
      name: 'Blue Pottery Vase',
      price: 1800,
      rating: 4.6,
      artisan: 'Rajesh Kumar',
      location: 'Jaipur, Rajasthan',
      category: 'pottery',
      image: 'https://static.wixstatic.com/media/d7d9fb_e728ae46c79040c69c3029351c7d49d8~mv2.png?originWidth=128&originHeight=128',
      tags: ['pottery', 'ceramic', 'blue pottery'],
      description: 'Traditional blue pottery vase with intricate designs'
    },
    {
      id: '3',
      name: 'Silver Jewelry Set',
      price: 5500,
      rating: 4.9,
      artisan: 'Kavita Singh',
      location: 'Delhi',
      category: 'jewelry',
      image: 'https://static.wixstatic.com/media/d7d9fb_c85b094ce787472dbf494bf395bba5fc~mv2.png?originWidth=256&originHeight=192',
      tags: ['silver', 'jewelry', 'handcrafted'],
      description: 'Elegant silver jewelry set with traditional craftsmanship'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: '🛍️' },
    { id: 'textiles', name: 'Textiles', icon: '🧵' },
    { id: 'pottery', name: 'Pottery', icon: '🏺' },
    { id: 'jewelry', name: 'Jewelry', icon: '💍' },
    { id: 'woodwork', name: 'Woodwork', icon: '🪵' },
    { id: 'leather', name: 'Leather', icon: '👜' }
  ];

  const generateAIRecommendations = async () => {
    setLoading(true);
    try {
      const prompt = `
You are an AI curator for an artisan marketplace called DOTS. Generate personalized product discovery recommendations for a buyer.

Based on typical buyer preferences and current market trends, create 4 types of recommendations:

1. Personalized recommendations based on the user's potential interests
2. Trending products in the current season
3. Similar items to popular purchases
4. Seasonal or festive items

For each recommendation type, provide:
- A compelling title
- A brief description explaining why these products are recommended
- 3-4 product suggestions with realistic details

Format as JSON:
{
  "recommendations": [
    {
      "type": "personalized|trending|similar|seasonal",
      "title": "string",
      "description": "string",
      "products": [
        {
          "name": "string",
          "price": number,
          "artisan": "string",
          "category": "string",
          "description": "string",
          "tags": ["tag1", "tag2"]
        }
      ]
    }
  ]
}

Focus on authentic Indian handicrafts and traditional craftsmanship.
`;

      const response = await generate(prompt, {
        system: 'You are a product discovery expert for handmade artisan products. Create engaging, personalized recommendations that help buyers discover unique crafts.'
      });

      const parsed = JSON.parse(response);
      setAiRecommendations(parsed.recommendations || []);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to mock recommendations
      setAiRecommendations([
        {
          type: 'personalized',
          title: 'Handcrafted Treasures for You',
          description: 'Based on your interest in authentic Indian crafts, here are some unique pieces',
          products: mockProducts.slice(0, 3)
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateAIRecommendations();
  }, []);

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            Discover Artisan Crafts
          </h1>
          <p className="font-paragraph text-primary/70">
            Find unique handmade treasures from skilled artisans across India
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="search">Search & Filter</TabsTrigger>
            <TabsTrigger value="ai">AI Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Featured Categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: categories.indexOf(category) * 0.1 }}
                >
                  <Card
                    className={`border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                      selectedCategory === category.id ? 'ring-2 ring-neonaccent' : ''
                    }`}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setActiveTab('search');
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <h3 className="font-heading font-bold text-sm text-primary">
                        {category.name}
                      </h3>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Search */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search for handmade crafts, materials, or artisans..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  <Button
                    onClick={() => setActiveTab('search')}
                    className="bg-neonaccent text-primary hover:bg-neonaccent/90"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Featured Products */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-primary mb-6">Featured This Week</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={400}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="p-4">
                          <h3 className="font-heading font-bold text-primary mb-2">
                            {product.name}
                          </h3>
                          <p className="font-paragraph text-sm text-primary/70 mb-2">
                            by {product.artisan}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-heading font-bold text-lg text-primary">
                              ₹{product.price.toLocaleString()}
                            </span>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-paragraph text-sm ml-1">
                                {product.rating}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {product.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button className="w-full" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            {/* Search and Filters */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    {categories.slice(1).map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.icon} {category.name}
                      </Button>
                    ))}
                    <Button
                      variant={selectedCategory === 'all' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                    >
                      All
                    </Button>
                  </div>
                </div>

                {/* Search Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="border-0 shadow-sm">
                      <CardContent className="p-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={400}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="p-4">
                          <h3 className="font-heading font-bold text-primary mb-2">
                            {product.name}
                          </h3>
                          <p className="font-paragraph text-sm text-primary/70 mb-2">
                            by {product.artisan} • {product.location}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-heading font-bold text-lg text-primary">
                              ₹{product.price.toLocaleString()}
                            </span>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-paragraph text-sm ml-1">
                                {product.rating}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {product.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                    <h3 className="font-heading font-bold text-primary mb-2">No products found</h3>
                    <p className="font-paragraph text-primary/70">
                      Try adjusting your search terms or browse different categories
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Generating personalized recommendations...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {aiRecommendations.map((rec, index) => (
                  <motion.div
                    key={rec.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="font-heading text-xl font-bold text-primary flex items-center">
                          <Sparkles className="w-5 h-5 mr-2 text-neonaccent" />
                          {rec.title}
                        </CardTitle>
                        <p className="font-paragraph text-primary/70">{rec.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {rec.products.map((product, pIndex) => (
                            <motion.div
                              key={pIndex}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.2 + pIndex * 0.1 }}
                            >
                              <Card className="border-0 shadow-sm">
                                <CardContent className="p-4">
                                  <h4 className="font-heading font-bold text-primary mb-2">
                                    {product.name}
                                  </h4>
                                  <p className="font-paragraph text-sm text-primary/70 mb-2">
                                    by {product.artisan}
                                  </p>
                                  <p className="font-paragraph text-sm text-primary/70 mb-3">
                                    {product.description}
                                  </p>
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="font-heading font-bold text-primary">
                                      ₹{product.price.toLocaleString()}
                                    </span>
                                    <Badge variant="outline">{product.category}</Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {product.tags.map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  <Button className="w-full" variant="outline">
                                    Explore
                                  </Button>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                <div className="text-center">
                  <Button
                    onClick={generateAIRecommendations}
                    disabled={loading}
                    className="bg-neonaccent text-primary hover:bg-neonaccent/90"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Refresh AI Recommendations
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}