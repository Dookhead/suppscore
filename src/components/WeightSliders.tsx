'use client';

import React from 'react';
import { INGREDIENT_DATABASE } from '@/lib/scoring/database';

interface WeightSlidersProps {
  weights: Record<string, number>;
  onChange: (weights: Record<string, number>) => void;
}

export default function WeightSliders({ weights, onChange }: WeightSlidersProps) {
  
  const handleChange = (key: string, value: number) => {
    onChange({ ...weights, [key]: value });
  };

  const getLabel = (id: string) => {
    const entry = INGREDIENT_DATABASE.find(item => item.id === id);
    return entry ? entry.name : id;
  };

  // Assign basic colors based on category
  const getColor = (id: string) => {
    const entry = INGREDIENT_DATABASE.find(item => item.id === id);
    if (!entry) return '#9ca3af'; // gray
    switch(entry.category) {
      case 'Stimulant': return '#f59e0b'; // orange
      case 'Pump': return '#ef4444'; // red
      case 'Endurance': return '#3b82f6'; // blue
      case 'Focus': return '#06b6d4'; // cyan
      default: return '#8b5cf6'; // purple
    }
  };

  const keys = Object.keys(weights);

  if (keys.length === 0) {
    return (
      <div className="glass-panel">
        <h3 style={{ margin: 0 }}>Custom Goal Matrix</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
          No recognized ingredients to weight.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Custom Goal Matrix</h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Adjust priorities</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
        {keys.map(key => (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{getLabel(key)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {Math.round(weights[key] * 100)}% weight
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={weights[key]}
              onChange={(e) => handleChange(key, parseFloat(e.target.value))}
              style={{
                width: '100%',
                accentColor: getColor(key),
                cursor: 'pointer'
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
        Slide to 0 to completely ignore an ingredient in the final score.
      </div>
    </div>
  );
}
