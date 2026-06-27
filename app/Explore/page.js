'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Sample graph gallery data
const galleryData = [
  { id: 'ai-pathway', title: 'BComp AI Pathway', description: 'Standard AI track at NUS', tags: ['CS', 'AI', 'Year 1-4'] },
  { id: 'bio-info', title: 'Bioinformatics Minor', description: 'Life Science & Computing', tags: ['Bio', 'Computing'] },
  { id: 'exchange', title: 'Korea Exchange Plan', description: 'Winter campus module mapping', tags: ['Exchange', 'International'] },
];

export default function ExplorePage() {
  const router = useRouter();

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Explore Study Plans</h1>
      <h3>🚧WIP🚧</h3>
      <p style={{ color: '#666', marginBottom: '30px' }}>Select a template to view or clone it into your planner.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {galleryData.map((item) => (
          <div key={item.id} style={{ 
            padding: '20px', border: '1px solid #ddd', borderRadius: '12px', 
            cursor: 'pointer', transition: 'transform 0.2s',
            display: 'flex', flexDirection: 'column', gap: '10px'
          }}>
            <h3 style={{ margin: 0 }}>{item.title}</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>{item.description}</p>
            
            <div style={{ display: 'flex', gap: '5px', marginTop: 'auto' }}>
              {item.tags.map(tag => (
                <span key={tag} style={{ background: '#eee', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{tag}</span>
              ))}
            </div>

            <button 
              onClick={() => router.push(`/tree?template=${item.id}`)}
              style={{ marginTop: '15px', padding: '8px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              View Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}