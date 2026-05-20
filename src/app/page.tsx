'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { INGREDIENT_DATABASE } from '@/lib/scoring/database';
import Tesseract from 'tesseract.js';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<'PRE_WORKOUT' | 'PROTEIN_POWDER'>('PRE_WORKOUT');
  const [name, setName] = useState('');
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    try {
      const result = await Tesseract.recognize(file, 'eng');
      let rawText = result.data.text;
      
      // 1. Fix common OCR mistakes where zero '0' is read as letter 'o' or 'O' inside numbers
      // E.g., '2ooo mg' -> '2000 mg', 'O.7 g' -> '0.7 g', '2.O g' -> '2.0 g'
      let text = rawText.replace(/\b([0-9oO]+(?:[.,\s]+[0-9oO]+)?)\s*(mg|g|mcg|µg|grams|milligrams)\b/ig, (match, numStr, unitStr) => {
        const correctedNum = numStr.replace(/[oO]/g, '0');
        return correctedNum + ' ' + unitStr;
      });

      const foundIngredients: any[] = [];
      let delayRowId = Date.now();

      // 2. Gather all search terms/aliases and sort by length descending to prevent substring overlap (e.g., Citrulline Malate vs Citrulline)
      interface SearchTermMapping {
        db: typeof INGREDIENT_DATABASE[0];
        term: string;
      }
      
      const termMappings: SearchTermMapping[] = [];
      INGREDIENT_DATABASE.forEach(db => {
        const terms = [db.name, ...(db.aliases || [])];
        terms.forEach(term => {
          termMappings.push({ db, term });
        });
      });
      
      termMappings.sort((a, b) => b.term.length - a.term.length);

      // Helper to generate a flexible RegExp from a search term (tolerant to hyphens, spaces, and L vs 1/i/I)
      const createFlexibleRegex = (termStr: string): RegExp => {
        let pattern = termStr.toLowerCase()
          .replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') // escape regex chars
          .replace(/[\s\-_/\\]+/g, '[\\s\\-_/\\\\•*~]*'); // spaces and hyphens optional and interchangeable
        
        // Match L at start of terms to 1, i, I, |
        if (pattern.startsWith('l[\\s\\-_/\\\\•*~]*')) {
          pattern = '[l1i|I][\\s\\-_/\\\\•*~]*' + pattern.substring(16);
        }
        
        return new RegExp(pattern, 'i');
      };

      // Track character ranges in text that have already matched to prevent overlapping matches
      const matchedRanges: { start: number; end: number }[] = [];
      
      const isOverlapping = (start: number, end: number) => {
        return matchedRanges.some(r => (start >= r.start && start < r.end) || (end > r.start && end <= r.end));
      };

      termMappings.forEach(({ db, term }) => {
        // If we already found this ingredient ID, don't match other aliases/spellings of it
        if (foundIngredients.some(item => item.dbId === db.id)) return;
        
        const regex = createFlexibleRegex(term);
        const match = text.match(regex);
        
        if (match && match.index !== undefined) {
          const matchIndex = match.index;
          const matchLength = match[0].length;
          const matchEnd = matchIndex + matchLength;
          
          if (isOverlapping(matchIndex, matchEnd)) return;
          
          // Claim the match range
          matchedRanges.push({ start: matchIndex, end: matchEnd });
          
          let dosage = '';
          let unit: string = db.unit; // Default to DB preferred unit

          // Locate the line containing this match
          const lines = text.split('\n');
          let lineOfMatch = '';
          let cumulativeLength = 0;
          for (const line of lines) {
            const lineStart = cumulativeLength;
            const lineEnd = lineStart + line.length;
            if (matchIndex >= lineStart && matchIndex <= lineEnd) {
              lineOfMatch = line;
              break;
            }
            cumulativeLength = lineEnd + 1;
          }

          // Helper to extract dosage from a candidate string
          const extractDosageFromString = (s: string): { dosage: string; unit: string } | null => {
            const doseMatch = s.match(/([0-9]+(?:[\s.,]+[0-9]+)?)\s*(mg|g|mcg|µg|grams|milligrams)/i);
            if (doseMatch) {
              let parsedDose = doseMatch[1].replace(/\s+/g, '').replace(/\.+/g, '.').replace(/,+/g, '.');
              let parsedUnit = doseMatch[2].toLowerCase();
              if (parsedUnit === 'grams') parsedUnit = 'g';
              if (parsedUnit === 'milligrams') parsedUnit = 'mg';
              return { dosage: parsedDose, unit: parsedUnit };
            }
            return null;
          };

          // Strategy 1: Check same line first (most accurate for tabular nutrition labels)
          const sameLineResult = extractDosageFromString(lineOfMatch);
          if (sameLineResult) {
            dosage = sameLineResult.dosage;
            unit = sameLineResult.unit;
          } else {
            // Strategy 2: Look ahead 150 characters
            const textAfter = text.slice(matchIndex, matchIndex + 150);
            const lookaheadResult = extractDosageFromString(textAfter);
            if (lookaheadResult) {
              dosage = lookaheadResult.dosage;
              unit = lookaheadResult.unit;
            } else {
              // Strategy 3: Look behind 60 characters
              const textBefore = text.slice(Math.max(0, matchIndex - 60), matchIndex);
              const lookbehindResult = extractDosageFromString(textBefore);
              if (lookbehindResult) {
                dosage = lookbehindResult.dosage;
                unit = lookbehindResult.unit;
              }
            }
          }

          // Convert mcg/µg to mg
          if (unit === 'mcg' || unit === 'µg') {
            unit = 'mg';
            dosage = String(parseFloat(dosage) / 1000);
          }

          foundIngredients.push({
            rowId: `row_ocr_${delayRowId++}`,
            searchVal: db.name,
            dbId: db.id,
            dosage: dosage,
            unit: unit === 'g' ? 'g' : 'mg',
            isPropBlend: dosage === '',
            isOpen: false
          });
        }
      });

      if (foundIngredients.length > 0) {
        setPwIngredients(foundIngredients);
      } else {
        alert("Couldn't detect any recognized ingredients on this label.");
      }

    } catch (err) {
      console.error(err);
      alert("Error scanning image.");
    } finally {
      setOcrLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const baseData = {
      name: name || (type === 'PRE_WORKOUT' ? 'Custom Pre-Workout' : 'Custom Protein'),
      type,
      price: parseFloat(price),
      servings: parseInt(servings, 10),
      servingSize: parseFloat(servingSize) || null
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Product Name</label>
              <input type="text" className="input-text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Total War" />
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3>Active Ingredients</h3>
                  <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: 'var(--accent-gradient)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, opacity: ocrLoading ? 0.7 : 1 }} disabled={ocrLoading}>
                    {ocrLoading ? 'Scanning...' : '📷 Scan Label'}
                  </button>
                </div>
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
