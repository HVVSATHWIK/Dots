import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/icons';

export default function ThemesPage() {
  const [activeTheme, setActiveTheme] = useState('wedding');

  // Theme collections data
  const themeCollections = {
    wedding: {
      title: "Wedding Collection",
      description: "Celebrate your special day with exquisite handcrafted pieces that capture the essence of Indian wedding traditions",
      hero: "https://static.wixstatic.com/media/d7d9fb_ca9d417bbfc946e183279c98c6746033~mv2.png?originWidth=1920&originHeight=1024",
      color: "from-red-500 to-pink-500",
      products: [
        {
          id: 1,
          name: "Bridal Mehndi Art Canvas",
          artist: "Sunita Devi",
          price: 4500,
          originalPrice: 5500,
          rating: 4.9,
          reviews: 87,
          image: "https://static.wixstatic.com/media/d7d9fb_79a3f98be16e49f09e5f34d1787dbfc6~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Bridal", "Traditional"]
        },
        {
          id: 2,
          name: "Gold Plated Kalash Set",
          artist: "Rajesh Kumar",
          price: 8200,
          originalPrice: 10000,
          rating: 4.8,
          reviews: 124,
          image: "https://static.wixstatic.com/media/d7d9fb_27116e04ca184689898071ed320d9dcb~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Ceremonial", "Gold"]
        },
        {
          id: 3,
          name: "Wedding Mandala Wall Art",
          artist: "Priya Sharma",
          price: 3200,
          originalPrice: 4000,
          rating: 4.7,
          reviews: 156,
          image: "https://static.wixstatic.com/media/d7d9fb_235ef1c8ccdd4a3991ca8825c27622c7~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Mandala", "Decorative"]
        },
        {
          id: 4,
          name: "Silk Embroidered Torans",
          artist: "Meera Devi",
          price: 2800,
          originalPrice: 3500,
          rating: 4.6,
          reviews: 98,
          image: "https://static.wixstatic.com/media/d7d9fb_8ee1f66788a44ad39783b57ae3bf0741~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Silk", "Embroidery"]
        }
      ]
    },
    festival: {
      title: "Festival Collection",
      description: "Bring the joy and colors of Indian festivals into your home with these vibrant handcrafted pieces",
      hero: "https://static.wixstatic.com/media/d7d9fb_22833435fbe34972bdb98d037c2dbd3e~mv2.png?originWidth=1920&originHeight=1024",
      color: "from-orange-500 to-yellow-500",
      products: [
        {
          id: 5,
          name: "Diwali Diya Collection",
          artist: "Amit Patel",
          price: 1800,
          originalPrice: 2200,
          rating: 4.8,
          reviews: 203,
          image: "https://static.wixstatic.com/media/d7d9fb_ea9b6f716de34f22884b59b920740cf3~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Diwali", "Clay"]
        },
        {
          id: 6,
          name: "Holi Color Powder Bowls",
          artist: "Kavita Singh",
          price: 2400,
          originalPrice: 3000,
          rating: 4.7,
          reviews: 145,
          image: "https://static.wixstatic.com/media/d7d9fb_38976cdd23214260b8162cdf42670ee4~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Holi", "Colorful"]
        },
        {
          id: 7,
          name: "Ganesh Chaturthi Idol",
          artist: "Deepak Tribal",
          price: 3500,
          originalPrice: 4200,
          rating: 4.9,
          reviews: 178,
          image: "https://static.wixstatic.com/media/d7d9fb_6da1e82469934cfb897017b6350736d1~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Ganesh", "Eco-friendly"]
        },
        {
          id: 8,
          name: "Navratri Garba Accessories",
          artist: "Ravi Reddy",
          price: 2200,
          originalPrice: 2800,
          rating: 4.6,
          reviews: 89,
          image: "https://static.wixstatic.com/media/d7d9fb_fcc3c8379bf442ff923360422e39a5ad~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Navratri", "Dance"]
        }
      ]
    },
    home: {
      title: "Home Décor Collection",
      description: "Transform your living space with authentic Indian crafts that blend tradition with contemporary style",
      hero: "https://static.wixstatic.com/media/d7d9fb_d838c60940de49ccbea8733073729244~mv2.png?originWidth=1920&originHeight=1024",
      color: "from-green-500 to-teal-500",
      products: [
        {
          id: 9,
          name: "Warli Art Wall Hanging",
          artist: "Maya Tribal",
          price: 2800,
          originalPrice: 3400,
          rating: 4.8,
          reviews: 167,
          image: "https://static.wixstatic.com/media/d7d9fb_a252aa7a948b46c6b4243cff0059d330~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Tribal", "Wall Art"]
        },
        {
          id: 10,
          name: "Brass Decorative Bowls",
          artist: "Suresh Reddy",
          price: 3200,
          originalPrice: 4000,
          rating: 4.7,
          reviews: 134,
          image: "https://static.wixstatic.com/media/d7d9fb_d9ea5ab9529f44e09f43866aef653800~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Brass", "Functional"]
        },
        {
          id: 11,
          name: "Handwoven Table Runner",
          artist: "Lakshmi Devi",
          price: 1600,
          originalPrice: 2000,
          rating: 4.6,
          reviews: 92,
          image: "https://static.wixstatic.com/media/d7d9fb_515a35f1c73747e982312c6e857c089d~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Handwoven", "Table Decor"]
        },
        {
          id: 12,
          name: "Ceramic Planter Set",
          artist: "Anita Gupta",
          price: 2400,
          originalPrice: 3000,
          rating: 4.9,
          reviews: 156,
          image: "https://static.wixstatic.com/media/d7d9fb_4c50168abbca4b608a8ac5d199ec4067~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Ceramic", "Garden"]
        }
      ]
    },
    spiritual: {
      title: "Spiritual Collection",
      description: "Create a sacred space with divine art pieces that inspire peace, devotion, and spiritual connection",
      hero: "https://static.wixstatic.com/media/d7d9fb_ae1d196d955243b49e7f585bf4e4532e~mv2.png?originWidth=1920&originHeight=1024",
      color: "from-purple-500 to-indigo-500",
      products: [
        {
          id: 13,
          name: "Buddha Meditation Statue",
          artist: "Dharma Singh",
          price: 5200,
          originalPrice: 6500,
          rating: 4.9,
          reviews: 234,
          image: "https://static.wixstatic.com/media/d7d9fb_3b86be1391f746a093ff78ded0b98a08~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Buddha", "Meditation"]
        },
        {
          id: 14,
          name: "Om Symbol Wall Art",
          artist: "Guru Prasad",
          price: 2800,
          originalPrice: 3500,
          rating: 4.8,
          reviews: 189,
          image: "https://static.wixstatic.com/media/d7d9fb_495b9999349047208334911019f45943~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Om", "Sacred"]
        },
        {
          id: 15,
          name: "Lotus Incense Holder",
          artist: "Sita Devi",
          price: 1400,
          originalPrice: 1800,
          rating: 4.7,
          reviews: 145,
          image: "https://static.wixstatic.com/media/d7d9fb_4406dc3508c24b5bbe92d548667548cd~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Lotus", "Incense"]
        },
        {
          id: 16,
          name: "Mandala Meditation Mat",
          artist: "Yogi Raman",
          price: 3600,
          originalPrice: 4500,
          rating: 4.6,
          reviews: 98,
          image: "https://static.wixstatic.com/media/d7d9fb_f6e40b8dd3434fd7bba54fd035e5d6e1~mv2.png?originWidth=1920&originHeight=1024",
          tags: ["Mandala", "Yoga"]
        }
      ]
    }
  };

  const currentCollection = themeCollections[activeTheme];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <Image
          src={currentCollection.hero}
          alt={currentCollection.title}
          width={1920}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${currentCollection.color} opacity-80`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <motion.h1
              className="font-heading text-5xl md:text-7xl font-bold mb-4 uppercase tracking-wider"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {currentCollection.title}
            </motion.h1>
            <motion.p
              className="font-paragraph text-xl md:text-2xl mb-8 text-white/90"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {currentCollection.description}
            </motion.p>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold text-lg px-8 py-4 rounded-full"
              >
                <Link to={`/discover?theme=${activeTheme}`}>
                  Explore Collection
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Theme Navigation */}
        <div className="mb-12">
          <Tabs value={activeTheme} onValueChange={setActiveTheme} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
              <TabsTrigger value="wedding" className="font-heading">Wedding</TabsTrigger>
              <TabsTrigger value="festival" className="font-heading">Festival</TabsTrigger>
              <TabsTrigger value="home" className="font-heading">Home Décor</TabsTrigger>
              <TabsTrigger value="spiritual" className="font-heading">Spiritual</TabsTrigger>
            </TabsList>

            {/* Collection Content */}
            {Object.entries(themeCollections).map(([key, collection]) => (
              <TabsContent key={key} value={key} className="space-y-8">
                {/* Collection Info */}
                <div className="text-center mb-8">
                  <h2 className="font-heading text-3xl font-bold text-primary mb-4 uppercase tracking-wide">
                    Featured {collection.title} Items
                  </h2>
                  <p className="font-paragraph text-lg text-primary/70 max-w-3xl mx-auto">
                    Handpicked pieces that perfectly capture the essence and beauty of this theme
                  </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {collection.products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="group hover:shadow-lg transition-shadow duration-300 border-0">
                        <CardContent className="p-0">
                          <div className="relative overflow-hidden rounded-t-lg">
                            <Link to={`/product/${product.id}`}>
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={400}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </Link>
                            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                              {product.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="bg-neonaccent text-primary text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                              <Heart className="w-4 h-4 text-primary" />
                            </button>
                          </div>

                          <div className="p-4">
                            <Link to={`/product/${product.id}`}>
                              <h3 className="font-heading font-bold text-lg text-primary mb-1 line-clamp-1 hover:text-black transition-colors">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="font-paragraph text-sm text-primary/60 mb-2">
                              by {product.artist}
                            </p>

                            <div className="flex items-center mb-2">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-paragraph text-sm text-primary ml-1">
                                  {product.rating}
                                </span>
                              </div>
                              <span className="font-paragraph text-xs text-primary/50 ml-2">
                                ({product.reviews})
                              </span>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="font-heading font-bold text-lg text-primary">
                                  ₹{product.price.toLocaleString()}
                                </span>
                                <span className="font-paragraph text-sm text-primary/50 line-through">
                                  ₹{product.originalPrice.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Add to Cart
                              </Button>
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                              >
                                <Link to={`/product/${product.id}`}>View</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-8">
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Link to={`/discover?theme=${key}`}>
                      View All {collection.title} Items
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Theme Benefits */}
        <section className="py-16 bg-secondary rounded-lg">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-heading text-3xl font-bold text-primary mb-8 uppercase tracking-wide">
              Why Choose Themed Collections?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-16 h-16 bg-neonaccent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="palette" size={40} className="text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl text-primary mb-3">Curated Selection</h3>
                <p className="font-paragraph text-primary/70">
                  Each collection is carefully curated to ensure pieces complement each other perfectly
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-neonaccent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="sparkles" size={40} className="text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl text-primary mb-3">Authentic Craftsmanship</h3>
                <p className="font-paragraph text-primary/70">
                  Every piece is handcrafted by skilled artisans using traditional techniques
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-16 h-16 bg-neonaccent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="home" size={40} className="text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl text-primary mb-3">Perfect Harmony</h3>
                <p className="font-paragraph text-primary/70">
                  Create cohesive spaces that tell a story and reflect your personal style
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Custom Theme Request */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-heading text-3xl font-bold text-primary mb-4 uppercase tracking-wide">
                Need a Custom Theme?
              </h2>
              <p className="font-paragraph text-lg text-primary/70 mb-8">
                Can't find exactly what you're looking for? Our artisans can create custom themed collections tailored to your specific needs and vision.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold"
                >
                  <Link to="/custom-requests">
                    Request Custom Theme
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-heading font-bold"
                >
                  <Link to="/community">
                    Get Inspiration
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}