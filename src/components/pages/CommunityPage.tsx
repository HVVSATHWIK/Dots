import { useState } from 'react';
import { MessageCircle, Heart, Share2, Calendar, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('stories');

  // Sample community posts
  const communityPosts = [
    {
      id: 1,
      type: 'story',
      title: "The Ancient Art of Madhubani: A Journey Through Generations",
      excerpt: "Discover how this traditional art form from Bihar has been passed down through generations of women artists...",
      author: {
        name: "Priya Sharma",
        avatar: "https://static.wixstatic.com/media/d7d9fb_876c92e32d4044fb9490174fc344a49d~mv2.png?originWidth=384&originHeight=256",
        role: "Madhubani Artist",
        verified: true
      },
      image: "https://static.wixstatic.com/media/d7d9fb_5bd814a76aca46e8b1fb93fd1e927d42~mv2.png?originWidth=384&originHeight=256",
      date: "2024-01-20",
      readTime: "5 min read",
      likes: 234,
      comments: 45,
      tags: ["Traditional Art", "Bihar", "Women Artists"],
      category: "tradition"
    },
    {
      id: 2,
      type: 'behind-scenes',
      title: "Behind the Scenes: Creating a Brass Ganesha Sculpture",
      excerpt: "Take a peek into my workshop as I craft this intricate Ganesha sculpture using traditional lost-wax casting...",
      author: {
        name: "Rajesh Kumar",
        avatar: "https://static.wixstatic.com/media/d7d9fb_92cabd5ed24a40b3ad68e7f8b55a430e~mv2.png?originWidth=384&originHeight=256",
        role: "Metal Craft Artist",
        verified: true
      },
      image: "https://static.wixstatic.com/media/d7d9fb_b2427570695541679e5bef6519dc4156~mv2.png?originWidth=384&originHeight=256",
      date: "2024-01-18",
      readTime: "8 min read",
      likes: 189,
      comments: 32,
      tags: ["Behind the Scenes", "Metal Craft", "Process"],
      category: "process"
    },
    {
      id: 3,
      type: 'tutorial',
      title: "Basic Pottery Techniques: Getting Started with Clay",
      excerpt: "Learn the fundamental techniques of pottery making, from centering clay to creating your first bowl...",
      author: {
        name: "Amit Patel",
        avatar: "https://static.wixstatic.com/media/d7d9fb_7f5899bddd6b4bab9712b5de6b5905ed~mv2.png?originWidth=384&originHeight=256",
        role: "Pottery Master",
        verified: true
      },
      image: "https://static.wixstatic.com/media/d7d9fb_a9e434cecc8948c3b3ec9ef1be63d84d~mv2.png?originWidth=384&originHeight=256",
      date: "2024-01-15",
      readTime: "12 min read",
      likes: 156,
      comments: 28,
      tags: ["Tutorial", "Pottery", "Beginner"],
      category: "tutorial"
    },
    {
      id: 4,
      type: 'story',
      title: "Preserving Warli Art: A Tribal Heritage",
      excerpt: "The Warli tribe's ancient art form tells stories of daily life, nature, and spirituality through simple yet powerful imagery...",
      author: {
        name: "Deepak Tribal",
        avatar: "https://static.wixstatic.com/media/d7d9fb_5cdfb25e2f7d4239a998917eab9c6032~mv2.png?originWidth=384&originHeight=256",
        role: "Warli Artist",
        verified: true
      },
      image: "https://static.wixstatic.com/media/d7d9fb_a7effd50e4ff402f9dec9b5e67b156d6~mv2.png?originWidth=384&originHeight=256",
      date: "2024-01-12",
      readTime: "6 min read",
      likes: 298,
      comments: 67,
      tags: ["Tribal Art", "Heritage", "Warli"],
      category: "tradition"
    },
    {
      id: 5,
      type: 'discussion',
      title: "Modern Interpretations of Traditional Crafts",
      excerpt: "How can we adapt ancient techniques for contemporary audiences while preserving their cultural essence?",
      author: {
        name: "Kavita Singh",
        avatar: "https://static.wixstatic.com/media/d7d9fb_d448edf17a4a4d1789d54bdca80656f0~mv2.png?originWidth=384&originHeight=256",
        role: "Contemporary Artist",
        verified: true
      },
      image: "https://static.wixstatic.com/media/d7d9fb_84de36f410684270bfc1cb192ca8e804~mv2.png?originWidth=384&originHeight=256",
      date: "2024-01-10",
      readTime: "4 min read",
      likes: 142,
      comments: 89,
      tags: ["Discussion", "Modern Art", "Innovation"],
      category: "discussion"
    },
    {
      id: 6,
      type: 'event',
      title: "Upcoming: Virtual Embroidery Workshop",
      excerpt: "Join us for an interactive online workshop where you'll learn basic embroidery stitches and create your first piece...",
      author: {
        name: "Meera Devi",
        avatar: "https://static.wixstatic.com/media/d7d9fb_572803b2590a4635a9954a963b354663~mv2.png?originWidth=384&originHeight=256",
        role: "Embroidery Expert",
        verified: true
      },
      image: "https://static.wixstatic.com/media/d7d9fb_f8cd9fb5796144b7a50a153166f228ff~mv2.png?originWidth=384&originHeight=256",
      date: "2024-01-25",
      readTime: "Workshop",
      likes: 89,
      comments: 23,
      tags: ["Workshop", "Embroidery", "Virtual Event"],
      category: "events"
    }
  ];

  const categories = [
    { value: 'all', label: 'All Posts' },
    { value: 'tradition', label: 'Traditions' },
    { value: 'process', label: 'Behind the Scenes' },
    { value: 'tutorial', label: 'Tutorials' },
    { value: 'discussion', label: 'Discussions' },
    { value: 'events', label: 'Events' }
  ];

  const featuredArtists = [
    {
      name: "Priya Sharma",
      specialty: "Madhubani Painting",
      avatar: "https://static.wixstatic.com/media/d7d9fb_8f7b6bc62c0643a0948abf7e1a98da03~mv2.png?originWidth=128&originHeight=128",
      followers: 1234,
      posts: 47
    },
    {
      name: "Rajesh Kumar",
      specialty: "Metal Craft",
      avatar: "https://static.wixstatic.com/media/d7d9fb_31115c8a505d460da322690758fd7114~mv2.png?originWidth=128&originHeight=128",
      followers: 987,
      posts: 32
    },
    {
      name: "Meera Devi",
      specialty: "Embroidery",
      avatar: "https://static.wixstatic.com/media/d7d9fb_9dfc4bdbb00d4cf1afaed2d26c519eb1~mv2.png?originWidth=128&originHeight=128",
      followers: 756,
      posts: 28
    }
  ];

  // Filter posts based on search and category
  const filteredPosts = communityPosts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            className="font-heading text-4xl font-bold text-primary mb-4 uppercase tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ARTISAN COMMUNITY
          </motion.h1>
          <motion.p
            className="font-paragraph text-lg text-primary/70 max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Connect with talented artisans, learn about traditional crafts, and discover the stories behind authentic Indian art
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              size="lg"
              className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Share Your Story
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search and Filter */}
            <Card className="border-0">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Featured Artists */}
            <Card className="border-0">
              <CardHeader>
                <h3 className="font-heading font-bold text-lg text-primary">Featured Artists</h3>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  {featuredArtists.map((artist, index) => (
                    <motion.div
                      key={artist.name}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={artist.avatar} alt={artist.name} />
                        <AvatarFallback>{artist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-paragraph font-medium text-primary text-sm">
                          {artist.name}
                        </h4>
                        <p className="font-paragraph text-xs text-primary/60">
                          {artist.specialty}
                        </p>
                        <p className="font-paragraph text-xs text-primary/50">
                          {artist.followers} followers • {artist.posts} posts
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="border-0 bg-neonaccent">
              <CardContent className="p-4 text-center">
                <h3 className="font-heading font-bold text-lg text-primary mb-2">Community Stats</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-heading text-2xl font-bold text-primary">2,847</span>
                    <p className="font-paragraph text-sm text-primary/80">Active Artisans</p>
                  </div>
                  <div>
                    <span className="font-heading text-2xl font-bold text-primary">15,623</span>
                    <p className="font-paragraph text-sm text-primary/80">Stories Shared</p>
                  </div>
                  <div>
                    <span className="font-heading text-2xl font-bold text-primary">89,456</span>
                    <p className="font-paragraph text-sm text-primary/80">Community Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="stories">Stories</TabsTrigger>
                <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>

              <TabsContent value="stories" className="space-y-6">
                {filteredPosts
                  .filter(post => activeTab === 'stories' ? ['story', 'behind-scenes'].includes(post.type) : true)
                  .map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-0 hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-0">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                            <div className="md:col-span-1">
                              <Image
                                src={post.image}
                                alt={post.title}
                                width={400}
                                className="w-full h-48 md:h-full object-cover rounded-l-lg"
                              />
                            </div>
                            <div className="md:col-span-2 p-6">
                              <div className="flex items-center space-x-3 mb-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                  <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-paragraph font-medium text-primary text-sm">
                                      {post.author.name}
                                    </h4>
                                    {post.author.verified && (
                                      <Badge variant="secondary" className="bg-neonaccent text-primary text-xs">
                                        Verified
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="font-paragraph text-xs text-primary/60">
                                    {post.author.role}
                                  </p>
                                </div>
                              </div>

                              <h2 className="font-heading text-xl font-bold text-primary mb-2 hover:text-neonaccent transition-colors cursor-pointer">
                                {post.title}
                              </h2>
                              <p className="font-paragraph text-primary/70 mb-3 line-clamp-2">
                                {post.excerpt}
                              </p>

                              <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs border-primary/20 text-primary/70"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-primary/60">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-paragraph">
                                      {new Date(post.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <span className="font-paragraph">{post.readTime}</span>
                                </div>

                                <div className="flex items-center space-x-4">
                                  <button className="flex items-center space-x-1 text-primary/60 hover:text-red-500 transition-colors">
                                    <Heart className="w-4 h-4" />
                                    <span className="font-paragraph text-sm">{post.likes}</span>
                                  </button>
                                  <button className="flex items-center space-x-1 text-primary/60 hover:text-primary transition-colors">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="font-paragraph text-sm">{post.comments}</span>
                                  </button>
                                  <button className="flex items-center space-x-1 text-primary/60 hover:text-primary transition-colors">
                                    <Share2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </TabsContent>

              <TabsContent value="tutorials" className="space-y-6">
                {filteredPosts
                  .filter(post => post.type === 'tutorial')
                  .map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-0 hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-0">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                            <div className="md:col-span-1">
                              <Image
                                src={post.image}
                                alt={post.title}
                                width={400}
                                className="w-full h-48 md:h-full object-cover rounded-l-lg"
                              />
                            </div>
                            <div className="md:col-span-2 p-6">
                              <div className="flex items-center space-x-3 mb-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                  <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-paragraph font-medium text-primary text-sm">
                                      {post.author.name}
                                    </h4>
                                    {post.author.verified && (
                                      <Badge variant="secondary" className="bg-neonaccent text-primary text-xs">
                                        Verified
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="font-paragraph text-xs text-primary/60">
                                    {post.author.role}
                                  </p>
                                </div>
                              </div>

                              <h2 className="font-heading text-xl font-bold text-primary mb-2 hover:text-neonaccent transition-colors cursor-pointer">
                                {post.title}
                              </h2>
                              <p className="font-paragraph text-primary/70 mb-3 line-clamp-2">
                                {post.excerpt}
                              </p>

                              <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs border-primary/20 text-primary/70"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-primary/60">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-paragraph">
                                      {new Date(post.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <span className="font-paragraph">{post.readTime}</span>
                                </div>

                                <div className="flex items-center space-x-4">
                                  <button className="flex items-center space-x-1 text-primary/60 hover:text-red-500 transition-colors">
                                    <Heart className="w-4 h-4" />
                                    <span className="font-paragraph text-sm">{post.likes}</span>
                                  </button>
                                  <button className="flex items-center space-x-1 text-primary/60 hover:text-primary transition-colors">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="font-paragraph text-sm">{post.comments}</span>
                                  </button>
                                  <button className="flex items-center space-x-1 text-primary/60 hover:text-primary transition-colors">
                                    <Share2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </TabsContent>

              <TabsContent value="discussions" className="space-y-6">
                {filteredPosts
                  .filter(post => post.type === 'discussion')
                  .map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-0 hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={post.author.avatar} alt={post.author.name} />
                              <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-paragraph font-medium text-primary">
                                  {post.author.name}
                                </h4>
                                {post.author.verified && (
                                  <Badge variant="secondary" className="bg-neonaccent text-primary text-xs">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <p className="font-paragraph text-sm text-primary/60">
                                {post.author.role}
                              </p>
                            </div>
                          </div>

                          <h2 className="font-heading text-xl font-bold text-primary mb-3 hover:text-black transition-colors cursor-pointer">
                            {post.title}
                          </h2>
                          <p className="font-paragraph text-primary/70 mb-4">
                            {post.excerpt}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs border-primary/20 text-primary/70"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-primary/60">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span className="font-paragraph">
                                  {new Date(post.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              <button className="flex items-center space-x-1 text-primary/60 hover:text-red-500 transition-colors">
                                <Heart className="w-4 h-4" />
                                <span className="font-paragraph text-sm">{post.likes}</span>
                              </button>
                              <button className="flex items-center space-x-1 text-primary/60 hover:text-primary transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                <span className="font-paragraph text-sm">{post.comments}</span>
                              </button>
                              <Button size="sm" variant="outline">
                                Join Discussion
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                {filteredPosts
                  .filter(post => post.type === 'event')
                  .map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-0 hover:shadow-lg transition-shadow duration-300 bg-gradient-to-r from-neonaccent/10 to-transparent">
                        <CardContent className="p-0">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                            <div className="md:col-span-1">
                              <Image
                                src={post.image}
                                alt={post.title}
                                width={400}
                                className="w-full h-48 md:h-full object-cover rounded-l-lg"
                              />
                            </div>
                            <div className="md:col-span-2 p-6">
                              <div className="flex items-center space-x-3 mb-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                  <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-paragraph font-medium text-primary text-sm">
                                      {post.author.name}
                                    </h4>
                                    <Badge variant="secondary" className="bg-neonaccent text-primary text-xs">
                                      Event Host
                                    </Badge>
                                  </div>
                                  <p className="font-paragraph text-xs text-primary/60">
                                    {post.author.role}
                                  </p>
                                </div>
                              </div>

                              <h2 className="font-heading text-xl font-bold text-primary mb-2 hover:text-neonaccent transition-colors cursor-pointer">
                                {post.title}
                              </h2>
                              <p className="font-paragraph text-primary/70 mb-3 line-clamp-2">
                                {post.excerpt}
                              </p>

                              <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs border-primary/20 text-primary/70"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-primary/60">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-paragraph">
                                      {new Date(post.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                  <button className="flex items-center space-x-1 text-primary/60 hover:text-red-500 transition-colors">
                                    <Heart className="w-4 h-4" />
                                    <span className="font-paragraph text-sm">{post.likes}</span>
                                  </button>
                                  <Button size="sm" className="bg-neonaccent text-primary hover:bg-neonaccent/90">
                                    Register Now
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}