import './globals.css'

export const metadata = {
  title: 'GlucoPulse - Precision Diabetes & Glucose Suite',
  description: 'Modern offline-first diabetes management suite with AGP analytics, 63 Indian foods database, Rule of 15 emergency alerts, and clinical reports.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#219EBC'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  )
}
