/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './public/**/*.html'],
    darkMode: 'class',
    theme: {
        extend: {
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'collapsible-down': 'collapsible-down 0.2s ease-out',
                'collapsible-up': 'collapsible-up 0.2s ease-out',
                'fade-in': 'fade-in 0.5s ease-out',
                'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
                'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
                'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
                'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'collapsible-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-collapsible-content-height)' },
                },
                'collapsible-up': {
                    from: { height: 'var(--radix-collapsible-content-height)' },
                    to: { height: '0' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'slide-in-from-top': {
                    from: { transform: 'translateY(-100%)' },
                    to: { transform: 'translateY(0)' },
                },
                'slide-in-from-bottom': {
                    from: { transform: 'translateY(100%)' },
                    to: { transform: 'translateY(0)' },
                },
                'slide-in-from-left': {
                    from: { transform: 'translateX(-100%)' },
                    to: { transform: 'translateX(0)' },
                },
                'slide-in-from-right': {
                    from: { transform: 'translateX(100%)' },
                    to: { transform: 'translateX(0)' },
                },
            },
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '400' }],
                sm: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.02em', fontWeight: '400' }],
                base: ['1rem', { lineHeight: '1.6', letterSpacing: '0.01em', fontWeight: '400' }],
                lg: ['1.125rem', { lineHeight: '1.6', letterSpacing: '0em', fontWeight: '500' }],
                xl: ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em', fontWeight: '600' }],
                '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '700' }],
                '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' }],
                '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '800' }],
                '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '900' }],
                '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '900' }],
                '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.05em', fontWeight: '900' }],
                '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.06em', fontWeight: '900' }],
                '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.07em', fontWeight: '900' }],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            },
            fontFamily: {
                heading: "barlow-medium",
                paragraph: "barlow-extralight"
            },
            colors: {
                border: "hsl(var(--border, 214 32% 91%))",
                ring: "hsl(var(--ring, 222 84% 4.9%))",
                primary: "#000000",
                "primary-foreground": "#FFFFFF",
                secondary: "#FFFFFF",
                "secondary-foreground": "#000000",
                destructive: "#ef4444",
                "destructive-foreground": "#ffffff",
                muted: "#f1f5f9",
                "muted-foreground": "#64748b",
                accent: "#f1f5f9",
                "accent-foreground": "#0f172a",
                popover: "#ffffff",
                "popover-foreground": "#0f172a",
                card: "#ffffff",
                "card-foreground": "#0f172a",
                background: "#FFFFFF",
                neonaccent: "#E6FF00",
                foreground: "#000000",
                "color-8": "#4169e1",
                "color-9": "#007bff",
                "color-10": "#6d6d71",
                neon: "#a6d608"
            },
        },
    },
    future: {
        hoverOnlyWhenSupported: true,
    },
    plugins: [
        require('@tailwindcss/container-queries'), 
        require('@tailwindcss/typography'),
        require('tailwindcss-animate')
    ],
}
