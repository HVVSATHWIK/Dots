import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Star, Heart, ShoppingCart, UserPlus, Store, Sparkles, Box } from 'lucide-react';
import Icon from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { motion } from 'framer-motion';
import { useMember } from '@/integrations';

export default function HomePage() {
  const { isAuthenticated, member } = useMember();
  // Start on the embroidery slide to match the reference hero
  const [currentSlide, setCurrentSlide] = useState(2);

  // Hero carousel data
  const heroSlides = [
    {
      id: 1,
      title: "Handcrafted Pottery",
      subtitle: "Traditional Indian ceramics made with love",
      image: "https://static.wixstatic.com/media/d7d9fb_683c5b8a65d043589b78354948dafde1~mv2.png?originWidth=1920&originHeight=704",
      cta: "Explore Pottery"
    },
    {
      id: 2,
      title: "Vibrant Paintings",
      subtitle: "Contemporary and traditional art forms",
      image: "https://static.wixstatic.com/media/d7d9fb_4a085f39873046f5b65567fb4df5b82d~mv2.png?originWidth=1920&originHeight=704",
      cta: "Discover Art"
    },
    {
      id: 3,
      title: "Exquisite Embroidery",
      subtitle: "Intricate needlework from master artisans",
      image: "https://static.wixstatic.com/media/d7d9fb_e541c46cef1246d1a2716de9e03e986c~mv2.png?originWidth=1920&originHeight=704",
      cta: "Shop Now"
    }
  ];

  // Categories data
  const categories = [
    { name: 'Wedding', icon: <Icon name="target" size={20} className="text-primary" />, href: '/themes/wedding' },
    { name: 'Haldi', icon: <Icon name="palette" size={20} className="text-primary" />, href: '/discover?category=haldi' },
    { name: 'Shell Art', icon: <Icon name="shell" size={20} className="text-primary" />, href: '/discover?category=shell-art' },
    { name: 'Paintings', icon: <Icon name="palette" size={20} className="text-primary" />, href: '/discover?category=paintings' },
    { name: 'Wooden Dolls', icon: <Icon name="doll" size={20} className="text-primary" />, href: '/discover?category=wooden-dolls' },
    { name: 'Pottery', icon: <Icon name="vase" size={20} className="text-primary" />, href: '/discover?category=pottery' },
    { name: 'Ceramics', icon: <Icon name="teapot" size={20} className="text-primary" />, href: '/discover?category=ceramics' },
    { name: 'Metal Craft', icon: <Icon name="hammer" size={20} className="text-primary" />, href: '/discover?category=metal-craft' },
    { name: 'Jewelry', icon: <Icon name="gem" size={20} className="text-primary" />, href: '/discover?category=jewelry' },
    { name: 'Fridge Magnets', icon: <Icon name="magnet" size={20} className="text-primary" />, href: '/discover?category=magnets' },
    { name: 'Showpieces', icon: <Icon name="building" size={20} className="text-primary" />, href: '/discover?category=showpieces' },
    { name: 'Vintage', icon: <Icon name="beads" size={20} className="text-primary" />, href: '/discover?category=vintage' },
    { name: 'Become a Seller', icon: <Icon name="building" size={20} className="text-primary" />, href: '/sell' },
    { name: 'Embroidery', icon: <Icon name="thread" size={20} className="text-primary" />, href: '/discover?category=embroidery' }
  ];

  // Featured products
  const featuredProducts = [
    {
      id: 1,
      name: "Handpainted Madhubani Art",
      artist: "Priya Sharma",
      price: 2500,
      originalPrice: 3000,
      rating: 4.8,
      reviews: 124,
      image: "https://static.wixstatic.com/media/d7d9fb_ad3f9457377f4bc081242fa7abbdcbe9~mv2.png?originWidth=384&originHeight=192",
      tags: ["Bestseller", "Traditional"],
      colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"]
    },
    {
      id: 2,
      name: "Brass Ganesha Sculpture",
      artist: "Rajesh Kumar",
      price: 4200,
      originalPrice: 5000,
      rating: 4.9,
      reviews: 89,
      image: "https://static.wixstatic.com/media/d7d9fb_f89183149b6f4c7683323919db071fab~mv2.png?originWidth=384&originHeight=192",
      tags: ["New", "Spiritual"],
      colors: ["#FFD700", "#CD7F32"]
    },
    {
      id: 3,
      name: "Embroidered Wall Hanging",
      artist: "Meera Devi",
      price: 1800,
      originalPrice: 2200,
      rating: 4.7,
      reviews: 156,
      image: "https://static.wixstatic.com/media/d7d9fb_759a6b92129a4699a10d339643bc662a~mv2.png?originWidth=384&originHeight=192",
      tags: ["Handmade", "Colorful"],
      colors: ["#E74C3C", "#F39C12", "#8E44AD"]
    },
    {
      id: 4,
      name: "Terracotta Vase Set",
      artist: "Amit Patel",
      price: 3200,
      originalPrice: 3800,
      rating: 4.6,
      reviews: 78,
      image: "https://static.wixstatic.com/media/d7d9fb_916264f4325d49de88b09aa5764c73c3~mv2.png?originWidth=384&originHeight=192",
      tags: ["Eco-friendly", "Home Decor"],
      colors: ["#D2691E", "#8B4513"]
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="min-h-screen">
      {/* Value Prop Banner */}
      <section className="border-b border-border/50 bg-background/60">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2">
                AI-powered marketplace for handcrafted designs
              </h1>
              <p className="font-paragraph text-primary/70">
                Discover authentic Indian crafts, personalize with AI, and preview in 3D. Collaborate with artisans and bring your ideas to life.
              </p>
            </div>
            <div className="flex md:justify-end gap-3">
              <Button asChild className="font-heading bg-neonaccent text-primary hover:bg-neonaccent/90">
                <Link to="/discover">
                  <Sparkles className="w-4 h-4 mr-2" /> Explore Crafts
                </Link>
              </Button>
              <Button asChild variant="outline" className="font-heading">
                <Link to="/custom-requests">
                  <Box className="w-4 h-4 mr-2" /> Try AI Preview
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Hero Carousel */}
      <section className="relative h-[70vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <motion.div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            initial={{ scale: 1.1 }}
            animate={{ scale: index === currentSlide ? 1 : 1.1 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              width={1920}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl px-4">
                <motion.h1
                  className="font-heading text-5xl md:text-7xl font-bold mb-4 uppercase tracking-wider"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  CONNECTING ARTS TO HEARTS
                </motion.h1>
                <motion.p
                  className="font-paragraph text-xl md:text-2xl mb-8 text-white/90"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  {slide.subtitle}
                </motion.p>
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  {!isAuthenticated ? (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        asChild
                        size="lg"
                        className="btn-primary font-heading font-bold text-lg px-8 py-4 rounded-full hover-lift"
                      >
                        <Link to="/choose-role">
                          <UserPlus className="mr-2 w-5 h-5" />
                          Join as Buyer
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-white text-white hover:bg-white hover:text-primary font-heading font-bold text-lg px-8 py-4 rounded-full hover-lift glass"
                      >
                        <Link to="/sell">
                          <Store className="mr-2 w-5 h-5" />
                          Become a Seller
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      asChild
                      size="lg"
                      className="btn-secondary font-heading font-bold text-lg px-8 py-4 rounded-full hover-lift"
                    >
                      <Link to={member?.role === 'artisan' ? '/copilot' : '/discover'}>
                        {member?.role === 'artisan' ? 'Go to Seller Tools' : 'Explore Artworks'}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </Button>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-neonaccent' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 border-y border-border/50">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary mb-6">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-full bg-neonaccent/15 text-neonaccent flex items-center justify-center mb-3">
                  1
                </div>
                <h3 className="font-heading font-semibold text-primary mb-1">Explore authentic crafts</h3>
                <p className="font-paragraph text-sm text-primary/70">Browse curated collections and discover unique handmade works from artisans.</p>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-full bg-neonaccent/15 text-neonaccent flex items-center justify-center mb-3">
                  2
                </div>
                <h3 className="font-heading font-semibold text-primary mb-1">Personalize with AI</h3>
                <p className="font-paragraph text-sm text-primary/70">Get smart recommendations and generate design variations to fit your vision.</p>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-full bg-neonaccent/15 text-neonaccent flex items-center justify-center mb-3">
                  3
                </div>
                <h3 className="font-heading font-semibold text-primary mb-1">Preview in 3D & order</h3>
                <p className="font-paragraph text-sm text-primary/70">Collaborate with artisans, visualize in 3D, and place your order confidently.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Proposition Section - Only show to non-authenticated users */}
      {!isAuthenticated && (
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-4xl font-bold mb-4 uppercase tracking-wide">
                WHY CHOOSE DOTS?
              </h2>
              <p className="font-paragraph text-lg text-primary-foreground/90 max-w-2xl mx-auto">
                The premier platform connecting authentic Indian artisans with art lovers worldwide
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-neonaccent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="palette" size={32} className="text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3">Authentic Craftsmanship</h3>
                <p className="font-paragraph text-primary-foreground/80">
                  Every piece is handcrafted by skilled artisans using traditional techniques passed down through generations
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-neonaccent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="target" size={32} className="text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3">Direct from Artisans</h3>
                <p className="font-paragraph text-primary-foreground/80">
                  Buy directly from artisans, ensuring fair compensation and supporting traditional crafts
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-neonaccent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="building" size={32} className="text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3">Global Reach</h3>
                <p className="font-paragraph text-primary-foreground/80">
                  Discover and purchase authentic Indian art from anywhere in the world with secure shipping
                </p>
              </motion.div>
            </div>

            <div className="text-center mt-12">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold"
                >
                  <Link to="/choose-role">
                    <UserPlus className="mr-2 w-5 h-5" />
                    Start Shopping
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-heading font-bold"
                >
                  <Link to="/sell">
                    <Store className="mr-2 w-5 h-5" />
                    Become a Seller
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-primary mb-4 uppercase tracking-wide">
              {isAuthenticated ? 'EXPLORE BY CATEGORY' : 'WHAT YOU CAN FIND'}
            </h2>
            <p className="text-lg max-w-2xl mx-auto font-paragraph text-primary/70 leading-relaxed">
              {isAuthenticated 
                ? 'Discover authentic Indian crafts organized by themes and occasions'
                : 'Browse our diverse collection of authentic Indian handicrafts'
              }
            </p>
          </div>

          <div className="overflow-x-auto pb-6">
            <div className="flex space-x-8 min-w-max px-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={category.href}
                    className="flex flex-col items-center group text-primary min-w-[5rem] hover-lift"
                  >
                    <div className="w-20 h-20 bg-neonaccent rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 shadow-soft hover-glow">
                      <span className="text-3xl">{category.icon}</span>
                    </div>
                    <span className="text-sm group-hover:text-neonaccent transition-colors font-heading text-primary text-center leading-tight">
                      {category.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16 bg-secondary">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-primary mb-4 uppercase tracking-wide">
              FEATURED ARTWORKS
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-primary/70 font-paragraph leading-relaxed">
              {isAuthenticated 
                ? 'Handpicked masterpieces from our talented artisan community'
                : 'Sample of the beautiful handcrafted pieces available on DOTS'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-large transition-all duration-300 border-0 hover:-translate-y-1 card-enhanced card-glow">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={400}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {product.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-neonaccent text-primary text-xs font-bold shadow-sm"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <button className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all shadow-sm">
                        <Heart className="w-4 h-4 text-primary" />
                      </button>
                    </div>

                    <div className="p-5">
                      <h3 className="font-heading font-bold text-lg text-primary mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm mb-3 text-primary/70 font-paragraph">
                        by {product.artist}
                      </p>

                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-paragraph text-sm text-primary ml-1">
                            {product.rating}
                          </span>
                        </div>
                        <span className="text-xs ml-2 font-paragraph text-primary/60">
                          ({product.reviews} reviews)
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-heading font-bold text-lg text-primary">
                            ₹{product.price.toLocaleString()}
                          </span>
                          <span className="text-sm line-through text-primary/50 font-paragraph">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          {product.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-medium"
                          disabled={!isAuthenticated}
                          onClick={() => {
                            if (!isAuthenticated) {
                              window.location.href = '/choose-role';
                            }
                          }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {isAuthenticated ? 'Add to Cart' : 'Choose Your Role'}
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-heading font-medium"
                        >
                          <Link to={isAuthenticated ? `/product/${product.id}` : '/choose-role'}>
                            {isAuthenticated ? 'View' : 'Choose Your Role'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-heading font-bold hover:scale-105 transition-transform"
            >
              <Link to={isAuthenticated ? "/discover" : "/choose-role"}>
                {isAuthenticated ? 'View All Products' : 'Sign Up to Explore'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action for Non-Authenticated Users */}
      {!isAuthenticated && (
        <section className="py-16 bg-gradient-to-r from-neonaccent to-neonaccent/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-heading text-3xl font-bold text-primary mb-4 uppercase tracking-wide">
                Ready to Get Started?
              </h2>
              <p className="font-paragraph text-lg text-primary/80 mb-8 max-w-2xl mx-auto">
                Join thousands of art lovers and artisans who are already part of the DOTS community. 
                Whether you want to buy authentic crafts or sell your own creations, we have the perfect place for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold"
                >
                  <Link to="/choose-role">
                    <UserPlus className="mr-2 w-5 h-5" />
                    Join as Art Lover
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-heading font-bold"
                >
                  <Link to="/sell">
                    <Store className="mr-2 w-5 h-5" />
                    Become an Artisan
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* Action Cards */}
      <section className="py-16 bg-background">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 hover:shadow-large transition-all duration-300 hover:-translate-y-1 card-glow">
                <CardContent className="p-8 text-center">
                  <h3 className="font-heading text-xl font-bold mb-3 uppercase">
                    Explore Art by Themes
                  </h3>
                  <p className="text-sm mb-6 text-primary-foreground/90 font-paragraph leading-relaxed">
                    {isAuthenticated 
                      ? 'Discover curated collections for weddings, festivals, and special occasions'
                      : 'See how our artworks can enhance your special occasions'
                    }
                  </p>
                  <Button
                    asChild
                    variant="secondary"
                    className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold hover:scale-105 transition-transform"
                  >
                    <Link to={isAuthenticated ? "/themes" : "/choose-role"}>
                      {isAuthenticated ? 'Explore Now' : 'Sign Up to Explore'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full bg-gradient-to-br from-neonaccent to-neonaccent/80 text-primary border-0 hover:shadow-large transition-all duration-300 hover:-translate-y-1 card-glow">
                <CardContent className="p-8 text-center">
                  <h3 className="font-heading text-xl font-bold mb-3 uppercase">
                    Explore Traditional Art
                  </h3>
                  <p className="text-sm mb-6 text-primary/80 font-paragraph leading-relaxed">
                    {isAuthenticated
                      ? 'Immerse yourself in centuries-old crafting traditions from across India'
                      : 'Preview the rich heritage of Indian traditional crafts'
                    }
                  </p>
                  <Button
                    asChild
                    variant="secondary"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold hover:scale-105 transition-transform"
                  >
                    <Link to={isAuthenticated ? "/discover?category=traditional" : "/choose-role"}>
                      {isAuthenticated ? 'Explore Now' : 'Sign Up to Explore'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:shadow-large transition-all duration-300 hover:-translate-y-1 card-enhanced card-glow">
                <CardContent className="p-8 text-center">
                  <h3 className="font-heading text-xl font-bold mb-3 uppercase text-primary">
                    Discover Section
                  </h3>
                  <p className="text-sm mb-6 text-primary/70 font-paragraph leading-relaxed">
                    {isAuthenticated
                      ? 'Browse our complete collection of authentic handcrafted artworks'
                      : 'Get a glimpse of our extensive artisan marketplace'
                    }
                  </p>
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold hover:scale-105 transition-transform"
                  >
                    <Link to={isAuthenticated ? "/discover" : "/choose-role"}>
                      {isAuthenticated ? 'Explore Now' : 'Sign Up to Browse'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full bg-gradient-to-br from-primary/5 to-neonaccent/10 border border-neonaccent/30 hover:shadow-large transition-all duration-300 hover:-translate-y-1 card-enhanced card-glow">
                <CardContent className="p-8 text-center">
                  <h3 className="font-heading text-xl font-bold mb-3 uppercase text-primary">
                    Join Our Community
                  </h3>
                  <p className="text-sm mb-6 text-primary/70 font-paragraph leading-relaxed">
                    {isAuthenticated
                      ? 'Connect with artisans, share ideas, and learn about Indian craft traditions'
                      : 'Be part of a vibrant community of art lovers and creators'
                    }
                  </p>
                  <Button
                    asChild
                    className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold hover:scale-105 transition-transform"
                  >
                    <Link to={isAuthenticated ? "/community" : "/choose-role"}>
                      Join Our Community
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}