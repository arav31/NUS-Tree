import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'NUS Tree',
  description: 'NUS Tree, Node based full course planner',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
