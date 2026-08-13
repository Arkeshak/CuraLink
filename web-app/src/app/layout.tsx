import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CuraLink — AI-Powered Healthcare Platform',
  description:
    'Book a doctor, understand your lab report, and get AI-powered health triage — all in your own language. Sri Lanka\'s most advanced e-channeling platform.',
  keywords: ['healthcare', 'doctor booking', 'channeling', 'AI health', 'Sri Lanka', 'lab reports'],
  authors: [{ name: 'CuraLink' }],
  manifest: '/manifest.json',
  openGraph: {
    title: 'CuraLink — AI-Powered Healthcare Platform',
    description: 'Book doctors, understand lab reports, and get visual triage — all in one place.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#7B2FF7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async></script>
        <script type="text/javascript" dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
            }
          `
        }} />
      </head>
      <body>
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        {children}
      </body>
    </html>
  );
}
