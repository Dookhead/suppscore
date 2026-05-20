'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculatePreWorkoutScore } from '@/lib/scoring/preWorkout';
import { calculateProteinScore } from '@/lib/scoring/protein';

export default function LeaderboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PRE_WORKOUT' | 'PROTEIN_POWDER'>('PRE_WORKOUT');
  const [stimFilter, setStimFilter] = useState<'ALL' | 'STIM' | 'NON_STIM'>('ALL');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Process and sort Pre-Workouts on the fly
  const preWorkoutRankings = products
    .filter(p => p.type === 'PRE_WORKOUT')
    .map(p => {
      const formattedIngredients = p.ingredients.map((ing: any) => ({
        id: ing.name,
        name: ing.name,
        dosage: ing.dosage,
        unit: ing.unit
      }));
      const scoreData = calculatePreWorkoutScore(
        formattedIngredients,
        p.price,
        p.servings,
        p.servingSize,
        p.isNonStim,
        p.ownCreatine
      );
      return {
        ...p,
        calculatedScore: scoreData.finalScore,
        breakdown: scoreData.breakdown
      };
    })
    .filter(p => {
      if (stimFilter === 'STIM') return !p.isNonStim;
      if (stimFilter === 'NON_STIM') return p.isNonStim;
      return true;
    })
    .sort((a, b) => b.calculatedScore - a.calculatedScore);

  // Process and sort Protein Powders on the fly
  const proteinRankings = products
    .filter(p => p.type === 'PROTEIN_POWDER')
    .map(p => {
      const scoreData = calculateProteinScore(
        p.price,
        p.servings,
        p.proteinDetails?.protein || 0,
        p.proteinDetails?.calories || 0
      );
      return {
        ...p,
        calculatedScore: scoreData.finalScore,
        breakdown: scoreData.breakdown
      };
    })
    .sort((a, b) => b.calculatedScore - a.calculatedScore);

  const getRankIndicator = (idx: number) => {
    if (idx === 0) return <span style={{ fontSize: '1.25rem' }}>🥇</span>;
    if (idx === 1) return <span style={{ fontSize: '1.25rem' }}>🥈</span>;
    if (idx === 2) return <span style={{ fontSize: '1.25rem' }}>🥉</span>;
    return <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>#{idx + 1}</span>;
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
      
      {/* Title block */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '3.2rem', 
          marginBottom: '16px', 
          fontWeight: 800,
          background: 'var(--accent-gradient)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em'
        }}>
          Global Leaderboards
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Real clinical efficacy, active density, and value rankings for sports supplements.
        </p>
      </div>

      {/* Leaderboard Tabs Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '12px', 
        marginBottom: '24px' 
      }}>
        <button 
          onClick={() => setActiveTab('PRE_WORKOUT')}
          style={{
            background: activeTab === 'PRE_WORKOUT' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.03)',
            color: '#fff',
            border: activeTab === 'PRE_WORKOUT' ? 'none' : '1px solid var(--border-color)',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'PRE_WORKOUT' ? '0 4px 12px rgba(59, 130, 246, 0.25)' : 'none'
          }}
        >
          ⚡ Pre-Workouts
        </button>
        <button 
          onClick={() => setActiveTab('PROTEIN_POWDER')}
          style={{
            background: activeTab === 'PROTEIN_POWDER' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.03)',
            color: '#fff',
            border: activeTab === 'PROTEIN_POWDER' ? 'none' : '1px solid var(--border-color)',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'PROTEIN_POWDER' ? '0 4px 12px rgba(139, 92, 246, 0.25)' : 'none'
          }}
        >
          🥛 Protein Powders
        </button>
      </div>

      {/* Pre-Workout Specific Sub-Filters */}
      {activeTab === 'PRE_WORKOUT' && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '8px', 
          marginBottom: '32px',
          background: 'rgba(255,255,255,0.02)',
          padding: '6px',
          borderRadius: '24px',
          width: 'fit-content',
          margin: '0 auto 32px auto',
          border: '1px solid var(--border-color)'
        }}>
          {(['ALL', 'STIM', 'NON_STIM'] as const).map((filter) => {
            const label = filter === 'ALL' ? 'All Formulas' : filter === 'STIM' ? '🔥 Stimulant' : '🌱 Non-Stim (Stim-Free)';
            const active = stimFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setStimFilter(filter)}
                style={{
                  background: active ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Rankings Content */}
      <div className="glass-panel" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border-color)' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Retrieving lab-certified rankings...
          </div>
        ) : activeTab === 'PRE_WORKOUT' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '18px 24px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rank</th>
                <th style={{ padding: '18px 24px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                <th style={{ padding: '18px 24px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Formula</th>
                <th style={{ padding: '18px 24px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Active Density</th>
                <th style={{ padding: '18px 24px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Cost / Active g</th>
                <th style={{ padding: '18px 24px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Efficacy / $</th>
                <th style={{ padding: '18px 24px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {preWorkoutRankings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No pre-workouts match this criteria yet.
                  </td>
                </tr>
              ) : (
                preWorkoutRankings.map((p, idx) => (
                  <tr 
                    key={p.id} 
                    style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => router.push(`/dashboard/${p.id}`)}
                  >
                    <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                      {getRankIndicator(idx)}
                    </td>
                    <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        ${p.price.toFixed(2)} | {p.servings} servings
                      </div>
                    </td>
                    <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                      {p.isNonStim ? (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 600, 
                          color: '#60a5fa', 
                          background: 'rgba(59, 130, 246, 0.1)', 
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          padding: '4px 8px', 
                          borderRadius: '6px'
                        }}>
                          🌱 Non-Stim
                        </span>
                      ) : (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 600, 
                          color: '#f59e0b', 
                          background: 'rgba(245, 158, 11, 0.1)', 
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          padding: '4px 8px', 
                          borderRadius: '6px'
                        }}>
                          🔥 Stimulant
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right', verticalAlign: 'middle', fontWeight: 500 }}>
                      {p.servingSize ? `${p.breakdown.activeDensityPct.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right', verticalAlign: 'middle', fontWeight: 500, color: 'var(--text-muted)' }}>
                      ${p.breakdown.costPerActiveGram.toFixed(2)}
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right', verticalAlign: 'middle', fontWeight: 500, color: 'var(--text-muted)' }}>
                      {p.breakdown.efficacyPerDollar.toFixed(1)}
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right', verticalAlign: 'middle', fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1.25rem' }}>
                      {p.calculatedScore}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '18px 24px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rank</th>
                <th style={{ padding: '18px 24px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                <th style={{ padding: '18px 24px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Protein density</th>
                <th style={{ padding: '18px 24px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Cost / Protein g</th>
                <th style={{ padding: '18px 24px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {proteinRankings.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No protein powders analyzed yet.
                  </td>
                </tr>
              ) : (
                proteinRankings.map((p, idx) => (
                  <tr 
                    key={p.id} 
                    style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => router.push(`/dashboard/${p.id}`)}
                  >
                    <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                      {getRankIndicator(idx)}
                    </td>
                    <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        ${p.price.toFixed(2)} | {p.servings} servings
                      </div>
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right', verticalAlign: 'middle', fontWeight: 600, color: 'var(--success)' }}>
                      {p.breakdown.proteinDensity.toFixed(1)}%
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right', verticalAlign: 'middle', fontWeight: 500, color: 'var(--text-muted)' }}>
                      ${p.breakdown.costPerGram.toFixed(3)}
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right', verticalAlign: 'middle', fontWeight: 700, color: 'var(--accent-secondary)', fontSize: '1.25rem' }}>
                      {p.calculatedScore}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
