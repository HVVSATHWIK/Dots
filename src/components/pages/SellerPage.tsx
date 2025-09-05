import { Link } from 'react-router-dom';
import { TrendingUp, Users, Package, ArrowRight, Camera, FileText, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

export default function SellerPage() {

  const benefits = [
    {
      icon: <TrendingUp className="w-8 h-8 text-neonaccent" />,
      title: "Grow Your Business",
      description: "Reach thousands of customers worldwide and expand your artisan business beyond local markets."
    },
    {
      icon: <Users className="w-8 h-8 text-neonaccent" />,
      title: "Connect with Buyers",
      description: "Build relationships with art enthusiasts who appreciate authentic handcrafted items."
    },
    {
      icon: <Package className="w-8 h-8 text-neonaccent" />,
      title: "Easy Management",
      description: "Simple tools to manage your inventory, orders, and customer communications."
    },
    {
      icon: <DollarSign className="w-8 h-8 text-neonaccent" />,
      title: "Fair Pricing",
      description: "Set your own prices and keep 85% of every sale. No hidden fees or surprise charges."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Tell your story and showcase your craft heritage",
      icon: <FileText className="w-6 h-6" />
    },
    {
      number: "02", 
      title: "Upload Your Products",
      description: "Add high-quality photos and detailed descriptions",
      icon: <Camera className="w-6 h-6" />
    },
    {
      number: "03",
      title: "Start Selling",
      description: "Receive orders and connect with customers",
      icon: <Package className="w-6 h-6" />
    }
  ];

  const successStories = [
    {
      name: "Priya Sharma",
      craft: "Madhubani Painting",
      location: "Bihar",
      story: "Increased my monthly income by 300% and now ship my art worldwide.",
      image: "https://static.wixstatic.com/media/d7d9fb_8f7b6bc62c0643a0948abf7e1a98da03~mv2.png?originWidth=128&originHeight=128",
      sales: "500+ orders"
    },
    {
      name: "Rajesh Kumar", 
      craft: "Metal Craft",
      location: "Rajasthan",
      story: "Connected with international buyers and preserved traditional techniques.",
      image: "https://static.wixstatic.com/media/d7d9fb_31115c8a505d460da322690758fd7114~mv2.png?originWidth=128&originHeight=128",
      sales: "300+ orders"
    },
    {
      name: "Meera Devi",
      craft: "Embroidery",
      location: "Gujarat", 
      story: "Built a sustainable business while working from home.",
      image: "https://static.wixstatic.com/media/d7d9fb_9dfc4bdbb00d4cf1afaed2d26c519eb1~mv2.png?originWidth=128&originHeight=128",
      sales: "400+ orders"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-20">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-heading text-5xl font-bold mb-6 uppercase tracking-wide">
                BECOME A SELLER
              </h1>
              <p className="font-paragraph text-xl mb-8 text-primary-foreground/90">
                Transform your traditional craft into a sustainable business. Join DOTS and connect 
                with art lovers worldwide while preserving India's rich cultural heritage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold"
                  asChild
                >
                  <Link to="/signup">Get Started Now</Link>
                    Join as Artisan
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <Image
                src="https://static.wixstatic.com/media/d7d9fb_a7effd50e4ff402f9dec9b5e67b156d6~mv2.png?originWidth=600&originHeight=400"
                alt="Artisan at work"
                width={600}
                className="rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-primary mb-4 uppercase tracking-wide">
              WHY SELL WITH US?
            </h2>
            <p className="font-paragraph text-lg text-primary/70 max-w-2xl mx-auto">
              Join a platform designed specifically for Indian artisans and traditional craftspeople
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 text-center h-full">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      {benefit.icon}
                    </div>
                    <h3 className="font-heading font-bold text-lg text-primary mb-3">
                      {benefit.title}
                    </h3>
                    <p className="font-paragraph text-primary/70">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-secondary/20">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-primary mb-4 uppercase tracking-wide">
              HOW IT WORKS
            </h2>
            <p className="font-paragraph text-lg text-primary/70 max-w-2xl mx-auto">
              Getting started is simple. Follow these three easy steps to begin your selling journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <Card className="border-0 text-center h-full">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-neonaccent rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="font-heading font-bold text-2xl text-primary">
                        {step.number}
                      </span>
                    </div>
                    <div className="flex justify-center mb-4 text-primary">
                      {step.icon}
                    </div>
                    <h3 className="font-heading font-bold text-xl text-primary mb-3">
                      {step.title}
                    </h3>
                    <p className="font-paragraph text-primary/70">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-neonaccent" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-background">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-primary mb-4 uppercase tracking-wide">
              SUCCESS STORIES
            </h2>
            <p className="font-paragraph text-lg text-primary/70 max-w-2xl mx-auto">
              Hear from artisans who have transformed their craft into successful businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Image
                        src={story.image}
                        alt={story.name}
                        width={60}
                        className="w-15 h-15 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-heading font-bold text-lg text-primary">
                          {story.name}
                        </h3>
                        <p className="font-paragraph text-sm text-primary/60">
                          {story.craft} • {story.location}
                        </p>
                        <Badge variant="secondary" className="bg-neonaccent text-primary text-xs mt-1">
                          {story.sales}
                        </Badge>
                      </div>
                    </div>
                    <p className="font-paragraph text-primary/80 italic">
                      "{story.story}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16 bg-secondary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-primary mb-4 uppercase tracking-wide">
              START YOUR JOURNEY
            </h2>
            <p className="font-paragraph text-lg text-primary/70">
              Fill out this form to begin your seller application process
            </p>
          </div>

          <Card className="border-0">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-paragraph font-medium text-primary mb-2 block">
                      Full Name *
                    </label>
                    <Input placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label className="font-paragraph font-medium text-primary mb-2 block">
                      Email Address *
                    </label>
                    <Input type="email" placeholder="your.email@example.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-paragraph font-medium text-primary mb-2 block">
                      Phone Number *
                    </label>
                    <Input placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="font-paragraph font-medium text-primary mb-2 block">
                      State/Region *
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rajasthan">Rajasthan</SelectItem>
                        <SelectItem value="gujarat">Gujarat</SelectItem>
                        <SelectItem value="bihar">Bihar</SelectItem>
                        <SelectItem value="west-bengal">West Bengal</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="kerala">Kerala</SelectItem>
                        <SelectItem value="odisha">Odisha</SelectItem>
                        <SelectItem value="uttar-pradesh">Uttar Pradesh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="font-paragraph font-medium text-primary mb-2 block">
                    Craft Specialization *
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary craft" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paintings">Paintings</SelectItem>
                      <SelectItem value="pottery">Pottery</SelectItem>
                      <SelectItem value="embroidery">Embroidery</SelectItem>
                      <SelectItem value="jewelry">Jewelry</SelectItem>
                      <SelectItem value="metal-craft">Metal Craft</SelectItem>
                      <SelectItem value="wooden-crafts">Wooden Crafts</SelectItem>
                      <SelectItem value="textiles">Textiles</SelectItem>
                      <SelectItem value="ceramics">Ceramics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-paragraph font-medium text-primary mb-2 block">
                    Tell us about your craft *
                  </label>
                  <Textarea 
                    placeholder="Describe your craft, experience, and what makes your work unique..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="font-paragraph font-medium text-primary mb-2 block">
                    Years of Experience
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2">1-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="terms" className="rounded" />
                  <label htmlFor="terms" className="font-paragraph text-sm text-primary/70">
                    I agree to the <Link to="/terms" className="text-neonaccent hover:underline">Terms of Service</Link> and <Link to="/privacy" className=\"text-neonaccent hover:underline">Privacy Policy</Link>
                  </label>
                </div>

                <Button 
                  type="submit"
                  size="lg"
                  className="w-full bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold"
                >
                  Join as Artisan
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold mb-4 uppercase tracking-wide">
            READY TO START SELLING?
          </h2>
          <p className="font-paragraph text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join our community of successful artisans and start sharing your craft with the world today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold"
              asChild
            >
              <Link to="/copilot">Get Started Now</Link>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
