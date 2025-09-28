import { ArrowRight, Heart, Globe, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/icons';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const stats = [
    { number: "2,847", label: "Active Artisans", icon: Users },
    { number: "89,456", label: "Happy Customers", icon: Heart },
    { number: "156", label: "Cities Reached", icon: Globe },
    { number: "4.8", label: "Average Rating", icon: Award }
  ];

  const values: { title: string; description: string; icon: React.ReactNode }[] = [
    {
      title: 'Preserve Heritage',
      description: "We are committed to preserving India's rich cultural heritage by supporting traditional artisans and their time-honored crafts.",
      icon: <Icon name="building" size={40} className="text-primary" />
    },
    {
      title: 'Empower Artisans',
      description: 'Our platform provides artisans with direct access to global markets, ensuring fair compensation and sustainable livelihoods.',
      icon: <Icon name="target" size={40} className="text-primary" />
    },
    {
      title: 'Authentic Quality',
      description: 'Every piece on our platform is handcrafted using traditional techniques, ensuring authenticity and exceptional quality.',
      icon: <Icon name="sparkles" size={40} className="text-primary" />
    },
    {
      title: 'Global Connection',
      description: 'We bridge the gap between Indian artisans and art lovers worldwide, creating meaningful connections through craft.',
      icon: <Icon name="building" size={40} className="text-primary" />
    }
  ];

  const team = [
    {
      name: "Arjun Patel",
      role: "Founder & CEO",
      image: "https://static.wixstatic.com/media/d7d9fb_3f6fcee834cb463a9f50842e2ed1c9b3~mv2.png?originWidth=192&originHeight=192",
      bio: "Former tech executive turned cultural preservationist, passionate about connecting artisans with the world."
    },
    {
      name: "Priya Sharma",
      role: "Head of Artisan Relations",
      image: "https://static.wixstatic.com/media/d7d9fb_85c6860e77e54bb4a3bbbc5d3f0cb3b6~mv2.png?originWidth=192&originHeight=192",
      bio: "Art historian and cultural expert with 15+ years of experience working with traditional Indian crafts."
    },
    {
      name: "Rajesh Kumar",
      role: "Technology Director",
      image: "https://static.wixstatic.com/media/d7d9fb_ed46bf70dbc94bbea06defb3686eb2c0~mv2.png?originWidth=192&originHeight=192",
      bio: "Tech innovator focused on creating seamless digital experiences for artisans and customers alike."
    },
    {
      name: "Meera Devi",
      role: "Quality Assurance Lead",
      image: "https://static.wixstatic.com/media/d7d9fb_1d23af23d27a46a58b727ff290a561cf~mv2.png?originWidth=192&originHeight=192",
      bio: "Master craftsperson ensuring every piece meets our high standards of authenticity and quality."
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "The Beginning",
      description: "Founded with a vision to connect Indian artisans with global audiences"
    },
    {
      year: "2021",
      title: "First 100 Artisans",
      description: "Onboarded our first 100 artisans from 15 different states across India"
    },
    {
      year: "2022",
      title: "Global Expansion",
      description: "Expanded internationally, reaching customers in 25+ countries"
    },
    {
      year: "2023",
      title: "Community Growth",
      description: "Launched our community platform and reached 50,000+ active users"
    },
    {
      year: "2024",
      title: "Cultural Impact",
      description: "Recognized for preserving traditional crafts and empowering rural artisans"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <Image
          src="https://static.wixstatic.com/media/d7d9fb_30ad983af51a4157812cd7bd75c656cb~mv2.png?originWidth=1920&originHeight=704"
          alt="Indian artisans at work"
          width={1920}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <motion.h1
              className="font-heading text-5xl md:text-7xl font-bold mb-4 uppercase tracking-wider"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              OUR STORY
            </motion.h1>
            <motion.p
              className="font-paragraph text-xl md:text-2xl mb-8 text-white/90"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Connecting Arts to Hearts - Bridging tradition with innovation
            </motion.p>
          </div>
        </div>
      </section>

      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission Section */}
        <section className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-heading text-4xl font-bold text-primary mb-6 uppercase tracking-wide">
                Our Mission
              </h2>
              <p className="font-paragraph text-lg text-primary/80 mb-6 leading-relaxed">
                At Dots, we believe that every handcrafted piece tells a story - a story of tradition, 
                skill, and cultural heritage passed down through generations. Our mission is to preserve 
                these invaluable traditions while providing artisans with sustainable livelihoods and 
                global recognition.
              </p>
              <p className="font-paragraph text-lg text-primary/80 mb-8 leading-relaxed">
                We are more than just a marketplace; we are a bridge connecting the rich cultural 
                heritage of India with art lovers around the world. Through our platform, we ensure 
                that traditional crafts not only survive but thrive in the modern world.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold"
              >
                <Link to="/community">
                  Join Our Community
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Image
                src="https://static.wixstatic.com/media/d7d9fb_109bfe7afeba4ed698116de3daecde4a~mv2.png?originWidth=576&originHeight=576"
                alt="Artisan crafting traditional art"
                width={600}
                className="w-full rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-secondary rounded-lg">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-primary mb-4 uppercase tracking-wide">
              Our Impact in Numbers
            </h2>
            <p className="font-paragraph text-lg text-primary/70">
              See how we're making a difference in the artisan community
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-16 h-16 bg-neonaccent rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-3xl font-bold text-primary mb-2">
                    {stat.number}
                  </h3>
                  <p className="font-paragraph text-primary/70">
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-primary mb-4 uppercase tracking-wide">
              Our Core Values
            </h2>
            <p className="font-paragraph text-lg text-primary/70 max-w-2xl mx-auto">
              These principles guide everything we do and shape our commitment to artisans and customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 text-center">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{value.icon}</div>
                    <h3 className="font-heading font-bold text-xl text-primary mb-3">
                      {value.title}
                    </h3>
                    <p className="font-paragraph text-primary/70 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 bg-secondary rounded-lg">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-primary mb-4 uppercase tracking-wide">
              Our Journey
            </h2>
            <p className="font-paragraph text-lg text-primary/70">
              Key milestones in our mission to connect arts to hearts
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-neonaccent"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  className={`flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="w-1/2 px-6">
                    <Card className="border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-3">
                          <div className="w-12 h-12 bg-neonaccent rounded-full flex items-center justify-center mr-4">
                            <span className="font-heading font-bold text-primary">
                              {milestone.year.slice(-2)}
                            </span>
                          </div>
                          <h3 className="font-heading font-bold text-xl text-primary">
                            {milestone.title}
                          </h3>
                        </div>
                        <p className="font-paragraph text-primary/70">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-4 h-4 bg-neonaccent rounded-full border-4 border-background relative z-10"></div>
                  <div className="w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-primary mb-4 uppercase tracking-wide">
              Meet Our Team
            </h2>
            <p className="font-paragraph text-lg text-primary/70 max-w-2xl mx-auto">
              Passionate individuals dedicated to preserving cultural heritage and empowering artisans
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 text-center">
                  <CardContent className="p-6">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={200}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="font-heading font-bold text-xl text-primary mb-1">
                      {member.name}
                    </h3>
                    <p className="font-paragraph text-neonaccent font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="font-paragraph text-sm text-primary/70 leading-relaxed">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-12 text-center text-primary-foreground">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-heading text-3xl font-bold mb-4 uppercase tracking-wide">
                Join Our Mission
              </h2>
              <p className="font-paragraph text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                Whether you're an art lover, a cultural enthusiast, or an artisan yourself, 
                there's a place for you in our community. Help us preserve India's rich heritage 
                while supporting talented craftspeople.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold"
                >
                  <Link to="/discover">
                    Explore Artworks
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-heading font-bold"
                >
                  <Link to="/contact">
                    Get in Touch
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}