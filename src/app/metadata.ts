import { Metadata } from 'next';

const defaultMetadata: Metadata = {
  title: 'PastorAI - Biblical Guidance & Spiritual Support',
  description: 'Get spiritual guidance and Biblical wisdom through AI-powered conversations based on scripture.',
  applicationName: 'PastorAI',
  authors: [{ name: 'PastorAI Team' }],
  keywords: [
    'spiritual guidance',
    'biblical wisdom',
    'AI pastor',
    'Christian guidance',
    'scripture analysis',
    'faith support',
    'religious advice',
    'Bible study',
    'spiritual counseling',
    'Christian AI'
  ],
  creator: 'PastorAI Team',
  publisher: 'PastorAI',
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  metadataBase: new URL('https://your-domain.com'),
  openGraph: {
    title: 'PastorAI - Biblical Guidance & Spiritual Support',
    description: 'Get spiritual guidance and Biblical wisdom through AI-powered conversations based on scripture.',
    url: 'https://your-domain.com',
    siteName: 'PastorAI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PastorAI - Biblical Guidance & Spiritual Support',
    description: 'Get spiritual guidance and Biblical wisdom through AI-powered conversations based on scripture.',
    creator: '@yourtwitterhandle',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'Spiritual Support',
};

export default defaultMetadata; 