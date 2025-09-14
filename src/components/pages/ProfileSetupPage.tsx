import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMember } from '@/integrations';
import { useToast } from '@/hooks/use-toast';
import { Camera, MapPin, User, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { member } = useMember();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: member?.contact?.firstName || '',
    lastName: member?.contact?.lastName || '',
    phone: member?.contact?.phones?.[0] || '',
    bio: '',
    specialization: '',
    experience: '',
    location: '',
    city: '',
    state: '',
    pincode: '',
    portfolio: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      website: ''
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const craftSpecializations = [
    'Madhubani Painting',
    'Warli Art',
    'Pottery',
    'Metal Craft',
    'Embroidery',
    'Jewelry Making',
    'Wood Carving',
    'Textile Weaving',
    'Stone Carving',
    'Other'
  ];

  const experienceLevels = [
    '1-2 years',
    '3-5 years',
    '6-10 years',
    '10+ years'
  ];

  const indianStates = [
    'Andhra Pradesh', 'Bihar', 'Gujarat', 'Karnataka', 'Kerala', 
    'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal'
  ];

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.phone;
      case 2:
        return formData.specialization && formData.experience && formData.bio;
      case 3:
        return formData.city && formData.state;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast({
        title: "Please fill in all required fields",
        description: "Complete the current step before proceeding.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Please complete all required fields",
        description: "Fill in all required information before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to save profile
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Profile setup data:', formData);
      
      toast({
        title: "Profile setup complete!",
        description: "Welcome to the DOTS artisan community.",
      });
      
      navigate('/copilot');
    } catch (error) {
      toast({
        title: "Failed to save profile",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-neonaccent mx-auto mb-3" />
              <h2 className="font-heading text-xl font-bold text-primary">Personal Information</h2>
              <p className="font-paragraph text-primary/70">Tell us about yourself</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="font-heading font-medium text-primary">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="font-heading font-medium text-primary">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone" className="font-heading font-medium text-primary">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Camera className="w-12 h-12 text-neonaccent mx-auto mb-3" />
              <h2 className="font-heading text-xl font-bold text-primary">Craft Information</h2>
              <p className="font-paragraph text-primary/70">Share your artistic expertise</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="specialization" className="font-heading font-medium text-primary">
                  Craft Specialization *
                </Label>
                <Select value={formData.specialization} onValueChange={(value) => handleInputChange('specialization', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your craft" />
                  </SelectTrigger>
                  <SelectContent>
                    {craftSpecializations.map((craft) => (
                      <SelectItem key={craft} value={craft}>
                        {craft}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experience" className="font-heading font-medium text-primary">
                  Experience Level *
                </Label>
                <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="bio" className="font-heading font-medium text-primary">
                About Your Craft *
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about your craft, techniques, and what makes your work unique..."
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="portfolio" className="font-heading font-medium text-primary">
                Portfolio Website (Optional)
              </Label>
              <Input
                id="portfolio"
                value={formData.portfolio}
                onChange={(e) => handleInputChange('portfolio', e.target.value)}
                placeholder="https://your-portfolio.com"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 text-neonaccent mx-auto mb-3" />
              <h2 className="font-heading text-xl font-bold text-primary">Location & Contact</h2>
              <p className="font-paragraph text-primary/70">Help customers find you</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="font-heading font-medium text-primary">
                  City *
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter your city"
                />
              </div>
              <div>
                <Label htmlFor="state" className="font-heading font-medium text-primary">
                  State *
                </Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="pincode" className="font-heading font-medium text-primary">
                PIN Code (Optional)
              </Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                placeholder="Enter PIN code"
              />
            </div>
            
            <div className="space-y-4">
              <Label className="font-heading font-medium text-primary">
                Social Media (Optional)
              </Label>
              <div className="space-y-3">
                <Input
                  value={formData.socialMedia.instagram}
                  onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                  placeholder="Instagram username"
                />
                <Input
                  value={formData.socialMedia.facebook}
                  onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                  placeholder="Facebook page"
                />
                <Input
                  value={formData.socialMedia.website}
                  onChange={(e) => handleInputChange('socialMedia.website', e.target.value)}
                  placeholder="Personal website"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-heading text-3xl font-bold text-primary mb-2">
            Complete Your Artisan Profile
          </h1>
          <p className="font-paragraph text-primary/70">
            Help customers discover your unique craft and story
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step <= currentStep 
                    ? 'bg-neonaccent text-primary' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < totalSteps && (
                  <div className={`w-16 h-1 mx-2 transition-all ${
                    step < currentStep ? 'bg-neonaccent' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <span className="font-paragraph text-sm text-primary/60">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              {renderStep()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="font-heading font-medium"
                >
                  Previous
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}