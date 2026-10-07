export interface Product {
  id: string;
  name: string;
  category: 'personal-care' | 'grooming' | 'in-room';
  categoryLabel: string;
  image: string;
  shortDesc: string;
  fullDesc: string;
  specPill: string;
  specs: string[];
  materials?: string;
  moq?: string;
  leadTime?: string;
}

export interface StatItem {
  number: number;
  suffix: string;
  label: string;
  iconName: string;
  isDecimal?: boolean;
}

export interface PortfolioItem {
  number: string;
  tag: string;
  title: string;
  client: string;
  location: string;
  image: string;
  features: string[];
}

export interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  hotel: string;
  image: string;
  stars: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
