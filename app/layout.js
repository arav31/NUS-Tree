import './globals.css';

export const metadata = {
  title: 'NUS Tree',
  description: 'Next.js starter app for NUS Tree',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
