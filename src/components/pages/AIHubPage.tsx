import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Wand2, Bot, BarChart3, Palette, Images } from 'lucide-react';

export default function AIHubPage() {
  const { t } = useTranslation();
  const tools = [
    {
      title: t('aihub.tools.listingCopilot.title'),
      desc: t('aihub.tools.listingCopilot.desc'),
      icon: Bot,
      href: '/copilot',
      badge: t('aihub.badge.artisan'),
    },
    {
      title: t('aihub.tools.customImage.title'),
      desc: t('aihub.tools.customImage.desc'),
      icon: Images,
      href: '/custom-requests',
      badge: t('aihub.badge.all'),
    },
    {
      title: t('aihub.tools.aiRecommendations.title'),
      desc: t('aihub.tools.aiRecommendations.desc'),
      icon: Sparkles,
      href: '/discover',
      badge: t('aihub.badge.all'),
    },
    {
      title: t('aihub.tools.pricingOptimizer.title'),
      desc: t('aihub.tools.pricingOptimizer.desc'),
      icon: Palette,
      href: '/pricing-optimizer',
      badge: t('aihub.badge.artisan'),
    },
    {
      title: t('aihub.tools.strategyInsights.title'),
      desc: t('aihub.tools.strategyInsights.desc'),
      icon: BarChart3,
      href: '/analytics',
      badge: t('aihub.badge.artisan'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 gradient-bg-primary opacity-20" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent text-white shadow-soft mb-4">
              <Wand2 className="w-8 h-8" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-primary">{t('aihub.title')}</h1>
            <p className="font-paragraph text-primary/70 mt-3 max-w-2xl mx-auto">
              {t('aihub.lead')}
            </p>
            <div className="mt-6">
              <Button asChild className="btn-primary">
                <Link to="/copilot">{t('aihub.cta')}</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card key={tool.title} className="card-enhanced hover-glow">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center">
                    <tool.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-lg">{tool.title}</CardTitle>
                    <span className="text-xs font-paragraph text-muted-foreground">{tool.badge}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-paragraph text-primary/70 mb-4">{tool.desc}</p>
                  <Button asChild variant="outline" className="hover-lift">
                    <Link to={tool.href}>{t('aihub.open')}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}