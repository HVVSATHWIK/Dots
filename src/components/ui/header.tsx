import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { LanguageSelector } from '@/components/ui/language-selector';
import { 
  Menu, 
  X, 
  User, 
  Search, 
  Heart, 
  ShoppingCart,
  LogOut,
  Settings,
  Palette,
  Store
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { useMember } from '@/integrations';
import { useTranslation } from 'react-i18next';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, member, actions } = useMember();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navigation = [
    { name: t('nav.home'), href: '/', current: location.pathname === '/' },
    { name: t('nav.discover'), href: '/discover', current: location.pathname === '/discover' },
    { name: t('nav.themes'), href: '/themes', current: location.pathname === '/themes' },
    { name: t('nav.community'), href: '/community', current: location.pathname === '/community' },
    { name: t('nav.about'), href: '/about', current: location.pathname === '/about' },
  ];

  const handleLogout = async () => {
    try {
      await actions.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`font-heading text-sm font-medium transition-colors hover:text-neonaccent ${
                  item.current ? 'text-neonaccent' : 'text-primary/80'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side - Auth & User Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Search - Desktop only */}
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Search className="w-4 h-4" />
            </Button>

            {isAuthenticated ? (
              <>
                {/* Authenticated User Actions */}
                <Button variant="ghost" size="sm" className="relative">
                  <Heart className="w-4 h-4" />
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-neonaccent text-primary"
                  >
                    0
                  </Badge>
                </Button>
                
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-neonaccent text-primary"
                  >
                    0
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:block font-paragraph text-sm">
                        {(member?.contact?.firstName || member?.profile?.nickname || t('nav.profile'))}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-2">
                      <p className="font-heading text-sm font-medium">{member?.contact?.firstName} {member?.contact?.lastName}</p>
                      <p className="font-paragraph text-xs text-muted-foreground">{member?.loginEmail}</p>
                      {member?.role && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {member.role === 'artisan' ? t('role.artisan') : t('role.buyer')}
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('nav.profile')}
                      </Link>
                    </DropdownMenuItem>
                    {member?.role === 'artisan' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/copilot" className="flex items-center">
                            <Palette className="mr-2 h-4 w-4" />
                            Copilot (AI Tools)
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard" className="flex items-center">
                            <Store className="mr-2 h-4 w-4" />
                            {t('nav.dashboard')}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Non-authenticated Actions */}
                <Button asChild variant="ghost" className="font-heading">
                  <Link to="/login">{t('nav.login')}</Link>
                </Button>
                <Button 
                  asChild 
                  className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold"
                >
                  <Link to="/signup">{t('nav.signup')}</Link>
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 font-heading text-sm font-medium rounded-md transition-colors ${
                    item.current 
                      ? 'bg-neonaccent/10 text-neonaccent' 
                      : 'text-primary/80 hover:text-neonaccent hover:bg-neonaccent/5'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile-specific actions */}
              <div className="border-t border-border mt-4 pt-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-2 font-heading text-sm font-medium text-primary/80 hover:text-neonaccent rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="mr-3 w-4 h-4" />
                      {t('nav.profile')}
                    </Link>
                    {member?.role === 'artisan' && (
                      <Link
                        to="/copilot"
                        className="flex items-center px-3 py-2 font-heading text-sm font-medium text-primary/80 hover:text-neonaccent rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Palette className="mr-3 w-4 h-4" />
                        AI Copilot
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 font-heading text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md"
                    >
                      <LogOut className="mr-3 w-4 h-4" />
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-3 py-2 font-heading text-sm font-medium text-primary/80 hover:text-neonaccent rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-3 py-2 font-heading text-sm font-medium bg-neonaccent text-primary rounded-md hover:bg-neonaccent/90"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav.signup')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}