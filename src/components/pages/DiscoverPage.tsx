import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Grid, List, Star, Heart, ShoppingCart, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { motion } from 'framer-motion';

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);

  // Sample products data
  const allProducts = [
    {
      id: 1,
      name: "Handpainted Madhubani Art",
      artist: "Priya Sharma",
      price: 2500,
      originalPrice: 3000,
      rating: 4.8,
      reviews: 124,
      image: "https://static.wixstatic.com/media/d7d9fb_725eb69a30b94c0b87afaa8553254986~mv2.png?originWidth=384&originHeight=192",
      tags: ["Bestseller", "Traditional"],
      colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
      category: "paintings",
      region: "Bihar",
      material: "Paper",
      delivery: "3-5 days"
    },
    {
      id: 2,
      name: "Brass Ganesha Sculpture",
      artist: "Rajesh Kumar",
      price: 4200,
      originalPrice: 5000,
      rating: 4.9,
      reviews: 89,
      image: "https://static.wixstatic.com/media/d7d9fb_8ed9170cf4e14fb59b09db96f2e13e94~mv2.png?originWidth=384&originHeight=192",
      tags: ["New", "Spiritual"],
      colors: ["#FFD700", "#CD7F32"],
      category: "metal-craft",
      region: "Rajasthan",
      material: "Brass",
      delivery: "5-7 days"
    },
    {
      id: 3,
      name: "Embroidered Wall Hanging",
      artist: "Meera Devi",
      price: 1800,
      originalPrice: 2200,
      rating: 4.7,
      reviews: 156,
      image: "https://static.wixstatic.com/media/d7d9fb_ba1b3e4b799241038e090a0f6b894d14~mv2.png?originWidth=384&originHeight=192",
      tags: ["Handmade", "Colorful"],
      colors: ["#E74C3C", "#F39C12", "#8E44AD"],
      category: "embroidery",
      region: "Gujarat",
      material: "Cotton",
      delivery: "2-4 days"
    },
    {
      id: 4,
      name: "Terracotta Vase Set",
      artist: "Amit Patel",
      price: 3200,
      originalPrice: 3800,
      rating: 4.6,
      reviews: 78,
      image: "https://static.wixstatic.com/media/d7d9fb_191eb1dd1239421081d8e44c1d77a683~mv2.png?originWidth=384&originHeight=192",
      tags: ["Eco-friendly", "Home Decor"],
      colors: ["#D2691E", "#8B4513"],
      category: "pottery",
      region: "West Bengal",
      material: "Clay",
      delivery: "4-6 days"
    },
    {
      id: 5,
      name: "Wooden Elephant Figurine",
      artist: "Suresh Reddy",
      price: 1500,
      originalPrice: 1800,
      rating: 4.5,
      reviews: 92,
      image: "https://static.wixstatic.com/media/d7d9fb_6b52471adf544346a476aa8b6a4c0c81~mv2.png?originWidth=384&originHeight=192",
      tags: ["Handcarved", "Traditional"],
      colors: ["#8B4513", "#D2691E"],
      category: "wooden-dolls",
      region: "Karnataka",
      material: "Wood",
      delivery: "3-5 days"
    },
    {
      id: 6,
      name: "Silver Jewelry Set",
      artist: "Kavita Singh",
      price: 5500,
      originalPrice: 6500,
      rating: 4.9,
      reviews: 203,
      image: "https://static.wixstatic.com/media/d7d9fb_30bb53a67153497a9a5b387209f5657d~mv2.png?originWidth=384&originHeight=192",
      tags: ["Premium", "Wedding"],
      colors: ["#C0C0C0", "#FFD700"],
      category: "jewelry",
      region: "Rajasthan",
      material: "Silver",
      delivery: "7-10 days"
    },
    {
      id: 7,
      name: "Haldi Ceremony Decorative Set",
      artist: "Sunita Sharma",
      price: 2800,
      originalPrice: 3200,
      rating: 4.6,
      reviews: 67,
      image: "https://static.wixstatic.com/media/d7d9fb_f8cd9fb5796144b7a50a153166f228ff~mv2.png?originWidth=384&originHeight=192",
      tags: ["Wedding", "Traditional"],
      colors: ["#FFD700", "#FFA500", "#FF8C00"],
      category: "haldi",
      region: "Punjab",
      material: "Mixed",
      delivery: "3-5 days"
    },
    {
      id: 8,
      name: "Intricate Embroidered Cushion Cover",
      artist: "Rekha Devi",
      price: 1200,
      originalPrice: 1500,
      rating: 4.4,
      reviews: 89,
      image: "https://static.wixstatic.com/media/d7d9fb_759a6b92129a4699a10d339643bc662a~mv2.png?originWidth=384&originHeight=192",
      tags: ["Home Decor", "Handmade"],
      colors: ["#FF1493", "#00CED1", "#32CD32"],
      category: "embroidery",
      region: "Rajasthan",
      material: "Silk",
      delivery: "2-4 days"
    },
    {
      id: 9,
      name: "Traditional Embroidered Saree",
      artist: "Lakshmi Bai",
      price: 4500,
      originalPrice: 5200,
      rating: 4.8,
      reviews: 145,
      image: "https://static.wixstatic.com/media/d7d9fb_84de36f410684270bfc1cb192ca8e804~mv2.png?originWidth=384&originHeight=192",
      tags: ["Premium", "Traditional"],
      colors: ["#DC143C", "#FFD700", "#4B0082"],
      category: "embroidery",
      region: "West Bengal",
      material: "Silk",
      delivery: "5-7 days"
    },
    {
      id: 10,
      name: "Embroidered Table Runner",
      artist: "Geeta Kumari",
      price: 950,
      originalPrice: 1200,
      rating: 4.3,
      reviews: 76,
      image: "https://static.wixstatic.com/media/d7d9fb_a9e434cecc8948c3b3ec9ef1be63d84d~mv2.png?originWidth=384&originHeight=192",
      tags: ["Home Decor", "Festive"],
      colors: ["#FF6347", "#32CD32", "#FFD700"],
      category: "embroidery",
      region: "Gujarat",
      material: "Cotton",
      delivery: "2-3 days"
    },
    {
      id: 11,
      name: "Haldi Turmeric Paste Bowl Set",
      artist: "Kamala Devi",
      price: 1800,
      originalPrice: 2100,
      rating: 4.5,
      reviews: 54,
      image: "https://static.wixstatic.com/media/d7d9fb_b2427570695541679e5bef6519dc4156~mv2.png?originWidth=384&originHeight=192",
      tags: ["Ceremonial", "Traditional"],
      colors: ["#FFD700", "#FFA500"],
      category: "haldi",
      region: "Maharashtra",
      material: "Brass",
      delivery: "4-6 days"
    }
  ];

  const categories = [
    { id: "paintings", name: "Paintings" },
    { id: "pottery", name: "Pottery" },
    { id: "textiles", name: "Textiles" },
    { id: "jewelry", name: "Jewelry" },
    { id: "metal-craft", name: "Metal Craft" },
    { id: "wooden-dolls", name: "Wooden Crafts" },
    { id: "ceramics", name: "Ceramics" },
    { id: "shell-art", name: "Shell Art" },
    { id: "embroidery", name: "Embroidery" },
    { id: "haldi", name: "Haldi" }
  ];

  const regions = [
    { id: "rajasthan", name: "Rajasthan" },
    { id: "gujarat", name: "Gujarat" },
    { id: "bihar", name: "Bihar" },
    { id: "west-bengal", name: "West Bengal" },
    { id: "karnataka", name: "Karnataka" },
    { id: "kerala", name: "Kerala" },
    { id: "odisha", name: "Odisha" },
    { id: "uttar-pradesh", name: "Uttar Pradesh" }
  ];

  const materials = [
    { id: "wood", name: "Wood" },
    { id: "metal", name: "Metal" },
    { id: "fabric", name: "Fabric" },
    { id: "clay", name: "Clay" },
    { id: "paper", name: "Paper" },
    { id: "stone", name: "Stone" },
    { id: "glass", name: "Glass" },
    { id: "brass", name: "Brass" }
  ];

  const ratings = [
    { id: "4-plus", name: "4★ & above" },
    { id: "3-plus", name: "3★ & above" },
    { id: "2-plus", name: "2★ & above" }
  ];

  // Filter products based on current filters
  const filteredProducts = allProducts.filter(product => {
    const searchQuery = searchParams.get('search')?.toLowerCase() || '';
    const categoryFilter = searchParams.get('category') || '';
    
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery) && 
        !product.artist.toLowerCase().includes(searchQuery)) {
      return false;
    }

    // Category filter from URL
    if (categoryFilter && product.category !== categoryFilter) {
      return false;
    }

    // Price filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }

    // Category filter from sidebar
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }

    // Region filter
    if (selectedRegions.length > 0 && !selectedRegions.includes(product.region.toLowerCase().replace(' ', '-'))) {
      return false;
    }

    // Material filter
    if (selectedMaterials.length > 0 && !selectedMaterials.includes(product.material.toLowerCase())) {
      return false;
    }

    // Rating filter
    if (selectedRatings.length > 0) {
      const hasValidRating = selectedRatings.some(rating => {
        if (rating === '4-plus') return product.rating >= 4;
        if (rating === '3-plus') return product.rating >= 3;
        if (rating === '2-plus') return product.rating >= 2;
        return false;
      });
      if (!hasValidRating) return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id - a.id;
      default: // popularity
        return b.reviews - a.reviews;
    }
  });

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    }
  };

  const handleRegionChange = (regionId: string, checked: boolean) => {
    if (checked) {
      setSelectedRegions([...selectedRegions, regionId]);
    } else {
      setSelectedRegions(selectedRegions.filter(id => id !== regionId));
    }
  };

  const handleMaterialChange = (materialId: string, checked: boolean) => {
    if (checked) {
      setSelectedMaterials([...selectedMaterials, materialId]);
    } else {
      setSelectedMaterials(selectedMaterials.filter(id => id !== materialId));
    }
  };

  const handleRatingChange = (ratingId: string, checked: boolean) => {
    if (checked) {
      setSelectedRatings([...selectedRatings, ratingId]);
    } else {
      setSelectedRatings(selectedRatings.filter(id => id !== ratingId));
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedRegions([]);
    setSelectedMaterials([]);
    setSelectedRatings([]);
    setPriceRange([0, 10000]);
    setSearchParams({});
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-bold text-lg text-primary mb-4">Filters</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="w-full mb-4"
        >
          Clear All Filters
        </Button>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-heading font-bold text-sm text-primary mb-3">Price Range</h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={10000}
            min={0}
            step={100}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-primary/60">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-heading font-bold text-sm text-primary mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
              />
              <label
                htmlFor={category.id}
                className="font-paragraph text-sm text-primary cursor-pointer"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Regions */}
      <div>
        <h4 className="font-heading font-bold text-sm text-primary mb-3">Regions</h4>
        <div className="space-y-2">
          {regions.map((region) => (
            <div key={region.id} className="flex items-center space-x-2">
              <Checkbox
                id={region.id}
                checked={selectedRegions.includes(region.id)}
                onCheckedChange={(checked) => handleRegionChange(region.id, checked as boolean)}
              />
              <label
                htmlFor={region.id}
                className="font-paragraph text-sm text-primary cursor-pointer"
              >
                {region.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div>
        <h4 className="font-heading font-bold text-sm text-primary mb-3">Materials</h4>
        <div className="space-y-2">
          {materials.map((material) => (
            <div key={material.id} className="flex items-center space-x-2">
              <Checkbox
                id={material.id}
                checked={selectedMaterials.includes(material.id)}
                onCheckedChange={(checked) => handleMaterialChange(material.id, checked as boolean)}
              />
              <label
                htmlFor={material.id}
                className="font-paragraph text-sm text-primary cursor-pointer"
              >
                {material.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Ratings */}
      <div>
        <h4 className="font-heading font-bold text-sm text-primary mb-3">Customer Ratings</h4>
        <div className="space-y-2">
          {ratings.map((rating) => (
            <div key={rating.id} className="flex items-center space-x-2">
              <Checkbox
                id={rating.id}
                checked={selectedRatings.includes(rating.id)}
                onCheckedChange={(checked) => handleRatingChange(rating.id, checked as boolean)}
              />
              <label
                htmlFor={rating.id}
                className="font-paragraph text-sm text-primary cursor-pointer"
              >
                {rating.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-primary mb-4 uppercase tracking-wide">
            DISCOVER ARTWORKS
          </h1>
          <p className="text-lg font-heading text-color-10">
            Explore authentic handcrafted treasures from talented Indian artisans
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="font-paragraph text-sm text-primary">
              {sortedProducts.length} products found
            </span>
            
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Sort by Popularity</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Customer Rating</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-paragraph text-lg text-primary/60 mb-4">
                  No products found matching your criteria
                </p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
              }>
                {sortedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {viewMode === 'grid' ? (
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
                              <div className="flex space-x-1">
                                {product.colors.map((color, idx) => (
                                  <div
                                    key={idx}
                                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="font-paragraph text-xs text-primary/60 mb-3">
                              Delivery: {product.delivery}
                            </p>

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
                    ) : (
                      <Card className="border-0">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="relative w-32 h-32 flex-shrink-0">
                              <Link to={`/product/${product.id}`}>
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={128}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </Link>
                              <button className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white transition-colors">
                                <Heart className="w-3 h-3 text-primary" />
                              </button>
                            </div>

                            <div className="flex-1">
                              <div className="flex flex-wrap gap-1 mb-2">
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

                              <Link to={`/product/${product.id}`}>
                                <h3 className="font-heading font-bold text-xl text-primary mb-1 hover:text-neonaccent transition-colors">
                                  {product.name}
                                </h3>
                              </Link>
                              <p className="font-paragraph text-sm text-primary/60 mb-2">
                                by {product.artist} • {product.region}
                              </p>

                              <div className="flex items-center mb-2">
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-paragraph text-sm text-primary ml-1">
                                    {product.rating}
                                  </span>
                                </div>
                                <span className="font-paragraph text-xs text-primary/50 ml-2">
                                  ({product.reviews} reviews)
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="font-heading font-bold text-xl text-primary">
                                    ₹{product.price.toLocaleString()}
                                  </span>
                                  <span className="font-paragraph text-sm text-primary/50 line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                  </span>
                                </div>

                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
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
                                    <Link to={`/product/${product.id}`}>View Details</Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}