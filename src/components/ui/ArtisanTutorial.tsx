import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ArtisanTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const ArtisanTutorial: React.FC<ArtisanTutorialProps> = ({ isOpen, onClose, onComplete }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: t('tutorial.artisan.step1.title', 'Welcome to DOTS, Artisan!'),
      description: t('tutorial.artisan.step1.description', 'Showcase your craftsmanship to buyers worldwide. Let\'s set up your artisan profile and start selling your creations.'),
      icon: '🎨',
      action: null
    },
    {
      title: t('tutorial.artisan.step2.title', 'Complete Your Profile'),
      description: t('tutorial.artisan.step2.description', 'Add your story, expertise, and beautiful photos of your work. A complete profile attracts more buyers.'),
      icon: '👤',
      action: '/profile'
    },
    {
      title: t('tutorial.artisan.step3.title', 'Add Your Products'),
      description: t('tutorial.artisan.step3.description', 'Upload high-quality photos of your handmade items. Include detailed descriptions and pricing.'),
      icon: '📦',
      action: '/products'
    },
    {
      title: t('tutorial.artisan.step4.title', 'Manage Your Orders'),
      description: t('tutorial.artisan.step4.description', 'Track incoming orders, communicate with buyers, and ensure timely delivery of your beautiful creations.'),
      icon: '📋',
      action: '/orders'
    },
    {
      title: t('tutorial.artisan.step5.title', 'Grow Your Business'),
      description: t('tutorial.artisan.step5.description', 'Use analytics to understand what sells, respond to custom requests, and build lasting relationships with buyers.'),
      icon: '📈',
      action: '/analytics'
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{tutorialSteps[currentStep].icon}</div>
              <div>
                <h2 className="font-heading font-bold text-lg text-primary">
                  {tutorialSteps[currentStep].title}
                </h2>
                <div className="flex items-center space-x-1 mt-1">
                  {tutorialSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="font-paragraph text-primary/80 leading-relaxed">
              {tutorialSteps[currentStep].description}
            </p>

            {/* Progress Indicator */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-primary/60 mb-2">
                <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
                <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-green-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="text-primary/60 hover:text-primary"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="text-primary/60 hover:text-primary"
              >
                Skip Tutorial
              </Button>

              <Button
                onClick={nextStep}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {currentStep === tutorialSteps.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ArtisanTutorial;