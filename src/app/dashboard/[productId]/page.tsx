'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculatePreWorkoutScore } from '@/lib/scoring/preWorkout';
import { calculateProteinScore } from '@/lib/scoring/protein';
import { INGREDIENT_DATABASE } from '@/lib/scoring/database';
import styles from '@/styles/dashboard.module.css';

// Chart.js imports
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function DashboardPage({ params }: { params: { productId: string } }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/products/${params.productId}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          router.push('/');
        }
      } catch (e) {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.productId, router]);

  if (loading || !data) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading analysis...</div>;

  const isPreWorkout = data.type === 'PRE_WORKOUT';
  let scoreData: any = null;

  if (isPreWorkout) {
    scoreData = calculatePreWorkoutScore(data.ingredients, data.price, data.servings, data.servingSize, data.isNonStim, data.ownCreatine);
  } else {
    scoreData = calculateProteinScore(data.price, data.servings, data.proteinDetails.protein, data.proteinDetails.calories);
  }

  const { finalScore, breakdown } = scoreData;

  const getVerdict = (score: number) => {
    if (score >= 105) return { label: 'God Tier', class: styles.verdictTopTier };
    if (score >= 90) return { label: 'Top Tier', class: styles.verdictTopTier };
    if (score >= 70) return { label: 'Solid', class: styles.verdictMid };
    return { label: 'Underdosed', class: styles.verdictLow };
  };

  const verdict = getVerdict(finalScore);

  const radarData = isPreWorkout ? {
    labels: ['Energy', 'Pump', 'Endurance', 'Focus', 'Absorption'],
    datasets: [
      {
        label: 'Pathway Fulfillment (%)',
        data: [
          breakdown.pathwayScores.Energy,
          breakdown.pathwayScores.Pump,
          breakdown.pathwayScores.Endurance,
          breakdown.pathwayScores.Focus,
          breakdown.pathwayScores.Absorption
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  } : null;

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#a3a3a3', font: { size: 14 } },
        ticks: { display: false }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      
      {/* Sidebar - Score */}
      <div className={styles.sidebar}>
        
        <div className={styles.scoreBadge}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Overall Score</h2>
          <div className={styles.scoreValue}>{finalScore}</div>
          <div className={`${styles.verdict} ${verdict.class}`}>
            {verdict.label}
          </div>
        </div>

        <div className="glass-panel">
          <h3>Product Info</h3>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
            <p><strong>Name:</strong> {data.name}</p>
            <p><strong>Price:</strong> ${data.price.toFixed(2)}</p>
            <p><strong>Servings:</strong> {data.servings}</p>
            <p><strong>Cost/Serving (Listed):</strong> ${(data.price / data.servings).toFixed(2)}</p>
            {data.servingSize && <p><strong>Serving Size:</strong> {data.servingSize}g</p>}
            {data.url && (
              <p>
                <strong>Source:</strong>{' '}
                <a 
                  href={data.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    color: 'var(--accent-primary)', 
                    textDecoration: 'underline',
                    fontWeight: 600,
                    wordBreak: 'break-all'
                  }}
                >
                  View Product Link ↗
                </a>
              </p>
            )}
          </div>
        </div>

        {isPreWorkout && (data.isNonStim || data.ownCreatine) && (
          <div className="glass-panel">
            <h3>Applied Settings</h3>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.isNonStim && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: 'rgba(59, 130, 246, 0.1)', 
                  border: '1px solid rgba(59, 130, 246, 0.3)', 
                  padding: '8px 12px', 
                  borderRadius: '8px', 
                  fontSize: '0.85rem',
                  color: '#60a5fa',
                  fontWeight: 600
                }}>
                  🌱 Stim-Free (Non-Stim)
                </div>
              )}
              {data.ownCreatine && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: 'rgba(139, 92, 246, 0.1)', 
                  border: '1px solid rgba(139, 92, 246, 0.3)', 
                  padding: '8px 12px', 
                  borderRadius: '8px', 
                  fontSize: '0.85rem',
                  color: '#a78bfa',
                  fontWeight: 600
                }}>
                  💪 Creatine Independent
                </div>
              )}
            </div>
          </div>
        )}
        
        <button className="btn-primary" onClick={() => router.push('/')}>
          Analyze Another
        </button>

      </div>

      {/* Main Content - Breakdown */}
      <div className={styles.mainContent}>
        
        <div className="glass-panel" style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            Analysis Breakdown
          </h2>

          {isPreWorkout ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '40px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '100%', maxWidth: '400px', aspectRatio: '1' }}>
                    <Radar data={radarData!} options={radarOptions} />
                  </div>
                </div>
              </div>

              <h3 style={{ marginBottom: '16px', color: 'var(--accent-primary)' }}>Value, Density & Synergy</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                 
                 <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', transition: 'transform 0.2s', cursor: 'default' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Efficacy per Dollar</div>
                   <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{breakdown.efficacyPerDollar.toFixed(1)}</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                     Points per serving dollar. Higher is better value.
                   </div>
                 </div>

                 <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', transition: 'transform 0.2s', cursor: 'default' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active scoop Density</div>
                   <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                     {data.servingSize ? `${breakdown.activeDensityPct.toFixed(1)}%` : 'N/A'}
                   </div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                     {data.servingSize ? 'Percentage of serving weight that consists of active ingredients.' : 'No serving size specified to calculate density.'}
                   </div>
                 </div>

                 <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', transition: 'transform 0.2s', cursor: 'default' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost per Active Gram</div>
                   <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>${breakdown.costPerActiveGram.toFixed(2)}</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                     Price paid purely for active performance ingredients.
                   </div>
                 </div>
                 
                 <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', transition: 'transform 0.2s', cursor: 'default' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--success)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Synergy Bonus</div>
                   <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>+{breakdown.synergyBonus.toFixed(1)}</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                     Extra points awarded for formulation completeness.
                   </div>
                 </div>

              </div>

              <h3 style={{ marginBottom: '16px', color: 'var(--accent-primary)' }}>Ingredient Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.ingredients.map((ing: any, idx: number) => {
                  
                  const dbEntry = INGREDIENT_DATABASE.find(db => db.id === ing.id);
                  const target = dbEntry ? dbEntry.clinicalDosage : null;
                  
                  let actual = ing.dosage;
                  
                  if (target && dbEntry) {
                    const dbIsMg = dbEntry.unit === 'mg';
                    if (dbIsMg && ing.unit === 'g') actual *= 1000;
                    if (!dbIsMg && ing.unit === 'mg') actual /= 1000;
                  }

                  const fillPercentage = target && actual ? Math.min((actual / target) * 100, 100) : 0;
                  const isPropBlend = ing.dosage === null;

                  return (
                    <div key={idx} className={styles.ingredientItem}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600 }}>{dbEntry?.name || ing.name}</span>
                        {isPropBlend ? (
                          <span style={{ color: 'var(--danger)' }}>Proprietary Blend (0 pts)</span>
                        ) : (
                          <span>
                            {ing.dosage}{ing.unit} {target && <span style={{ color: 'var(--text-muted)' }}>/ {target}{dbEntry?.unit} clinical</span>}
                          </span>
                        )}
                      </div>
                      
                      {target && !isPropBlend && (
                        <div className={styles.progressBarContainer}>
                          <div 
                            className={styles.progressBarFill} 
                            style={{ 
                              width: `${fillPercentage}%`,
                              background: fillPercentage >= 100 ? 'var(--success)' : 'var(--warning)' 
                            }} 
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div>
              <h3 style={{ marginBottom: '16px', color: 'var(--accent-primary)' }}>Protein Metrics</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Protein Density</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{breakdown.proteinDensity.toFixed(1)}%</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>% of calories from pure protein</div>
                </div>
                
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cost per gram of Protein</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>${breakdown.costPerGram.toFixed(3)}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>Optimal is ~$0.02</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
