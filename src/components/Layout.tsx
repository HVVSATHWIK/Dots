import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image } from '@/components/ui/image';
import { useMember } from '@/integrations';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { member, isAuthenticated, isLoading, actions } = useMember();

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
      <header className="bg-primary text-primary-foreground sticky top-0 z-50">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#a6d608]">
                <Image
                  src="https://static.wixstatic.com/media/d7d9fb_1971b31325f24d11889c078816a754de~mv2.png#originWidth=402&originHeight=288"
                  alt="DOTS Logo"
                  width={24}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <span className="font-heading font-bold text-xl">DOTS</span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for artworks, artists, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-12 py-2 bg-background text-foreground border-0 rounded-full"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full text-primary hover:bg-neonaccent/90 bg-neon"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navigation.slice(1, 5).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-paragraph hover:text-neonaccent transition-colors ${
                    location.pathname === item.href ? 'text-neonaccent' : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <Link to="/wishlist" className="hidden sm:block">
                <Heart className="w-5 h-5 hover:text-neonaccent transition-colors" />
              </Link>
              <Link to="/cart" className="relative">
                <ShoppingCart className="w-5 h-5 hover:text-neonaccent transition-colors" />
                <span className="absolute -top-2 -right-2 bg-neonaccent text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  0
                </span>
              </Link>
              
              {isLoading ? (
                <div className="w-8 h-8 bg-secondary rounded-full animate-pulse" />
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Link to="/profile" className="hidden sm:block">
                    <div className="w-8 h-8 bg-neonaccent rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">
                        {member?.profile?.nickname?.[0] || member?.contact?.firstName?.[0] || 'U'}
                      </span>
                    </div>
                  </Link>
                  <Button
                    onClick={actions.logout}
                    variant="ghost"
                    size="sm"
                    className="hidden sm:block text-primary-foreground hover:text-neonaccent"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => navigate('/signup')}
                    variant="outline"
                    size="sm"
                    className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    Join DOTS
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground hover:text-neonaccent"
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
                className="lg:hidden text-primary-foreground"
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
                  className="w-full pl-4 pr-12 py-2 bg-background text-foreground border-0 rounded-full"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-neonaccent text-primary hover:bg-neonaccent/90"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-primary border-t border-primary-foreground/10">
            <div className="max-w-[120rem] mx-auto px-4 py-4">
              <nav className="space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block text-sm font-paragraph hover:text-neonaccent transition-colors ${
                      location.pathname === item.href ? 'text-neonaccent' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <Link
                    to="/profile"
                    className="block text-sm font-paragraph hover:text-neonaccent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => { setIsMenuOpen(false); navigate('/signup'); }}>Join DOTS</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setIsMenuOpen(false); navigate('/login'); }}>Sign In</Button>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>
      {/* Main Content */}
      <main>{children}</main>
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-neonaccent rounded-full flex items-center justify-center">
                  <span className="text-primary font-heading font-bold text-lg">D</span>
                </div>
                <span className="font-heading font-bold text-xl">DOTS</span>
              </div>
              <p className="font-paragraph text-sm text-primary-foreground/80">
                Connecting Arts to Hearts - Bridging Indian artisans with the world through authentic handcrafted treasures.
              </p>
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg mb-4">Explore</h3>
              <ul className="space-y-2">
                <li><Link to="/discover" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Discover Art</Link></li>
                <li><Link to="/themes" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Themes</Link></li>
                <li><Link to="/custom-requests" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Custom Requests</Link></li>
                <li><Link to="/community" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Community</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="font-paragraph text-sm hover:text-neonaccent transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Contact</Link></li>
                <li><Link to="/help" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Help Center</Link></li>
                <li><Link to="/shipping" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Shipping Info</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg mb-4">For Artisans</h3>
              <ul className="space-y-2">
                <li><Link to="/sell" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Become a Seller</Link></li>
                <li><Link to="/artist-resources" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Resources</Link></li>
                <li><Link to="/success-stories" className="font-paragraph text-sm hover:text-neonaccent transition-colors">Success Stories</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center">
            <p className="font-paragraph text-sm text-primary-foreground/60">
              © 2024 Dots - Connecting Arts to Hearts. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}