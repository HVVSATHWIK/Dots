import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Share2, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

export default function ProductDetailPage() {
  const { id: _ } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);

  // Sample product data
  const product = {
    id: 1,
    name: "Handpainted Madhubani Art",
    artist: {
      name: "Priya Sharma",
      image: "https://static.wixstatic.com/media/d7d9fb_e1a26af783544d6fb915a12b6b19ce35~mv2.png?originWidth=128&originHeight=128",
      bio: "Master artist from Bihar with 15+ years of experience in traditional Madhubani painting",
      rating: 4.9,
      totalProducts: 47
    },
    price: 2500,
    originalPrice: 3000,
    discount: 17,
    rating: 4.8,
    reviews: 124,
    images: [
      "https://static.wixstatic.com/media/d7d9fb_ec4a6af7db5e40fb98f84de4bb335f63~mv2.png?originWidth=576&originHeight=576",
      "https://static.wixstatic.com/media/d7d9fb_4362b712125a4a128aa42b44d6e5e2d3~mv2.png?originWidth=576&originHeight=576",
      "https://static.wixstatic.com/media/d7d9fb_fbac04ae46684975a2e558b785febaf2~mv2.png?originWidth=576&originHeight=576",
      "https://static.wixstatic.com/media/d7d9fb_0b46e4a065c044e3a020f4e6800cf591~mv2.png?originWidth=576&originHeight=576"
    ],
    tags: ["Bestseller", "Traditional", "Handmade"],
    colors: [
      { name: "Traditional", hex: "#FF6B6B" },
      { name: "Blue Variant", hex: "#4ECDC4" },
      { name: "Green Variant", hex: "#45B7D1" }
    ],
    description: "This exquisite Madhubani painting showcases the traditional art form from Bihar, featuring intricate patterns and vibrant colors. Each piece is hand-painted by skilled artisans using natural pigments and traditional techniques passed down through generations.",
    specifications: {
      "Dimensions": "16\" x 12\"",
      "Material": "Handmade paper",
      "Technique": "Traditional Madhubani",
      "Origin": "Bihar, India",
      "Care Instructions": "Keep away from direct sunlight and moisture"
    },
    delivery: {
      standard: "5-7 business days",
      express: "2-3 business days (+₹200)"
    },
    inStock: true,
    stockCount: 8
  };

  const reviews = [
    {
      id: 1,
      user: "Anita Gupta",
      rating: 5,
      date: "2024-01-15",
      comment: "Absolutely beautiful artwork! The colors are vibrant and the detailing is incredible. Priya's work is truly exceptional.",
      images: ["https://static.wixstatic.com/media/d7d9fb_220acd33438148a0af83647a64da89f0~mv2.png?originWidth=128&originHeight=128"]
    },
    {
      id: 2,
      user: "Rajesh Mehta",
      rating: 5,
      date: "2024-01-10",
      comment: "Perfect for my living room. The traditional patterns are authentic and the quality is outstanding. Highly recommended!",
      images: []
    },
    {
      id: 3,
      user: "Sarah Johnson",
      rating: 4,
      date: "2024-01-05",
      comment: "Beautiful piece of art. Shipping was fast and packaging was excellent. Minor color variation from the photo but still lovely.",
      images: ["https://static.wixstatic.com/media/d7d9fb_c859126f5d7a49f6819aae436d2470aa~mv2.png?originWidth=128&originHeight=128"]
    }
  ];

  const similarProducts = [
    {
      id: 2,
      name: "Warli Art Canvas",
      artist: "Deepak Tribal",
      price: 2200,
      originalPrice: 2800,
      rating: 4.7,
      image: "https://static.wixstatic.com/media/d7d9fb_66c68f301c0d4369ae997e59ef20454f~mv2.png?originWidth=256&originHeight=192"
    },
    {
      id: 3,
      name: "Pattachitra Painting",
      artist: "Sunita Das",
      price: 3200,
      originalPrice: 4000,
      rating: 4.9,
      image: "https://static.wixstatic.com/media/d7d9fb_22968e059e1840dca2cea8d85a55f4ac~mv2.png?originWidth=256&originHeight=192"
    },
    {
      id: 4,
      name: "Kalamkari Art",
      artist: "Ravi Reddy",
      price: 2800,
      originalPrice: 3500,
      rating: 4.6,
      image: "https://static.wixstatic.com/media/d7d9fb_014377ca67c145b19ba0cf9549824469~mv2.png?originWidth=256&originHeight=192"
    },
    {
      id: 5,
      name: "Gond Painting",
      artist: "Maya Tribal",
      price: 2600,
      originalPrice: 3200,
      rating: 4.8,
      image: "https://static.wixstatic.com/media/d7d9fb_9322aeb47e934b0396e880b1b8d389d7~mv2.png?originWidth=256&originHeight=192"
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const increaseQuantity = () => {
    if (quantity < product.stockCount) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm font-paragraph">
            <Link to="/" className="text-primary/60 hover:text-primary">Home</Link>
            <span className="text-primary/40">/</span>
            <Link to="/discover" className="text-primary/60 hover:text-primary">Discover</Link>
            <span className="text-primary/40">/</span>
            <span className="text-primary">Paintings</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
              <Image
                src={product.images[currentImageIndex]}
                alt={product.name}
                width={600}
                className="w-full h-full object-cover"
              />
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary p-2 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary p-2 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full transition-colors">
                <Heart className="w-5 h-5 text-primary" />
              </button>
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? 'border-neonaccent' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    width={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-neonaccent text-primary"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Title and Artist */}
            <div>
              <h1 className="font-heading text-3xl font-bold text-primary mb-2 uppercase tracking-wide">
                {product.name}
              </h1>
              <Link
                to={`/artist/${product.artist.name.toLowerCase().replace(' ', '-')}`}
                className="font-paragraph text-lg text-primary/70 hover:text-black transition-colors"
              >
                by {product.artist.name}
              </Link>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-paragraph text-sm text-primary ml-2">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="font-heading text-3xl font-bold text-primary">
                ₹{product.price.toLocaleString()}
              </span>
              <span className="font-paragraph text-xl text-primary/50 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
              <Badge variant="destructive" className="bg-red-500 text-white">
                {product.discount}% OFF
              </Badge>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-heading font-bold text-sm text-primary mb-3">Color Variant</h3>
              <div className="flex space-x-3">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(index)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      index === selectedColor ? 'border-primary' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-heading font-bold text-sm text-primary mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-paragraph">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stockCount}
                    className="p-2 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="font-paragraph text-sm text-primary/60">
                  {product.stockCount} in stock
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex space-x-3">
                <Button
                  size="lg"
                  className="flex-1 bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold"
                >
                  Buy Now
                </Button>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" size="lg" className="flex-1">
                  <Heart className="w-5 h-5 mr-2" />
                  Add to Wishlist
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="space-y-3 p-4 bg-secondary rounded-lg">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-paragraph text-sm text-primary">
                    <strong>Standard Delivery:</strong> {product.delivery.standard}
                  </p>
                  <p className="font-paragraph text-sm text-primary">
                    <strong>Express Delivery:</strong> {product.delivery.express}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-primary" />
                <p className="font-paragraph text-sm text-primary">
                  Secure payment & authenticity guaranteed
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 text-primary" />
                <p className="font-paragraph text-sm text-primary">
                  7-day return policy
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="artist">Artist Info</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="font-paragraph text-primary leading-relaxed">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-paragraph font-medium text-primary">{key}:</span>
                        <span className="font-paragraph text-primary/70">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="artist" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={product.artist.image} alt={product.artist.name} />
                      <AvatarFallback>{product.artist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-heading text-xl font-bold text-primary mb-2">
                        {product.artist.name}
                      </h3>
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-paragraph text-sm text-primary ml-1">
                            {product.artist.rating} rating
                          </span>
                        </div>
                        <span className="font-paragraph text-sm text-primary/60">
                          {product.artist.totalProducts} products
                        </span>
                      </div>
                      <p className="font-paragraph text-primary/70 mb-4">
                        {product.artist.bio}
                      </p>
                      <Button variant="outline" size="sm">
                        View Artist Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Review Summary */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-heading text-xl font-bold text-primary mb-2">
                          Customer Reviews
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < Math.floor(product.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-paragraph text-lg text-primary">
                            {product.rating} out of 5
                          </span>
                          <span className="font-paragraph text-sm text-primary/60">
                            ({product.reviews} reviews)
                          </span>
                        </div>
                      </div>
                      <Button variant="outline">Write a Review</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-paragraph font-medium text-primary">
                              {review.user}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-paragraph text-sm text-primary/60">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="font-paragraph text-primary/80 mb-3">
                          {review.comment}
                        </p>
                        {review.images.length > 0 && (
                          <div className="flex space-x-2">
                            {review.images.map((image, index) => (
                              <Image
                                key={index}
                                src={image}
                                alt={`Review image ${index + 1}`}
                                width={80}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Similar Products */}
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary mb-6 uppercase tracking-wide">
            Similar Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((product, index) => (
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
                          width={300}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
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

                      <div className="flex items-center mb-3">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-paragraph text-sm text-primary ml-1">
                          {product.rating}
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

                      <Button
                        size="sm"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}