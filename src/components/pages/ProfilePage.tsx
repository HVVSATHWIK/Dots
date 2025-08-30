import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Heart, Edit, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMember } from '@/integrations';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { member } = useMember();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: member?.contact?.firstName || '',
    lastName: member?.contact?.lastName || '',
    nickname: member?.profile?.nickname || '',
    email: member?.loginEmail || '',
    phone: member?.contact?.phones?.[0] || '',
    bio: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Sample order history
  const orders = [
    {
      id: 'ORD-2024-001',
      date: '2024-01-20',
      status: 'Delivered',
      total: 7200,
      items: [
        {
          name: 'Handpainted Madhubani Art',
          artist: 'Priya Sharma',
          image: 'https://static.wixstatic.com/media/d7d9fb_5cfd34919f104f608e9aaec1e6bb70e4~mv2.png?originWidth=128&originHeight=128',
          price: 2500,
          quantity: 1
        },
        {
          name: 'Brass Ganesha Sculpture',
          artist: 'Rajesh Kumar',
          image: 'https://static.wixstatic.com/media/d7d9fb_e728ae46c79040c69c3029351c7d49d8~mv2.png?originWidth=128&originHeight=128',
          price: 4200,
          quantity: 1
        }
      ]
    },
    {
      id: 'ORD-2024-002',
      date: '2024-01-15',
      status: 'In Transit',
      total: 3200,
      items: [
        {
          name: 'Terracotta Vase Set',
          artist: 'Amit Patel',
          image: 'https://static.wixstatic.com/media/d7d9fb_ef9d4550b6b146208cb66072055dda89~mv2.png?originWidth=128&originHeight=128',
          price: 3200,
          quantity: 1
        }
      ]
    },
    {
      id: 'ORD-2024-003',
      date: '2024-01-10',
      status: 'Processing',
      total: 1800,
      items: [
        {
          name: 'Embroidered Wall Hanging',
          artist: 'Meera Devi',
          image: 'https://static.wixstatic.com/media/d7d9fb_8e55e071bfab44bea2a245180d059d1e~mv2.png?originWidth=128&originHeight=128',
          price: 1800,
          quantity: 1
        }
      ]
    }
  ];

  // Sample wishlist
  const wishlist = [
    {
      id: 1,
      name: 'Warli Art Canvas',
      artist: 'Deepak Tribal',
      price: 2200,
      originalPrice: 2800,
      image: 'https://static.wixstatic.com/media/d7d9fb_c4f7592c8deb4549bf6418c8b27ca31d~mv2.png?originWidth=256&originHeight=192',
      inStock: true
    },
    {
      id: 2,
      name: 'Silver Jewelry Set',
      artist: 'Kavita Singh',
      price: 5500,
      originalPrice: 6500,
      image: 'https://static.wixstatic.com/media/d7d9fb_c85b094ce787472dbf494bf395bba5fc~mv2.png?originWidth=256&originHeight=192',
      inStock: true
    },
    {
      id: 3,
      name: 'Wooden Elephant Figurine',
      artist: 'Suresh Reddy',
      price: 1500,
      originalPrice: 1800,
      image: 'https://static.wixstatic.com/media/d7d9fb_d4adc63553bc4e7da26ae94e177fe87e~mv2.png?originWidth=256&originHeight=192',
      inStock: false
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    // Here you would typically save the profile data to your backend
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const wishlistCount = wishlist.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            className="font-heading text-3xl font-bold text-primary mb-2 uppercase tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            My Profile
          </motion.h1>
          <motion.p
            className="font-paragraph text-primary/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Manage your account settings and view your order history
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0">
                <CardContent className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage 
                        src={member?.profile?.photo?.url} 
                        alt={member?.profile?.nickname || 'Profile'} 
                      />
                      <AvatarFallback className="text-2xl font-bold">
                        {member?.profile?.nickname?.[0] || member?.contact?.firstName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 p-2 bg-neonaccent rounded-full hover:bg-neonaccent/90 transition-colors">
                      <Camera className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                  
                  <h2 className="font-heading text-xl font-bold text-primary mb-1">
                    {member?.profile?.nickname || `${member?.contact?.firstName} ${member?.contact?.lastName}` || 'User'}
                  </h2>
                  <p className="font-paragraph text-sm text-primary/60 mb-4">
                    {member?.loginEmail}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="font-heading text-2xl font-bold text-primary">{totalOrders}</div>
                      <div className="font-paragraph text-xs text-primary/60">Orders</div>
                    </div>
                    <div>
                      <div className="font-heading text-2xl font-bold text-primary">₹{(totalSpent / 1000).toFixed(0)}K</div>
                      <div className="font-paragraph text-xs text-primary/60">Spent</div>
                    </div>
                    <div>
                      <div className="font-heading text-2xl font-bold text-primary">{wishlistCount}</div>
                      <div className="font-paragraph text-xs text-primary/60">Wishlist</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                  <Card className="border-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="font-heading text-xl font-bold text-primary">
                        Personal Information
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName" className="font-heading font-bold text-primary">
                              First Name
                            </Label>
                            <Input
                              id="firstName"
                              value={profileData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName" className="font-heading font-bold text-primary">
                              Last Name
                            </Label>
                            <Input
                              id="lastName"
                              value={profileData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="nickname" className="font-heading font-bold text-primary">
                              Nickname
                            </Label>
                            <Input
                              id="nickname"
                              value={profileData.nickname}
                              onChange={(e) => handleInputChange('nickname', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email" className="font-heading font-bold text-primary">
                              Email
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={profileData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="mt-1"
                              disabled
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="font-heading font-bold text-primary">
                              Phone
                            </Label>
                            <Input
                              id="phone"
                              value={profileData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="bio" className="font-heading font-bold text-primary">
                              Bio
                            </Label>
                            <Textarea
                              id="bio"
                              value={profileData.bio}
                              onChange={(e) => handleInputChange('bio', e.target.value)}
                              className="mt-1"
                              rows={3}
                              placeholder="Tell us about yourself..."
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Button
                              onClick={handleSaveProfile}
                              className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold"
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <User className="w-5 h-5 text-primary/60" />
                              <div>
                                <p className="font-paragraph text-sm text-primary/60">Full Name</p>
                                <p className="font-paragraph text-primary">
                                  {member?.contact?.firstName} {member?.contact?.lastName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Mail className="w-5 h-5 text-primary/60" />
                              <div>
                                <p className="font-paragraph text-sm text-primary/60">Email</p>
                                <p className="font-paragraph text-primary">{member?.loginEmail}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Phone className="w-5 h-5 text-primary/60" />
                              <div>
                                <p className="font-paragraph text-sm text-primary/60">Phone</p>
                                <p className="font-paragraph text-primary">
                                  {member?.contact?.phones?.[0] || 'Not provided'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-primary/60" />
                              <div>
                                <p className="font-paragraph text-sm text-primary/60">Member Since</p>
                                <p className="font-paragraph text-primary">
                                  {member?._createdDate ? new Date(member._createdDate).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <MapPin className="w-5 h-5 text-primary/60" />
                              <div>
                                <p className="font-paragraph text-sm text-primary/60">Location</p>
                                <p className="font-paragraph text-primary">Not provided</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="space-y-6">
                  <Card className="border-0">
                    <CardHeader>
                      <CardTitle className="font-heading text-xl font-bold text-primary">
                        Order History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {orders.map((order, index) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="border border-gray-200">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h3 className="font-heading font-bold text-lg text-primary">
                                      Order {order.id}
                                    </h3>
                                    <p className="font-paragraph text-sm text-primary/60">
                                      Placed on {new Date(order.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <Badge className={getStatusColor(order.status)}>
                                      {order.status}
                                    </Badge>
                                    <p className="font-heading font-bold text-lg text-primary mt-1">
                                      ₹{order.total.toLocaleString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {order.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex items-center space-x-3">
                                      <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={60}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-paragraph font-medium text-primary text-sm truncate">
                                          {item.name}
                                        </h4>
                                        <p className="font-paragraph text-xs text-primary/60">
                                          by {item.artist}
                                        </p>
                                        <p className="font-paragraph text-xs text-primary/80">
                                          ₹{item.price.toLocaleString()} × {item.quantity}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                  <div className="flex space-x-2">
                                    {order.status === 'Delivered' && (
                                      <Button variant="outline" size="sm">
                                        Reorder
                                      </Button>
                                    )}
                                    <Button variant="outline" size="sm">
                                      Track Order
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Wishlist Tab */}
                <TabsContent value="wishlist" className="space-y-6">
                  <Card className="border-0">
                    <CardHeader>
                      <CardTitle className="font-heading text-xl font-bold text-primary">
                        My Wishlist ({wishlist.length} items)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="border-0 hover:shadow-lg transition-shadow duration-300">
                              <CardContent className="p-0">
                                <div className="relative overflow-hidden rounded-t-lg">
                                  <Link to={`/product/${item.id}`}>
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      width={300}
                                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                  </Link>
                                  <button className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                                    <Heart className="w-4 h-4 fill-current" />
                                  </button>
                                  {!item.inStock && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                      <Badge variant="destructive">Out of Stock</Badge>
                                    </div>
                                  )}
                                </div>

                                <div className="p-4">
                                  <Link to={`/product/${item.id}`}>
                                    <h3 className="font-heading font-bold text-lg text-primary mb-1 hover:text-black transition-colors">
                                      {item.name}
                                    </h3>
                                  </Link>
                                  <p className="font-paragraph text-sm text-primary/60 mb-2">
                                    by {item.artist}
                                  </p>

                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-heading font-bold text-lg text-primary">
                                        ₹{item.price.toLocaleString()}
                                      </span>
                                      <span className="font-paragraph text-sm text-primary/50 line-through">
                                        ₹{item.originalPrice.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>

                                  <Button
                                    size="sm"
                                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                    disabled={!item.inStock}
                                  >
                                    {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <Card className="border-0">
                    <CardHeader>
                      <CardTitle className="font-heading text-xl font-bold text-primary">
                        Account Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-heading font-bold text-lg text-primary">Notifications</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-paragraph font-medium text-primary">Email Notifications</p>
                              <p className="font-paragraph text-sm text-primary/60">Receive updates about your orders and new products</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-paragraph font-medium text-primary">SMS Notifications</p>
                              <p className="font-paragraph text-sm text-primary/60">Get order updates via SMS</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-heading font-bold text-lg text-primary">Privacy</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-paragraph font-medium text-primary">Data Export</p>
                              <p className="font-paragraph text-sm text-primary/60">Download your account data</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Export
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-paragraph font-medium text-primary">Delete Account</p>
                              <p className="font-paragraph text-sm text-primary/60">Permanently delete your account and data</p>
                            </div>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}