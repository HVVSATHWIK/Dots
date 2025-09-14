import { useState } from 'react';
import { TrendingUp, Target, Calculator, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMember } from '@/integrations';
import { generate } from '@/integrations/ai';
import { motion } from 'framer-motion';

interface PricingRecommendation {
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  reasoning: string;
  marketPosition: 'budget' | 'mid-range' | 'premium';
  competitors: string[];
  strategy: string;
}

export default function PricingOptimizerPage() {
  const { } = useMember();
  const [productDetails, setProductDetails] = useState({
    name: '',
    category: '',
    materials: '',
    craftsmanship: '',
    targetMarket: '',
    currentPrice: '',
    description: ''
  });
  const [recommendation, setRecommendation] = useState<PricingRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('input');

  const handleInputChange = (field: string, value: string) => {
    setProductDetails(prev => ({ ...prev, [field]: value }));
  };

  const generatePricing = async () => {
    if (!productDetails.name || !productDetails.category) {
      alert('Please fill in at least product name and category');
      return;
    }

    setLoading(true);
    try {
      const prompt = `
You are a pricing expert for handmade artisan products. Analyze this product and provide optimal pricing strategy:

Product Details:
- Name: ${productDetails.name}
- Category: ${productDetails.category}
- Materials: ${productDetails.materials || 'Not specified'}
- Craftsmanship: ${productDetails.craftsmanship || 'Not specified'}
- Target Market: ${productDetails.targetMarket || 'General consumers'}
- Current Price: ${productDetails.currentPrice || 'Not set'}
- Description: ${productDetails.description || 'No description provided'}

Provide a JSON response with:
{
  "suggestedPrice": number,
  "priceRange": {"min": number, "max": number},
  "reasoning": "detailed explanation",
  "marketPosition": "budget|mid-range|premium",
  "competitors": ["competitor1", "competitor2", "competitor3"],
  "strategy": "pricing strategy recommendation"
}

Consider factors like:
- Material costs and quality
- Artisan skill level and time investment
- Market demand and competition
- Perceived value and uniqueness
- Target customer demographics
- Current market trends for handmade items
`;

      const response = await generate(prompt, {
        system: 'You are a pricing strategist specializing in handmade artisan products. Provide realistic, profitable pricing recommendations based on Indian market conditions.'
      });

      // Parse the JSON response
      const parsed = JSON.parse(response);
      setRecommendation(parsed);
      setActiveTab('results');
    } catch (error) {
      console.error('Error generating pricing:', error);
      alert('Failed to generate pricing recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            AI Pricing Optimizer
          </h1>
          <p className="font-paragraph text-primary/70">
            Get data-driven pricing recommendations for your handmade products
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Product Details</TabsTrigger>
            <TabsTrigger value="results" disabled={!recommendation}>Pricing Results</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Information */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-xl font-bold text-primary">
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Handwoven Cotton Scarf"
                      value={productDetails.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Textiles, Pottery, Jewelry"
                      value={productDetails.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="materials">Materials Used</Label>
                    <Input
                      id="materials"
                      placeholder="e.g., Organic cotton, natural dyes"
                      value={productDetails.materials}
                      onChange={(e) => handleInputChange('materials', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="craftsmanship">Craftsmanship Level</Label>
                    <Input
                      id="craftsmanship"
                      placeholder="e.g., Handwoven, traditional techniques, 20 hours work"
                      value={productDetails.craftsmanship}
                      onChange={(e) => handleInputChange('craftsmanship', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentPrice">Current Price (₹)</Label>
                    <Input
                      id="currentPrice"
                      type="number"
                      placeholder="Leave blank if not set"
                      value={productDetails.currentPrice}
                      onChange={(e) => handleInputChange('currentPrice', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Market & Strategy */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-xl font-bold text-primary">
                    Market & Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="targetMarket">Target Market</Label>
                    <Input
                      id="targetMarket"
                      placeholder="e.g., Young professionals, tourists, gift buyers"
                      value={productDetails.targetMarket}
                      onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Product Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your product's unique features, story, and appeal..."
                      rows={4}
                      value={productDetails.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={generatePricing}
                      disabled={loading || !productDetails.name || !productDetails.category}
                      className="w-full bg-neonaccent text-primary hover:bg-neonaccent/90"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          Analyzing Market Data...
                        </>
                      ) : (
                        <>
                          <Calculator className="w-4 h-4 mr-2" />
                          Generate Pricing Strategy
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tips */}
            <Card className="border-0 shadow-sm bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-heading font-bold text-blue-900 mb-2">Tips for Better Pricing</h3>
                    <ul className="font-paragraph text-sm text-blue-800 space-y-1">
                      <li>• Be specific about materials and craftsmanship time</li>
                      <li>• Mention unique features or traditional techniques</li>
                      <li>• Consider your target customer's budget range</li>
                      <li>• Factor in shipping costs and platform fees</li>
                      <li>• Research similar products on other marketplaces</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {recommendation && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pricing Recommendation */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-heading text-xl font-bold text-primary">
                      AI Pricing Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center p-6 bg-gradient-to-r from-neonaccent/20 to-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-2">
                        ₹{recommendation.suggestedPrice.toLocaleString()}
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          recommendation.marketPosition === 'premium' ? 'bg-purple-100 text-purple-800' :
                          recommendation.marketPosition === 'mid-range' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        {recommendation.marketPosition} positioning
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-heading font-bold text-primary mb-2">Recommended Range</h4>
                      <div className="flex items-center justify-between text-sm">
                        <span>₹{recommendation.priceRange.min.toLocaleString()}</span>
                        <span className="font-bold text-primary">₹{recommendation.suggestedPrice.toLocaleString()}</span>
                        <span>₹{recommendation.priceRange.max.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-neonaccent h-2 rounded-full"
                          style={{
                            width: `${((recommendation.suggestedPrice - recommendation.priceRange.min) /
                              (recommendation.priceRange.max - recommendation.priceRange.min)) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-heading font-bold text-primary mb-2">Strategy</h4>
                      <p className="font-paragraph text-sm text-primary/70">
                        {recommendation.strategy}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis & Insights */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-heading text-xl font-bold text-primary">
                      Market Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-heading font-bold text-primary mb-2">Reasoning</h4>
                      <p className="font-paragraph text-sm text-primary/70">
                        {recommendation.reasoning}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-heading font-bold text-primary mb-2">Market Position</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Budget</span>
                          <span className="text-sm">Premium</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              recommendation.marketPosition === 'premium' ? 'bg-purple-500' :
                              recommendation.marketPosition === 'mid-range' ? 'bg-blue-500' :
                              'bg-green-500'
                            }`}
                            style={{
                              width: recommendation.marketPosition === 'premium' ? '80%' :
                                     recommendation.marketPosition === 'mid-range' ? '50%' : '20%'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-heading font-bold text-primary mb-2">Similar Products</h4>
                      <div className="space-y-2">
                        {recommendation.competitors.map((competitor, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{competitor}</span>
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => setActiveTab('input')}
                variant="outline"
                className="flex-1"
              >
                Adjust Product Details
              </Button>
              <Button
                onClick={generatePricing}
                disabled={loading}
                className="flex-1 bg-neonaccent text-primary hover:bg-neonaccent/90"
              >
                <Target className="w-4 h-4 mr-2" />
                Regenerate Analysis
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}