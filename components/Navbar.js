import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', gap: '20px' }}>
      <Link href="/">
        <Image 
          src="/icon.png"
          alt="App Logo" 
          width={32} 
          height={32} 
        />
      </Link>

      <ul style={{ display: 'flex', gap: '20px', listStyle: 'none', margin: 0 }}>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/Tree">My Tree</Link></li>
        <li><Link href="/Explore">Explore</Link></li>
      </ul>
    </nav>
  );
}