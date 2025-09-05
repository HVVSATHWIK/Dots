import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image } from '@/components/ui/image';
import { useMember } from '@/integrations';
import AssistantWidget from '@/components/AssistantWidget';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { member, isAuthenticated, isLoading, actions } = useMember();
  const role = member?.role || 'buyer';

  // Dev-only fetch wrapper to surface non-JSON responses clearly in console
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as any;
    if (w.__dotsFetchPatched) return;
    const origFetch = window.fetch.bind(window);
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const res = await origFetch(...args);
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      const ct = res.headers.get('content-type') || '';
      const origJson = res.json.bind(res);
  (res as any).json = async () => {
        if (!ct.includes('application/json')) {
          try {
    const preview = await res
      .clone()
      .text()
      .then((t: string) => t.slice(0, 240))
      .catch(() => '');
            throw new SyntaxError(`Non-JSON response from ${url}. content-type=${ct}. preview=${preview}`);
          } catch (e) {
            throw e;
          }
        }
        return origJson();
      };
      return res;
    };
    w.__dotsFetchPatched = true;
    return () => { window.fetch = origFetch; w.__dotsFetchPatched = false; };
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Discover', href: '/discover' },
    { name: 'Themes', href: '/themes' },
    { name: 'Custom Requests', href: '/custom-requests' },
    { name: 'Community', href: '/community' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/discover?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#a6d608]">
                <Image
                  src="https://static.wixstatic.com/media/d7d9fb_1971b31325f24d11889c078816a754de~mv2.png#originWidth=402&originHeight=288"
                  alt="DOTS Logo"
                  width={24}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <span className="font-heading font-bold text-xl group-hover:text-neonaccent transition-colors">
                DOTS
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for artworks, artists, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-12 py-2 bg-background text-foreground border-0 rounded-full shadow-sm focus:shadow-md transition-shadow"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full text-primary hover:bg-neonaccent/90 bg-neonaccent transition-all hover:scale-105"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navigation.slice(1, 5).map((item) => {
                // Show limited navigation for non-authenticated users
                if (!isAuthenticated && !['Discover', 'About', 'Contact'].includes(item.name)) {
                  return null;
                }
                return (
                // Show limited navigation for non-authenticated users
                if (!isAuthenticated && !['Discover', 'About', 'Contact'].includes(item.name)) {
                  return null;
                }
                return (
                <Link
                  key={item.name}
                  to={!isAuthenticated && item.name === 'Discover' ? '/signup' : item.href}
                  className={`text-sm font-paragraph hover:text-neonaccent transition-colors relative group ${
                    location.pathname === item.href ? 'text-neonaccent' : ''
                  }`}
                >
                  {!isAuthenticated && item.name === 'Discover' ? 'Preview Artworks' : item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neonaccent transition-all group-hover:w-full" />
                </Link>
                );
              })}
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {role === 'buyer' && (
                <>
                  <button className="relative p-2 hover:bg-primary-foreground/10 rounded-full transition-colors">
                    <Bell className="w-5 h-5 hover:text-neonaccent transition-colors" />
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
                      3
                    </Badge>
                  </button>
                  <Link to="/wishlist" className="hidden sm:block">
                    <div className="relative p-2 hover:bg-primary-foreground/10 rounded-full transition-colors">
                      <Heart className="w-5 h-5 hover:text-neonaccent transition-colors" />
                    </div>
                  </Link>
                  <Link to="/cart" className="relative">
                    <div className="relative p-2 hover:bg-primary-foreground/10 rounded-full transition-colors">
                      <ShoppingCart className="w-5 h-5 hover:text-neonaccent transition-colors" />
                      <Badge className="absolute -top-1 -right-1 bg-neonaccent text-primary text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center font-bold">
                        2
                      </Badge>
                    </div>
                  </Link>
                </>
              )}

              {role === 'artisan' && (
                <Link to="/copilot" className="hidden sm:block">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary-foreground hover:text-neonaccent hover:bg-primary-foreground/10"
                  >
                    Seller Tools
                  </Button>
                </Link>
              )}
              
              {isLoading ? (
                <div className="w-10 h-10 bg-primary-foreground/20 rounded-full animate-pulse" />
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link to="/profile" className="hidden sm:block">
                    <div className="w-10 h-10 bg-neonaccent rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                      <span className="text-primary font-bold text-sm">
                        {member?.profile?.nickname?.[0] || member?.contact?.firstName?.[0] || 'U'}
                      </span>
                    </div>
                  </Link>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-medium text-primary-foreground/90">
                      {member?.profile?.nickname || member?.contact?.firstName || 'User'}
                    </span>
                    <Badge variant="secondary" className="bg-neonaccent text-primary text-xs">
                      {role}
                    </Badge>
                  </div>
                  <Button
                    onClick={actions.logout}
                    variant="ghost"
                    size="sm"
                    className="hidden sm:block text-primary-foreground hover:text-neonaccent hover:bg-primary-foreground/10"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/signup">
                    <Button
                      size="sm"
                      className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold hover:scale-105 transition-transform"
                    >
                      Join DOTS
                    </Button>
                  </Link>
                  <Button
                    onClick={actions.login}
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground hover:text-neonaccent hover:bg-primary-foreground/10"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search artworks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2 bg-background text-foreground border-0 rounded-full shadow-sm"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-neonaccent text-primary hover:bg-neonaccent/90 transition-all hover:scale-105"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-primary border-t border-primary-foreground/10"
            >
              <div className="max-w-[120rem] mx-auto px-4 py-6">
                <nav className="space-y-4">
                  {navigation.map((item) => (
                    // Show limited navigation for non-authenticated users
                    (!isAuthenticated && !['Home', 'Discover', 'About', 'Contact'].includes(item.name)) ? null : (
                    // Show limited navigation for non-authenticated users
                    (!isAuthenticated && !['Home', 'Discover', 'About', 'Contact'].includes(item.name)) ? null : (
                    <Link
                      key={item.name}
                      to={!isAuthenticated && item.name === 'Discover' ? '/signup' : item.href}
                      className={`block text-sm font-paragraph hover:text-neonaccent transition-colors py-2 px-3 rounded-lg hover:bg-primary-foreground/10 ${
                        location.pathname === item.href ? 'text-neonaccent bg-primary-foreground/10' : ''
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {!isAuthenticated && item.name === 'Discover' ? 'Preview Artworks' : item.name}
                    </Link>
                    )
                    )
                  ))}
                  
                  <div className="border-t border-primary-foreground/10 pt-4 mt-4">
                    {isAuthenticated ? (
                      <>
                        <Link
                          to="/profile"
                          className="block text-sm font-paragraph hover:text-neonaccent transition-colors py-2 px-3 rounded-lg hover:bg-primary-foreground/10"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            actions.logout();
                          }}
                          className="block w-full text-left text-sm font-paragraph hover:text-neonaccent transition-colors py-2 px-3 rounded-lg hover:bg-primary-foreground/10"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/signup"
                          className="block text-sm font-paragraph hover:text-neonaccent transition-colors py-2 px-3 rounded-lg hover:bg-primary-foreground/10"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Join DOTS
                        </Link>
                        <button
                          className="block w-full text-left text-sm font-paragraph hover:text-neonaccent transition-colors py-2 px-3 rounded-lg hover:bg-primary-foreground/10"
                          onClick={() => { 
                            setIsMenuOpen(false); 
                            actions.login(); 
                          }}
                        >
                          Sign In
                        </button>
                      </>
                    )}
                  </div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Global Assistant (hidden on auth routes) */}
      {!(location.pathname === '/login' || location.pathname === '/signup') && (
        <AssistantWidget />
      )}

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-auto">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-neonaccent rounded-full flex items-center justify-center">
                  <Image
                    src="https://static.wixstatic.com/media/d7d9fb_1971b31325f24d11889c078816a754de~mv2.png#originWidth=402&originHeight=288"
                    alt="DOTS Logo"
                    width={24}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="font-heading font-bold text-xl">DOTS</span>
              </div>
              <p className="font-paragraph text-sm text-primary-foreground/80 leading-relaxed max-w-xs">
                Connecting Arts to Hearts - Bridging Indian artisans with the world through authentic handcrafted treasures.
              </p>
              <div className="flex space-x-3">
                {['facebook', 'instagram', 'twitter', 'youtube'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-8 h-8 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-neonaccent hover:text-primary transition-all"
                  >
                    <span className="text-xs font-bold">{social[0].toUpperCase()}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg mb-4">Explore</h3>
              <ul className="space-y-3">
                <li><Link to="/discover" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Discover Art</Link></li>
                <li><Link to="/themes" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Themes</Link></li>
                <li><Link to="/custom-requests" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Custom Requests</Link></li>
                <li><Link to="/community" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Community</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-3">
                <li><Link to="/about" className="font-paragraph text-sm hover:text-neonaccent transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Contact</Link></li>
                <li><Link to="/help" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Help Center</Link></li>
                <li><Link to="/shipping" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Shipping Info</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg mb-4">For Artisans</h3>
              <ul className="space-y-3">
                <li><Link to="/sell" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Become a Seller</Link></li>
                <li><Link to="/artist-resources" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Resources</Link></li>
                <li><Link to="/success-stories" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Success Stories</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary-foreground/10 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="font-paragraph text-sm text-primary-foreground/60">
                © 2024 DOTS - Connecting Arts to Hearts. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link to="/terms" className="font-paragraph text-sm text-primary-foreground/60 hover:text-neonaccent transition-colors">
                  Terms
                </Link>
                <Link to="/privacy" className="font-paragraph text-sm text-primary-foreground/60 hover:text-neonaccent transition-colors">
                  Privacy
                </Link>
                <Link to="/cookies" className="font-paragraph text-sm text-primary-foreground/60 hover:text-neonaccent transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}