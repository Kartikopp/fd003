import { Stock, NewsItem, Course, Resource } from '../types';

const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'];

// ... 

export const getMockResources = (): Resource[] => [
  {
    id: 'r1',
    title: 'Financial Statement Analysis PDF',
    description: 'A comprehensive guide to reading and interpreting balance sheets, income statements, and cash flow statements.',
    price: 499,
    pages: 45,
    fileSize: '4.2 MB',
    thumbnail: 'https://picsum.photos/seed/pdf1/400/550',
    category: 'E-Book',
  },
  {
    id: 'r2',
    title: 'Trading Psychology Cheat Sheet',
    description: 'Master your emotions with this quick-reference guide for disciplined trading and risk management.',
    price: 199,
    pages: 5,
    fileSize: '1.1 MB',
    thumbnail: 'https://picsum.photos/seed/pdf2/400/550',
    category: 'Cheat Sheet',
  },
  {
    id: 'r3',
    title: 'Indian Market Tax Guide 2024',
    description: 'Understand STCG, LTCG, and dividend taxes with this clear and easy-to-follow PDF for Indian investors.',
    price: 299,
    pages: 22,
    fileSize: '2.8 MB',
    thumbnail: 'https://picsum.photos/seed/pdf3/400/550',
    category: 'Guide',
  },
];

// ... (generateHistory implementation)

export const getMockCourses = (): Course[] => [
  {
    id: 'c1',
    title: 'Options Trading Masterclass',
    description: 'Learn advanced options strategies, Greeks, and risk management to enhance your trading edge.',
    instructor: 'Kartik Sharma',
    price: 4999,
    duration: '12 Hours',
    level: 'Advanced',
    thumbnail: 'https://picsum.photos/seed/trading/400/225',
    category: 'Trading',
  },
  {
    id: 'c2',
    title: 'Financial Freedom 101',
    description: 'Master the basics of budgeting, debt management, and long-term investing for a secure future.',
    instructor: 'Priya Verma',
    price: 1999,
    duration: '8 Hours',
    level: 'Beginner',
    thumbnail: 'https://picsum.photos/seed/finance/400/225',
    category: 'Personal Finance',
  },
  {
    id: 'c3',
    title: 'Value Investing Deep Dive',
    description: 'Analyze balance sheets, cash flows, and intrinsic value like Warren Buffett.',
    instructor: 'Rahul Iyer',
    price: 8999,
    duration: '20 Hours',
    level: 'Intermediate',
    thumbnail: 'https://picsum.photos/seed/investing/400/225',
    category: 'Investing',
  },
];

const generateHistory = (basePrice: number) => {
  const history = [];
  let currentPrice = basePrice;
  for (let i = 0; i < 20; i++) {
    currentPrice = currentPrice * (1 + (Math.random() * 0.04 - 0.02));
    history.push({
      time: new Date(Date.now() - (20 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: Number(currentPrice.toFixed(2)),
    });
  }
  return history;
};

export const getMockStocks = (): Stock[] => {
  return SYMBOLS.map(symbol => {
    const basePrice = Math.random() * 1000 + 100;
    const change = Math.random() * 20 - 10;
    return {
      symbol,
      name: `${symbol} Inc.`,
      price: Number(basePrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number((change / basePrice * 100).toFixed(2)),
      history: generateHistory(basePrice),
      marketCap: `${(Math.random() * 3 + 0.5).toFixed(1)}T`,
      volume: `${(Math.random() * 50 + 10).toFixed(1)}M`,
    };
  });
};

export const getMockNews = (): NewsItem[] => [
  {
    id: '1',
    title: 'Market Hits Record High Amid Tech Surge',
    content: 'Major indices rallied today as big tech companies reported better-than-expected quarterly earnings.',
    source: 'Financial Times',
    timestamp: '2h ago',
    sentiment: 'positive',
  },
  {
    id: '2',
    title: 'Fed Signals Potential Rate Pause',
    content: 'The Federal Reserve hinted at a possible pause in interest rate hikes in its latest meeting minutes.',
    source: 'Wall Street Journal',
    timestamp: '4h ago',
    sentiment: 'neutral',
  },
  {
    id: '3',
    title: 'Oil Prices Drop on Supply Concerns',
    content: 'Crude oil prices fell today as concerns about global supply outweighed demand forecasts.',
    source: 'Bloomberg',
    timestamp: '6h ago',
    sentiment: 'negative',
  },
];
