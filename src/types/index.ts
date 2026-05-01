export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  history: { time: string; price: number }[];
  marketCap: string;
  volume: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface UserProfile {
  uid: string;
  email: string;
  watchlist: string[];
  notificationsEnabled: boolean;
  enrolledCourses: string[];
  purchasedResources: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail: string;
  category: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  price: number;
  pages: number;
  fileSize: string;
  thumbnail: string;
  downloadUrl?: string; // Only accessible after purchase
  category: string;
}
