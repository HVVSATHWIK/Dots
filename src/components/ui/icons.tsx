import React from 'react';
import {
  Search,
  Sparkles,
  Package,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Lightbulb,
  Target,
  Palette,
  Heart,
  ShoppingCart,
  User,
  ClipboardList,
  ShoppingBag,
  Hammer,
  Gem,
  Magnet,
  Building2,
  ShieldCheck,
  Home
} from 'lucide-react';

// Custom minimal inline SVGs for icons not present in lucide-react
const ThreadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M7 9c3 2 7 2 10 0" />
    <path d="M7 12c3 2 7 2 10 0" />
    <path d="M7 15c3 2 7 2 10 0" />
  </svg>
);

const ShellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3c4 0 8 3 8 7 0 6-4 11-8 11S4 16 4 10c0-4 4-7 8-7Z" />
    <path d="M12 3c2 2 3 5 3 7 0 5-3 11-3 11s-3-6-3-11c0-2 1-5 3-7Z" />
  </svg>
);

const DollIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="7" r="3" />
    <path d="M6 21c0-4 2.5-7 6-7s6 3 6 7H6Z" />
    <path d="M8 14c1.5 1 6.5 1 8 0" />
  </svg>
);

const VaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 3h6l-1 3a5 5 0 0 1 1 3c0 3-2 9-3 12-1-3-3-9-3-12a5 5 0 0 1 1-3L9 3Z" />
    <path d="M9 3h6" />
  </svg>
);

const TeapotIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 10c0-3 2-5 5-5s5 2 5 5" />
    <path d="M5 10h14v5a7 7 0 0 1-7 7 7 7 0 0 1-7-7v-5Z" />
    <path d="M19 12c1.5 0 3-1 3-2s-1-2-2.5-2" />
  </svg>
);

const BeadsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="2" />
    <circle cx="5" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
    <path d="M7 12h3" />
    <path d="M14 12h3" />
  </svg>
);

const RobotIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="7" width="16" height="12" rx="2" />
    <circle cx="9" cy="13" r="1.5" />
    <circle cx="15" cy="13" r="1.5" />
    <path d="M12 7V3" />
  </svg>
);

const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export type IconName =
  | 'search'
  | 'sparkles'
  | 'package'
  | 'trending'
  | 'thread'
  | 'alert'
  | 'barchart'
  | 'lightbulb'
  | 'target'
  | 'palette'
  | 'heart'
  | 'cart'
  | 'user'
  | 'clipboard'
  | 'shopping-bag'
  | 'hammer'
  | 'gem'
  | 'magnet'
  | 'building'
  | 'shield'
  | 'home'
  | 'shell'
  | 'doll'
  | 'vase'
  | 'teapot'
  | 'beads'
  | 'robot'
  | 'lock';

const iconMap: Record<IconName, React.ReactNode> = {
  search: <Search />,
  sparkles: <Sparkles />,
  package: <Package />,
  trending: <TrendingUp />,
  thread: <ThreadIcon />,
  alert: <AlertTriangle />,
  barchart: <BarChart3 />,
  lightbulb: <Lightbulb />,
  target: <Target />,
  palette: <Palette />,
  heart: <Heart />,
  cart: <ShoppingCart />,
  user: <User />,
  clipboard: <ClipboardList />,
  'shopping-bag': <ShoppingBag />,
  hammer: <Hammer />,
  gem: <Gem />,
  magnet: <Magnet />,
  building: <Building2 />,
  shield: <ShieldCheck />,
  home: <Home />,
  shell: <ShellIcon />,
  doll: <DollIcon />,
  vase: <VaseIcon />,
  teapot: <TeapotIcon />,
  beads: <BeadsIcon />,
  robot: <RobotIcon />,
  lock: <LockIcon />
};

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: IconName;
  title?: string;
  decorative?: boolean;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, title, decorative = true, size = 20, className = '', ...rest }) => {
  const node = iconMap[name] || iconMap['sparkles'];
  return (
    <span
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative}
      aria-label={!decorative ? title || name : undefined}
      className={`inline-flex items-center justify-center ${className}`}
      {...rest}
    >
      {React.isValidElement(node) ? React.cloneElement(node as any, { width: size, height: size, className: 'w-full h-full' }) : node}
    </span>
  );
};

export default Icon;
