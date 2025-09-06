# DOTS Platform Configuration Guide

This document provides configuration instructions for the DOTS platform to enable all AI features and Firebase authentication.

## Required Environment Variables

### Firebase Configuration (Required for Authentication)
Configure these variables in your deployment environment or create a `.env` file:

```bash
# Firebase Client Configuration (Public)
PUBLIC_FB_API_KEY=your-firebase-api-key
PUBLIC_FB_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FB_PROJECT_ID=your-firebase-project-id
PUBLIC_FB_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FB_MESSAGING_SENDER_ID=your-messaging-sender-id
PUBLIC_FB_APP_ID=your-firebase-app-id
PUBLIC_FB_MEASUREMENT_ID=your-measurement-id (optional)
```

### Gemini AI Configuration (Required for AI Features)
```bash
# Gemini API Configuration (Server-only, keep secure)
GEMINI_API_KEY=your-google-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash  # or gemini-1.5-pro, gemini-2.0-flash-exp
```

### Optional External API Configuration
```bash
# If using external AI/Trust services (optional)
VITE_API_AI_BASE_URL=your-ai-service-url
VITE_API_TRUST_BASE_URL=your-trust-service-url
```

## Setup Instructions

### 1. Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Google provider
3. Enable Firestore Database
4. Enable Storage
5. Copy the configuration values to your environment variables

### 2. Google Gemini AI Setup
1. Go to https://makersuite.google.com/app/apikey
2. Create an API key for Gemini
3. Set the GEMINI_API_KEY environment variable

### 3. Local Development
1. Copy `.env.example` to `.env`
2. Fill in your configuration values
3. Restart the development server: `npm run dev`

## Features Enabled by Configuration

### With Firebase Configured:
- User authentication (Sign up/Sign in)
- User profiles and role management
- Artisan dashboard access
- Personalized experience

### With Gemini AI Configured:
- AI Chat Assistant
- Listing Pack generation (AI Storyteller, AI Photographer, AI Marketer)
- Design variations generation
- AI-powered content creation for artisans

### Without Configuration:
- Platform works with limited functionality
- Stubbed responses for AI features
- Authentication prompts but no actual sign-in capability
- Demo mode for showcasing features

## Current Status
- ✅ Platform UI and navigation complete
- ✅ All pages functional with proper fallbacks
- ✅ AI API endpoints ready (stubbed without keys)
- ⚠️  Requires Firebase and Gemini API keys for full functionality

## Support
For configuration help, refer to:
- Firebase: https://firebase.google.com/docs
- Google Gemini: https://ai.google.dev/docs
- Project documentation in `/README.md`