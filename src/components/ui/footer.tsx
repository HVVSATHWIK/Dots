import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  MapPin, 
  Phone,
  Heart 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  const footerLinks = {
    platform: [
      { name: 'Discover Art', href: '/discover' },
      { name: 'Themes', href: '/themes' },
      { name: 'Custom Requests', href: '/custom-requests' },
      { name: 'Community', href: '/community' },
    ],
    artisans: [
      { name: 'Become a Seller', href: '/sell' },
      { name: 'AI Copilot', href: '/copilot' },
      { name: 'Artisan Guide', href: '/about#for-artisans' },
      { name: 'Success Stories', href: '/community#stories' },
    ],
    support: [
      { name: 'About DOTS', href: '/about' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Help Center', href: '/help' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'Youtube', icon: Youtube, href: '#' },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <Logo variant="light" size="lg" />
            </Link>
            <p className="font-paragraph text-primary-foreground/80 mb-6 text-sm leading-relaxed max-w-md">
              DOTS connects authentic Indian artisans with art lovers worldwide. 
              Discover handcrafted treasures, support traditional crafts, and be part of 
              preserving India's rich cultural heritage.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-neonaccent" />
                <span className="font-paragraph">hello@dots.art</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-neonaccent" />
                <span className="font-paragraph">+91 (Support coming soon)</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-3 text-neonaccent" />
                <span className="font-paragraph">India & Worldwide</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-neonaccent">
              Platform
            </h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="font-paragraph text-sm text-primary-foreground/80 hover:text-neonaccent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Artisans */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-neonaccent">
              For Artisans
            </h3>
            <ul className="space-y-3">
              {footerLinks.artisans.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="font-paragraph text-sm text-primary-foreground/80 hover:text-neonaccent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Info */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-neonaccent">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="font-paragraph text-sm text-primary-foreground/80 hover:text-neonaccent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="font-heading font-bold text-lg mb-2">Stay Connected</h3>
            <p className="font-paragraph text-primary-foreground/80 text-sm mb-4">
              Get updates on new artisans, collections, and platform features
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-md text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-neonaccent focus:border-transparent"
              />
              <Button 
                className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-primary-foreground/10">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center text-sm font-paragraph text-primary-foreground/60">
              <span>© 2024 DOTS.</span>
              <Heart className="w-4 h-4 mx-2 text-neonaccent" />
              <span>Made for artisans, by technology</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-primary-foreground/60 hover:text-neonaccent transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}