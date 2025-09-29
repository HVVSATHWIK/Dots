import { useState } from 'react';
import { Upload, FileImage, X, Send, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import * as React from 'react';
import { generateImage, captionImages } from '@/integrations/ai';

export default function CustomRequestsPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    artType: '',
    theme: '',
    description: '',
    budget: '',
    timeline: '',
    colorPreferences: [],
    size: '',
    occasion: '',
    additionalNotes: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [genImages, setGenImages] = useState<string[]>([]);
  const [genError, setGenError] = useState<string | null>(null);
  const [capLoading, setCapLoading] = useState(false);
  const [capError, setCapError] = useState<string | null>(null);
  const [captions, setCaptions] = useState<{
    title: string;
    shortCaption: string;
    tags: string[];
    materials: string[];
    techniques: string[];
    colors: string[];
    style?: string;
    suggestedPriceRange?: { min: number; max: number; currency?: string };
    confidence?: number;
  }[]>([]);

  const artTypes = [
    { value: 'painting', label: 'Painting' },
    { value: 'sculpture', label: 'Sculpture' },
    { value: 'pottery', label: 'Pottery' },
    { value: 'textiles', label: 'Textiles/Embroidery' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'wood-craft', label: 'Wood Craft' },
    { value: 'metal-craft', label: 'Metal Craft' },
    { value: 'other', label: 'Other' }
  ];

  const themes = [
    { value: 'traditional', label: 'Traditional Indian' },
    { value: 'modern', label: 'Modern/Contemporary' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'festival', label: 'Festival/Religious' },
    { value: 'nature', label: 'Nature/Landscape' },
    { value: 'portrait', label: 'Portrait' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'custom', label: 'Custom Design' }
  ];

  const budgetRanges = [
    { value: '1000-3000', label: '₹1,000 - ₹3,000' },
    { value: '3000-5000', label: '₹3,000 - ₹5,000' },
    { value: '5000-10000', label: '₹5,000 - ₹10,000' },
    { value: '10000-20000', label: '₹10,000 - ₹20,000' },
    { value: '20000+', label: '₹20,000+' }
  ];

  const timelines = [
    { value: '1-week', label: '1 Week' },
    { value: '2-weeks', label: '2 Weeks' },
    { value: '1-month', label: '1 Month' },
    { value: '2-months', label: '2 Months' },
    { value: '3-months', label: '3+ Months' }
  ];

  const colorOptions = [
    { id: 'red', name: 'Red', hex: '#EF4444' },
    { id: 'blue', name: 'Blue', hex: '#3B82F6' },
    { id: 'green', name: 'Green', hex: '#10B981' },
    { id: 'yellow', name: 'Yellow', hex: '#F59E0B' },
    { id: 'purple', name: 'Purple', hex: '#8B5CF6' },
    { id: 'orange', name: 'Orange', hex: '#F97316' },
    { id: 'pink', name: 'Pink', hex: '#EC4899' },
    { id: 'brown', name: 'Brown', hex: '#A3A3A3' },
    { id: 'black', name: 'Black', hex: '#000000' },
    { id: 'white', name: 'White', hex: '#FFFFFF' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleColorToggle = (colorId: string) => {
    setFormData(prev => ({
      ...prev,
      colorPreferences: prev.colorPreferences.includes(colorId)
        ? prev.colorPreferences.filter(id => id !== colorId)
        : [...prev.colorPreferences, colorId]
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types (only images)
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image. Please upload only image files (JPG, PNG, GIF, WebP).`,
          variant: "destructive",
        });
        return false;
      }
      
      // Check file size (max 10MB per file)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File too large", 
          description: `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)}MB. Please choose images under 10MB.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Check total file limit (max 5 files)
    setUploadedFiles(prev => {
      const newTotal = prev.length + validFiles.length;
      if (newTotal > 5) {
        toast({
          title: "Too many files",
          description: `You can upload a maximum of 5 reference images. You currently have ${prev.length} file${prev.length !== 1 ? 's' : ''}.`,
          variant: "destructive",
        });
        // Take only what fits under the limit
        const allowedCount = Math.max(0, 5 - prev.length);
        return [...prev, ...validFiles.slice(0, allowedCount)];
      }
      
      // Check for duplicates by name and size
      const duplicates: string[] = [];
      const uniqueFiles = validFiles.filter(newFile => {
        const isDuplicate = prev.some(existingFile => 
          existingFile.name === newFile.name && existingFile.size === newFile.size
        );
        if (isDuplicate) {
          duplicates.push(newFile.name);
          return false;
        }
        return true;
      });
      
      if (duplicates.length > 0) {
        toast({
          title: "Duplicate files skipped",
          description: `${duplicates.join(', ')} ${duplicates.length === 1 ? 'was' : 'were'} already uploaded.`,
          variant: "default",
        });
      }
      
      if (uniqueFiles.length > 0) {
        toast({
          title: "Files uploaded successfully",
          description: `Added ${uniqueFiles.length} image${uniqueFiles.length !== 1 ? 's' : ''} to your request.`,
          variant: "default",
        });
      }
      
      return [...prev, ...uniqueFiles];
    });
    
    // Clear the input so the same file can be selected again if needed
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.artType || !formData.theme || !formData.description || !formData.budget || !formData.timeline) {
      toast({
        title: "Please fill in all required fields",
        description: "All fields marked with * are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Here you would typically send the data to your backend
      console.log('Form submitted:', { formData, uploadedFiles });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        artType: '',
        theme: '',
        description: '',
        budget: '',
        timeline: '',
        colorPreferences: [],
        size: '',
        occasion: '',
        additionalNotes: ''
      });
      setUploadedFiles([]);
      
      setIsSubmitted(true);
      toast({
        title: "Custom request submitted!",
        description: "You'll receive proposals from interested artisans within 24 hours.",
      });

      // Reset submitted state after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error) {
      toast({
        title: "Failed to submit request",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const runGenerateImage = async () => {
    setGenError(null);
    setGenLoading(true);
    try {
      const promptParts = [formData.theme, formData.description, formData.size, formData.colorPreferences.join(', ')].filter(Boolean);
      const prompt = `Custom art concept: ${promptParts.join(' | ')}`;
      const res = await generateImage({ prompt });
      setGenImages(res.images ?? []);
      setGenOpen(true);
      if (res.note) console.info('[AI Image]', res.note);
    } catch (e: any) {
      setGenError(e?.message ?? 'Failed to generate image');
      setGenOpen(true);
    } finally {
      setGenLoading(false);
    }
  };

  const runCaptionImages = async () => {
    setCapError(null);
    setCapLoading(true);
    setCaptions([]);
    try {
      if (uploadedFiles.length === 0) {
        setCapError('Upload 1–3 reference images first.');
        return;
      }
      const res = await captionImages({ files: uploadedFiles.slice(0, 3) });
      setCaptions(res.captions || []);
    } catch (e: any) {
      setCapError(e?.message ?? 'Failed to caption images');
    } finally {
      setCapLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            className="font-heading text-4xl font-bold text-primary mb-4 uppercase tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            CUSTOM ART REQUESTS
          </motion.h1>
          <motion.p
            className="font-paragraph text-lg text-primary/70 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Commission a unique piece of art tailored to your vision. Our talented artisans will bring your ideas to life with authentic Indian craftsmanship.
          </motion.p>
        </div>

        {/* How It Works */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center border-0 bg-secondary">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-neonaccent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-heading font-bold text-xl">1</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-primary mb-2">Submit Request</h3>
              <p className="font-paragraph text-sm text-primary/70">
                Fill out the form with your requirements and preferences
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 bg-secondary">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-neonaccent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-heading font-bold text-xl">2</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-primary mb-2">Get Proposals</h3>
              <p className="font-paragraph text-sm text-primary/70">
                Receive proposals from interested artisans within 24 hours
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 bg-secondary">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-neonaccent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-heading font-bold text-xl">3</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-primary mb-2">Create Together</h3>
              <p className="font-paragraph text-sm text-primary/70">
                Collaborate with your chosen artisan to create your masterpiece
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Request Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0">
            <CardHeader>
              <CardTitle className="font-heading text-2xl font-bold text-primary uppercase tracking-wide">
                Tell Us About Your Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
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

                {/* Art Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="artType" className="font-heading font-bold text-primary">
                      Art Type *
                    </Label>
                    <Select value={formData.artType} onValueChange={(value) => handleInputChange('artType', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select art type" />
                      </SelectTrigger>
                      <SelectContent>
                        {artTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="theme" className="font-heading font-bold text-primary">
                      Theme/Style *
                    </Label>
                    <Select value={formData.theme} onValueChange={(value) => handleInputChange('theme', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {themes.map((theme) => (
                          <SelectItem key={theme.value} value={theme.value}>
                            {theme.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="font-heading font-bold text-primary">
                    Detailed Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    className="mt-1"
                    rows={4}
                    placeholder="Describe your vision in detail. Include any specific elements, symbols, or stories you want incorporated..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="budget" className="font-heading font-bold text-primary">
                      Budget Range *
                    </Label>
                    <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timeline" className="font-heading font-bold text-primary">
                      Timeline *
                    </Label>
                    <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        {timelines.map((timeline) => (
                          <SelectItem key={timeline.value} value={timeline.value}>
                            {timeline.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="size" className="font-heading font-bold text-primary">
                      Size/Dimensions
                    </Label>
                    <Input
                      id="size"
                      type="text"
                      value={formData.size}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      className="mt-1"
                      placeholder="e.g., 12x16 inches"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="occasion" className="font-heading font-bold text-primary">
                    Occasion/Purpose
                  </Label>
                  <Input
                    id="occasion"
                    type="text"
                    value={formData.occasion}
                    onChange={(e) => handleInputChange('occasion', e.target.value)}
                    className="mt-1"
                    placeholder="e.g., Wedding gift, Home decoration, Festival celebration"
                  />
                </div>

                {/* Color Preferences */}
                <div>
                  <Label className="font-heading font-bold text-primary mb-3 block">
                    Color Preferences
                  </Label>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => handleColorToggle(color.id)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          formData.colorPreferences.includes(color.id)
                            ? 'border-primary scale-110'
                            : 'border-gray-300 hover:border-primary/50'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  {formData.colorPreferences.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.colorPreferences.map((colorId) => {
                        const color = colorOptions.find(c => c.id === colorId);
                        return (
                          <Badge key={colorId} variant="secondary" className="bg-neonaccent text-primary">
                            {color?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <Label className="font-heading font-bold text-primary mb-3 block">
                    Reference Images (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-primary/60 mx-auto mb-2" />
                      <p className="font-paragraph text-primary/60">
                        Click to upload reference images or drag and drop
                      </p>
                      <p className="font-paragraph text-sm text-primary/40 mt-1">
                        PNG, JPG up to 10MB each
                      </p>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileImage className="w-8 h-8 text-primary/60" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <p className="font-paragraph text-xs text-primary/60 mt-1 truncate">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Captions Results */}
                  {(capLoading || capError || captions.length > 0) && (
                    <div className="mt-4 space-y-2">
                      {capLoading && (
                        <div className="text-sm text-primary/60">Analyzing images…</div>
                      )}
                      {capError && (
                        <div className="text-sm text-red-600">{capError}</div>
                      )}
                      {captions.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {captions.map((c, i) => (
                            <div key={i} className="rounded-lg border p-3">
                              <div className="font-heading font-bold text-primary text-sm mb-1">
                                {c.title}
                              </div>
                              <div className="text-xs text-primary/70 mb-2">{c.shortCaption}</div>
                              <div className="flex flex-wrap gap-1">
                                {(c.tags || []).slice(0, 6).map((t, j) => (
                                  <Badge key={j} variant="secondary" className="bg-neonaccent text-primary">
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="additionalNotes" className="font-heading font-bold text-primary">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    className="mt-1"
                    rows={3}
                    placeholder="Any additional requirements, preferences, or questions..."
                  />
                </div>

                {/* AI Generate Preview + Submit Button */}
                <div className="text-center pt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
                    <Button type="button" variant="outline" onClick={runGenerateImage} disabled={genLoading}>
                      {genLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating…
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 mr-2" /> AI Preview (Optional)
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={runCaptionImages} disabled={capLoading}>
                      {capLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Captioning…
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 mr-2" /> AI Captions (Optional)
                        </>
                      )}
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || isSubmitted || !formData.name || !formData.email || !formData.artType || !formData.theme || !formData.description || !formData.budget || !formData.timeline}
                    className="bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold px-8 py-4 transition-all hover:scale-105"
                  >
                    {isSubmitted ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Request Submitted!
                      </>
                    ) : isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit Custom Request
                      </>
                    )}
                  </Button>
                  <p className="font-paragraph text-sm text-primary/60 mt-3">
                    You'll receive proposals from interested artisans within 24 hours
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-heading text-2xl font-bold text-primary mb-6 text-center uppercase tracking-wide">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 bg-secondary">
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-lg text-primary mb-2">
                  How long does it take to complete a custom piece?
                </h3>
                <p className="font-paragraph text-sm text-primary/70">
                  Timeline varies based on complexity and artisan availability, typically ranging from 1 week to 3 months. You'll discuss specific timelines with your chosen artisan.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-secondary">
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-lg text-primary mb-2">
                  Can I make changes during the creation process?
                </h3>
                <p className="font-paragraph text-sm text-primary/70">
                  Yes! Our artisans provide regular updates and welcome feedback. Minor adjustments can usually be accommodated during the creation process.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-secondary">
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-lg text-primary mb-2">
                  What if I'm not satisfied with the final piece?
                </h3>
                <p className="font-paragraph text-sm text-primary/70">
                  We work closely with you throughout the process to ensure satisfaction. If issues arise, we'll work with the artisan to find a solution that meets your expectations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-secondary">
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-lg text-primary mb-2">
                  How do I pay for custom work?
                </h3>
                <p className="font-paragraph text-sm text-primary/70">
                  Payment is typically split: 50% advance to start work and 50% upon completion. Specific terms are agreed upon with your chosen artisan.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Simple Modal Preview for Generated Images */}
        {genOpen && (
          <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal>
            <div className="bg-background rounded-xl shadow-xl border max-w-3xl w-full p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-bold text-lg">AI Image Preview</h3>
                <button aria-label="Close" onClick={() => setGenOpen(false)} className="p-1 rounded hover:bg-accent">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {genError && <div className="text-red-600 text-sm mb-2">{genError}</div>}
              {genImages.length === 0 && !genError && (
                <div className="text-sm text-muted-foreground">No preview available.</div>
              )}
              {genImages.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {genImages.map((url, i) => (
                    <img key={i} src={url} alt={`AI preview ${i + 1}`} className="w-full h-auto rounded-lg border" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}