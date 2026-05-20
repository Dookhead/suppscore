'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { INGREDIENT_DATABASE } from '@/lib/scoring/database';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'PRE_WORKOUT' | 'PROTEIN_POWDER'>('PRE_WORKOUT');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');
  const [servings, setServings] = useState('');
  const [servingSize, setServingSize] = useState('');

  // Pre-Workout specifics
  const [isNonStim, setIsNonStim] = useState(false);
  const [ownCreatine, setOwnCreatine] = useState(false);

  // Protein specifics
  const [proteinAmount, setProteinAmount] = useState('');
  const [calories, setCalories] = useState('');

  // Pre-Workout specific state array
  const [pwIngredients, setPwIngredients] = useState<any[]>([
    { rowId: 'row1', searchVal: 'Caffeine Anhydrous', dbId: 'caffeine', dosage: '', unit: 'mg', isPropBlend: false, isOpen: false },
    { rowId: 'row2', searchVal: 'L-Citrulline', dbId: 'citrulline', dosage: '', unit: 'g', isPropBlend: false, isOpen: false },
    { rowId: 'row3', searchVal: 'Beta-Alanine', dbId: 'beta_alanine', dosage: '', unit: 'g', isPropBlend: false, isOpen: false }
  ]);

  const addIngredientRow = () => {
    setPwIngredients(prev => [
      ...prev,
      { rowId: `row_${Date.now()}`, searchVal: '', dbId: '', dosage: '', unit: 'mg', isPropBlend: false, isOpen: false }
    ]);
  };

  const removeRow = (rowId: string) => {
    setPwIngredients(prev => prev.filter(r => r.rowId !== rowId));
  };

  const updateRow = (rowId: string, field: string, value: any) => {
    setPwIngredients(prev => prev.map(r => r.rowId === rowId ? { ...r, [field]: value } : r));
  };

  const handleSearchChange = (rowId: string, val: string) => {
    updateRow(rowId, 'searchVal', val);
    updateRow(rowId, 'dbId', ''); // clear dbId if typing
    updateRow(rowId, 'isOpen', true);
  };

  const selectSuggestion = (rowId: string, item: any) => {
    setPwIngredients(prev => prev.map(r => {
      if (r.rowId === rowId) {
        return {
          ...r,
          searchVal: item.name,
          dbId: item.id,
          unit: item.unit,
          isOpen: false
        };
      }
      return r;
    }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const baseData = {
      name: name || (type === 'PRE_WORKOUT' ? 'Custom Pre-Workout' : 'Custom Protein'),
      type,
      price: parseFloat(price),
      servings: parseInt(servings, 10),
      servingSize: parseFloat(servingSize) || null,
      url: url || null
    };

    let finalData: any = { ...baseData };

    if (type === 'PRE_WORKOUT') {
      finalData.isNonStim = isNonStim;
      finalData.ownCreatine = ownCreatine;
      const ingredients = pwIngredients
        .map(r => {
          let resolvedId = r.dbId;
          // If user typed something but didn't click the dropdown, try to auto-resolve it
          if (!resolvedId && r.searchVal) {
            const searchLower = r.searchVal.toLowerCase().trim();
            const match = INGREDIENT_DATABASE.find(db => 
              db.name.toLowerCase() === searchLower ||
              db.aliases?.some(alias => alias.toLowerCase() === searchLower)
            );
            if (match) resolvedId = match.id;
          }
          return { ...r, dbId: resolvedId };
        })
        .filter(r => r.dbId && (r.dosage !== '' || r.isPropBlend))
        .map(r => ({
          id: r.dbId,
          dosage: r.isPropBlend ? null : parseFloat(r.dosage),
          unit: r.unit
        }));
      finalData.ingredients = ingredients;
    } else {
      finalData.proteinDetails = {
        protein: parseFloat(proteinAmount),
        calories: parseFloat(calories)
      };
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/dashboard/${data.id}`);
      } else {
        alert('Error saving product');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 20px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '16px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SuppScore
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px' }}>
          Manually input your supplement details to calculate its true clinical efficacy and value.
        </p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '700px' }}>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button 
            type="button"
            className="btn-primary"
            style={{ flex: 1, opacity: type === 'PRE_WORKOUT' ? 1 : 0.5 }}
            onClick={() => setType('PRE_WORKOUT')}
          >
            Pre-Workout
          </button>
          <button 
            type="button"
            className="btn-primary"
            style={{ flex: 1, opacity: type === 'PROTEIN_POWDER' ? 1 : 0.5 }}
            onClick={() => setType('PROTEIN_POWDER')}
          >
            Protein Powder
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Product Name</label>
              <input type="text" className="input-text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Total War" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Product Link (Optional)</label>
              <input type="url" className="input-text" value={url} onChange={e => setUrl(e.target.value)} placeholder="e.g. https://site.com/product" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Price ($) *</label>
              <input type="number" step="0.01" className="input-text" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Total Servings *</label>
              <input type="number" className="input-text" value={servings} onChange={e => setServings(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Serving Size (g)</label>
              <input type="number" step="0.1" className="input-text" value={servingSize} onChange={e => setServingSize(e.target.value)} />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '10px 0' }} />

          {type === 'PRE_WORKOUT' && (
            <div>
              {/* Formula Toggles */}
              <div style={{ display: 'flex', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', userSelect: 'none', flex: 1 }}>
                  <input 
                    type="checkbox" 
                    checked={isNonStim} 
                    onChange={e => setIsNonStim(e.target.checked)} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <div>
                    <strong>Non-Stimulant Mode</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Excludes Caffeine/CNS energy pathway from calculation</div>
                  </div>
                </label>
                <div style={{ width: '1px', background: 'var(--border-color)' }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', userSelect: 'none', flex: 1 }}>
                  <input 
                    type="checkbox" 
                    checked={ownCreatine} 
                    onChange={e => setOwnCreatine(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <div>
                    <strong>Supplement Creatine Separately</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Auto-fulfills 5g clinical Creatine requirement</div>
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3>Active Ingredients</h3>
                <button type="button" onClick={addIngredientRow} style={{ background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                  + Add Ingredient
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pwIngredients.map(row => (
                  <div key={row.rowId} style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
                    
                    {/* Autocomplete Input */}
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input 
                        type="text"
                        className="input-text"
                        placeholder="Search ingredient..."
                        value={row.searchVal}
                        onChange={(e) => handleSearchChange(row.rowId, e.target.value)}
                        onFocus={() => updateRow(row.rowId, 'isOpen', true)}
                        onBlur={() => setTimeout(() => updateRow(row.rowId, 'isOpen', false), 200)}
                      />
                      
                      {row.isOpen && row.searchVal.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-dark)', border: '1px solid var(--border-color)', zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                          {INGREDIENT_DATABASE
                            .filter(db => 
                              db.name.toLowerCase().includes(row.searchVal.toLowerCase()) ||
                              db.aliases?.some(alias => alias.toLowerCase().includes(row.searchVal.toLowerCase()))
                            )
                            .map(item => (
                              <div 
                                key={item.id} 
                                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--bg-panel)' }}
                                onMouseDown={() => selectSuggestion(row.rowId, item)}
                              >
                                {item.name}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', width: '200px' }}>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="input-text" 
                        placeholder="Dosage"
                        value={row.dosage}
                        onChange={e => updateRow(row.rowId, 'dosage', e.target.value)}
                        disabled={row.isPropBlend}
                        style={{ flex: 1 }}
                      />
                      <select 
                        className="input-text" 
                        value={row.unit}
                        onChange={e => updateRow(row.rowId, 'unit', e.target.value)}
                        style={{ width: '70px', padding: '0 4px' }}
                      >
                        <option value="mg">mg</option>
                        <option value="g">g</option>
                      </select>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)', width: '90px' }}>
                      <input 
                        type="checkbox" 
                        checked={row.isPropBlend}
                        onChange={e => updateRow(row.rowId, 'isPropBlend', e.target.checked)}
                      />
                      Prop Blend
                    </label>

                    <button 
                      type="button" 
                      onClick={() => removeRow(row.rowId)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 8px' }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {type === 'PROTEIN_POWDER' && (
            <div>
               <h3 style={{ marginBottom: '16px' }}>Nutritional Info</h3>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Protein per Serving (g) *</label>
                    <input type="number" step="0.1" className="input-text" value={proteinAmount} onChange={e => setProteinAmount(e.target.value)} required />
                 </div>
                 <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Calories per Serving *</label>
                    <input type="number" className="input-text" value={calories} onChange={e => setCalories(e.target.value)} required />
                 </div>
               </div>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '20px', fontSize: '1.1rem', padding: '16px' }} disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate SuppScore'}
          </button>

        </form>
      </div>
    </div>
  );
}
