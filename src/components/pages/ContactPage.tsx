import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Globe, Camera, Bird, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: ["support@dots-arts.com", "partnerships@dots-arts.com"],
      description: "Get in touch via email for any inquiries"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+91 98765 43210", "+91 87654 32109"],
      description: "Speak directly with our support team"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["123 Heritage Lane", "New Delhi, India 110001"],
      description: "Come visit our headquarters"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM"],
      description: "We're here to help during these hours"
    }
  ];

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Customer Support' },
    { value: 'artisan', label: 'Artisan Partnership' },
    { value: 'wholesale', label: 'Wholesale/Bulk Orders' },
    { value: 'media', label: 'Media & Press' },
    { value: 'feedback', label: 'Feedback & Suggestions' }
  ];

  const socialLinks = [
    { icon: Globe, name: 'Website', url: '#', color: 'hover:text-blue-600' },
    { icon: Camera, name: 'Instagram', url: '#', color: 'hover:text-pink-600' },
    { icon: Bird, name: 'X (Twitter)', url: '#', color: 'hover:text-blue-400' },
    { icon: Play, name: 'YouTube', url: '#', color: 'hover:text-red-600' }
  ];

  const faqs = [
    {
      question: "How can I become an artisan partner?",
      answer: "We welcome skilled artisans to join our platform. Please fill out the contact form with 'Artisan Partnership' as the category, and our team will guide you through the onboarding process."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy for most items. Products must be in original condition. Custom-made items may have different return terms."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to 25+ countries worldwide. Shipping costs and delivery times vary by location. Check our shipping page for detailed information."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account on our website."
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.category || !formData.message) {
      toast({
        title: "Please fill in all required fields",
        description: "All fields marked with * are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Contact form submitted:', formData);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
        message: ''
      });
      
      setIsSubmitted(true);
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      // Reset submitted state after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            GET IN TOUCH
          </motion.h1>
          <motion.p
            className="font-paragraph text-lg text-primary/70 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-heading text-2xl font-bold text-primary mb-6 uppercase tracking-wide">
                Contact Information
              </h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <motion.div
                      key={info.title}
                      className="flex items-start space-x-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="w-12 h-12 bg-neonaccent rounded-full flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg text-primary mb-1">
                          {info.title}
                        </h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="font-paragraph text-primary/80">
                            {detail}
                          </p>
                        ))}
                        <p className="font-paragraph text-sm text-primary/60 mt-1">
                          {info.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Social Media */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="font-heading text-xl font-bold text-primary mb-4 uppercase tracking-wide">
                Follow Us
              </h3>
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      className={`w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-primary transition-colors ${social.color}`}
                      title={social.name}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </motion.div>

            {/* Quick Contact */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-0 bg-neonaccent">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                    {isSubmitted ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Message Sent!
                      </>
                    ) : isSubmitting ? (
                    Need Immediate Help?
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <p className="font-paragraph text-sm text-primary/80 mb-4">
                    Chat with our support team for instant assistance
                  </p>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting || isSubmitted || !formData.name || !formData.email || !formData.subject || !formData.category || !formData.message}
                    className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold px-8 py-4 transition-all hover:scale-105"
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl font-bold text-primary uppercase tracking-wide">
                    Send Us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="font-heading font-bold text-primary">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          className="mt-1"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="font-heading font-bold text-primary">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="mt-1"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone" className="font-heading font-bold text-primary">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="mt-1"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category" className="font-heading font-bold text-primary">
                          Category *
                        </Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select category" />
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
                    </div>

                    <div>
                      <Label htmlFor="subject" className="font-heading font-bold text-primary">
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        required
                        className="mt-1"
                        placeholder="Brief subject of your message"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="font-heading font-bold text-primary">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        required
                        className="mt-1"
                        rows={6}
                        placeholder="Please provide details about your inquiry..."
                      />
                    </div>

                    <div className="text-center">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting || !formData.name || !formData.email || !formData.subject || !formData.category || !formData.message}
                        className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold px-8 py-4"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2" />
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                      <p className="font-paragraph text-sm text-primary/60 mt-3">
                        We'll respond within 24 hours
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="font-heading text-3xl font-bold text-primary mb-8 text-center uppercase tracking-wide">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Card className="border-0 bg-secondary h-full">
                    <CardContent className="p-6">
                      <h3 className="font-heading font-bold text-lg text-primary mb-3">
                        {faq.question}
                      </h3>
                      <p className="font-paragraph text-primary/70 leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Map Section */}
        <section className="mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="font-heading text-3xl font-bold text-primary mb-8 text-center uppercase tracking-wide">
              Find Us
            </h2>
            <Card className="border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full h-96 bg-secondary flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-primary/60 mx-auto mb-4" />
                    <h3 className="font-heading font-bold text-xl text-primary mb-2">
                      Visit Our Office
                    </h3>
                    <p className="font-paragraph text-primary/70">
                      123 Heritage Lane<br />
                      New Delhi, India 110001
                    </p>
                    <Button
                      size="sm"
                      className="mt-4 bg-neonaccent text-primary hover:bg-neonaccent/90"
                    >
                      Get Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
    </div>
  );
}