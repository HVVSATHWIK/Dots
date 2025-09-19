# DOTS - Authentic Indian Crafts Platform

## Project Overview
This is the DOTS platform - a marketplace for authentic Indian crafts that connects artisans with buyers worldwide. The platform features AI-powered assistance, Firebase authentication, and a modern React-based user interface built with Astro.

## Technical Stack
- **Framework**: Astro v5.13.5 with React components
- **UI Components**: Radix UI, Tailwind CSS
- **Authentication**: Firebase Auth with Google provider
- **AI Integration**: Google Gemini AI for content generation
- **Database**: Firebase Firestore
- **Deployment**: Vercel adapter (configured for Replit)

## Development Environment
- **Node.js**: Version 20+ (required for Firebase compatibility)
- **Package Manager**: npm
- **Dev Server**: Astro dev server on port 5000
- **Build Tool**: Vite

## Project Architecture
### Core Features
- **User Roles**: Buyers and Artisans with role-based dashboards
- **AI Features**: 
  - Chat assistant
  - AI-generated product descriptions and images
  - Design variations generator
- **Authentication**: Complete signup/login flow with Google OAuth
- **Multi-language Support**: i18next internationalization
- **Responsive Design**: Mobile-first approach

### Key Directories
- `src/components/`: React components and UI elements
- `src/pages/`: Astro page components and API routes
- `integrations/`: Custom integrations (AI, CMS, Members, Trust)
- `src/hooks/`: Custom React hooks
- `src/i18n/`: Internationalization configuration

## Configuration
The application requires environment variables for full functionality:
- Firebase configuration (PUBLIC_FB_* variables)
- Gemini API key (GEMINI_API_KEY)
- Optional external service URLs

## Recent Changes
- **2025-09-19**: Successfully imported and configured for Replit environment
  - Upgraded Node.js to v20 to meet Firebase requirements
  - Fixed lucide-react source map issue preventing build
  - Configured development workflow on port 5000
  - Set up deployment configuration for autoscale
  - Server running successfully with proper host configuration

## Development Notes
- The project uses Wix integrations but can run independently
- All pages have proper fallbacks for missing configuration
- AI features are stubbed when API keys are not provided
- The application is designed to work in demo mode without full configuration

## User Preferences
- No specific user preferences recorded yet