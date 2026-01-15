import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { generateId, createEmptyRow, MODEL_KEYS, MODEL_LABELS } from '../utils/helpers';
import { strategies } from '../utils/calculations';
import ExcelJS from 'exceljs';

// --- SVG ICONS DEFINITIONS ---
const IconPlaneFilled = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
);
const IconTruck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
);
const IconShip = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM12 6c-1.83 0-3.48.96-4.34 2.52l4.34 2.17 4.34-2.17C15.48 6.96 13.83 6 12 6zm-2.4 5.37l-4.2 2.1C3.89 14.28 5.3 16 7.5 16h9c2.2 0 3.61-1.72 2.1-2.53l-4.2-2.1-2.4 1.2-2.4-1.2z"/></svg>
);
const IconSave = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
);
const IconX = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const IconFolder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);
const IconUpload = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

const EditorView = ({ switchToViewer, setIsDirty }) => {
    const { getActiveClient, updateClientData, restoreClient } = useData();
    const client = getActiveClient();
    
    // UI State
    const [model, setModel] = useState('fixed');
    const [inputs, setInputs] = useState({
        origin: '', dest: '', 
        serviceMode: 'DOOR TO DOOR',
        category: 'AIR', 
        dimL: '', dimW: '', dimH: '', volDivisor: 6000,
        weight: '', chargeBasis: 'actual'
    });
    const [calcResult, setCalcResult] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // --- LOCAL DRAFT STATE ---
    const [localStore, setLocalStore] = useState(null);

    useEffect(() => {
        if (client) {
            setLocalStore(JSON.parse(JSON.stringify(client.data_store)));
            if(setIsDirty) setIsDirty(false);
        }
    }, [client?.id]); 

    const jsonInputRef = useRef(null);
    const excelInputRef = useRef(null);

    const dataStore = localStore; 
    const modelData = dataStore ? dataStore[model] : null;
    const activeProfileId = modelData ? modelData.activeId : null;
    const activeProfile = (modelData && activeProfileId) ? modelData.profiles[activeProfileId] : null;

    const updateStore = (newStore) => {
        setLocalStore(newStore);
        if(setIsDirty) setIsDirty(true);
    };

    // --- CALCULATION LOGIC ---
    const handleCalculate = () => {
        if (!activeProfile) return;
        
        const L = parseFloat(inputs.dimL) || 0;
        const W = parseFloat(inputs.dimW) || 0;
        const H = parseFloat(inputs.dimH) || 0;
        const div = parseFloat(inputs.volDivisor) || 6000;
        const volWt = parseFloat(((div > 0) ? (L * W * H) / div : 0).toFixed(2));
        const cbm = (L * W * H) / 1000000;
        const actWt = parseFloat(inputs.weight) || 0;
        
        const chargeable = inputs.chargeBasis === 'volumetric' ? volWt : actWt;
        
        const routeIndex = activeProfile.rows.findIndex(r => r.origin === inputs.origin && r.dest === inputs.dest);
        
        let result = { price: 0, error: null, actWt, volWt, cbm, routeIndex };

        if (chargeable <= 0) {
            result.error = "Invalid Weight";
            setCalcResult(result);
            return;
        }

        if (routeIndex === -1) {
            result.error = "Route Not Found";
            setCalcResult(result);
            return;
        }

        const route = activeProfile.rows[routeIndex];
        const strategy = strategies[model] || strategies.fixed;
        const price = strategy(chargeable, route.rates, activeProfile.limits);

        if (price === null) {
            result.error = "Invalid/Over Limit";
        } else {
            result.price = price;
        }
        setCalcResult(result);
    };

    // --- SAVE TRANSITION HANDLER ---
    const handleSaveTransition = () => {
        updateClientData(client.id, localStore);
        setIsSaving(true);
        if(setIsDirty) setIsDirty(false); 

        setTimeout(() => {
            switchToViewer();
        }, 1500);
    };

    // --- TABLE EDITING HANDLERS ---
    const handleEditRate = (rIdx, cIdx, val) => {
        const newData = JSON.parse(JSON.stringify(dataStore)); 
        const prof = newData[model].profiles[activeProfileId];
        prof.rows[rIdx].rates[cIdx] = val === "" ? null : parseFloat(val);
        updateStore(newData);
    };

    const handleEditRoute = (rIdx, field, val) => {
        const newData = JSON.parse(JSON.stringify(dataStore));
        const prof = newData[model].profiles[activeProfileId];
        prof.rows[rIdx][field] = val;
        updateStore(newData);
    };
    
    const addRow = () => {
        const newData = JSON.parse(JSON.stringify(dataStore));
        const prof = newData[model].profiles[activeProfileId];
        prof.rows.push(createEmptyRow(prof.limits.length));
        updateStore(newData);
    };

    const deleteRow = (idx) => {
        if(activeProfile.rows.length <=1) return;
        const newData = JSON.parse(JSON.stringify(dataStore));
        const prof = newData[model].profiles[activeProfileId];
        prof.rows.splice(idx, 1);
        updateStore(newData);
    };

    const addColumn = () => {
        const newData = JSON.parse(JSON.stringify(dataStore));
        const prof = newData[model].profiles[activeProfileId];
        const last = prof.limits[prof.limits.length -1] || 0;
        prof.limits.push(last + 50);
        prof.rows.forEach(r => r.rates.push(null));
        updateStore(newData);
    };
    
    const deleteColumn = (idx) => {
         const newData = JSON.parse(JSON.stringify(dataStore));
         const prof = newData[model].profiles[activeProfileId];
         if(prof.limits.length <= 1) return;
         prof.limits.splice(idx, 1);
         prof.rows.forEach(r => r.rates.splice(idx, 1));
         updateStore(newData);
    };

    const handleLimitChange = (idx, val) => {
        const newData = JSON.parse(JSON.stringify(dataStore));
        const prof = newData[model].profiles[activeProfileId];
        prof.limits[idx] = parseFloat(val);
        updateStore(newData);
    };

    // --- PROFILE MANAGEMENT ---
    const addNewProfile = () => {
        const name = prompt("Table Name:");
        if(!name) return;
        const newData = JSON.parse(JSON.stringify(dataStore));
        const pid = generateId('p_');
        const defLimits = [50,100,150,500];
        newData[model].profiles[pid] = {
            name, limits: defLimits, rows: [createEmptyRow(defLimits.length)]
        };
        newData[model].activeId = pid;
        updateStore(newData);
    };

    const renameProfile = () => {
        if (!activeProfile) return;
        const newName = prompt("Enter new table name:", activeProfile.name);
        if (newName && newName.trim() !== "") {
            const newData = JSON.parse(JSON.stringify(dataStore));
            newData[model].profiles[activeProfileId].name = newName.trim();
            updateStore(newData);
        }
    };

    const deleteProfile = () => {
        if (!modelData) return;
        const profileIds = Object.keys(modelData.profiles);
        if (profileIds.length <= 1) {
            alert("Cannot delete the last table. Please create a new one first.");
            return;
        }
        if (!confirm(`Are you sure you want to delete table "${activeProfile.name}"? This cannot be undone.`)) return;

        const newData = JSON.parse(JSON.stringify(dataStore));
        delete newData[model].profiles[activeProfileId];
        const remainingIds = Object.keys(newData[model].profiles);
        newData[model].activeId = remainingIds[0];
        updateStore(newData);
    };

    // --- IMPORT / EXPORT HANDLERS ---
    const handleExportExcel = async () => {
        if(!activeProfile) return;
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Rates");
        
        const colDefs = [
            { header: 'Origin', width: 15 },
            { header: 'Destination', width: 15 }
        ];
        
        activeProfile.limits.forEach((lim, i) => {
            const prev = i === 0 ? 1 : activeProfile.limits[i-1] + 1;
            colDefs.push({ header: `${prev}-${lim}`, width: 10 });
        });

        ws.addRow([`Client: ${client.name}`]);
        ws.addRow([`Table: ${activeProfile.name}`]);
        ws.addRow([`Category: ${inputs.category}`]);
        ws.addRow([`Service Mode: ${inputs.serviceMode}`]);
        ws.addRow([`Export Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`]);
        ws.addRow([]); 

        const headerRow = ws.addRow(colDefs.map(c => c.header));
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        });

        if (activeProfile.rows && activeProfile.rows.length > 0) {
            activeProfile.rows.forEach(r => {
                const safeRates = Array.isArray(r.rates) ? r.rates : [];
                const rowData = [
                    r.origin || "", 
                    r.dest || "", 
                    ...safeRates.map(val => {
                        return (val === null || val === undefined || val === "") ? "" : Number(val);
                    })
                ];
                const newRow = ws.addRow(rowData);
                newRow.hidden = false;
            });
        }

        colDefs.forEach((def, i) => {
            ws.getColumn(i + 1).width = def.width;
        });
        
        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${client.name}_${inputs.category}_${inputs.serviceMode}_${activeProfile.name}.xlsx`;
        a.click();
    };

    const handleBackupJson = () => {
        const exportObj = {
            app_version: "ratrix_v3_client_backup",
            client_data: client
        };
        const json = JSON.stringify(exportObj, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `backup_${client.name.replace(/ /g,'_')}.json`;
        a.click();
    };

    const handleRestoreJson = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const imported = JSON.parse(evt.target.result);
                if (imported.app_version === "ratrix_v3_client_backup" && imported.client_data) {
                    if(confirm(`Restore data for "${imported.client_data.name}"? This will create a NEW client entry.`)) {
                        restoreClient(imported.client_data);
                        alert("Client restored successfully!");
                    }
                } else {
                    alert("Invalid backup file.");
                }
            } catch (err) {
                console.error(err);
                alert("Error parsing JSON.");
            }
        };
        reader.readAsText(file);
        e.target.value = ''; 
    };

    const handleImportExcel = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const buffer = evt.target.result;
            const wb = new ExcelJS.Workbook();
            await wb.xlsx.load(buffer);
            const ws = wb.getWorksheet(1);
            if (!ws || ws.rowCount < 2) { alert("Invalid Excel."); return; }

            let headerRowIdx = -1;
            for(let i=1; i<=10; i++) {
                const row = ws.getRow(i);
                const val = row.getCell(1).value ? row.getCell(1).value.toString() : '';
                if(val.trim() === 'Origin') { headerRowIdx = i; break; }
            }

            if(headerRowIdx === -1) { alert("Header row 'Origin' not found."); return; }

            const headerRow = ws.getRow(headerRowIdx);
            const headers = [];
            headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                headers[colNumber] = cell.value ? cell.value.toString() : "";
            });

            const newLimits = [];
            const rateColIndices = [];
            
            headers.forEach((h, colIdx) => {
                if(!h) return;
                const normalized = h.trim().replace(/rate_/i, '').replace(/-/g, '_');
                const parts = normalized.split('_');
                const limitVal = parseFloat(parts[parts.length - 1]);
                
                if(!isNaN(limitVal) && limitVal > 0) {
                      newLimits.push(limitVal);
                      rateColIndices.push(colIdx);
                }
            });

            if(newLimits.length === 0) { alert("No rate columns found in header."); return; }

            let limitsChanged = false;
            if(JSON.stringify(newLimits) !== JSON.stringify(activeProfile.limits)) {
                if(!confirm("The Excel file has different weight columns. Update table structure?")) return;
                limitsChanged = true;
            }

            const newRows = [];
            ws.eachRow((row, rowNumber) => {
                if(rowNumber <= headerRowIdx) return;
                const origin = row.getCell(1).value ? row.getCell(1).value.toString().trim() : "";
                const dest = row.getCell(2).value ? row.getCell(2).value.toString().trim() : "";
                
                if(!origin && !dest) return;

                const rowRates = [];
                rateColIndices.forEach(colIdx => {
                    const cellVal = row.getCell(colIdx).value;
                    let val = (cellVal && typeof cellVal === 'object' && cellVal.result !== undefined) ? cellVal.result : cellVal;
                    val = parseFloat(val);
                    rowRates.push(isNaN(val) ? null : val);
                });
                
                newRows.push({ origin, dest, rates: rowRates });
            });

            const newData = JSON.parse(JSON.stringify(dataStore));
            const prof = newData[model].profiles[activeProfileId];
            
            if(limitsChanged) {
                prof.limits = newLimits;
            }
            prof.rows = newRows;

            updateStore(newData);
            alert("Import Successful!");
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
    };

    if (!client || !localStore || !activeProfile) return <div>Loading...</div>;

    const origins = [...new Set(activeProfile.rows.map(r => r.origin).filter(Boolean))];
    const dests = [...new Set(activeProfile.rows.map(r => r.dest).filter(Boolean))];

    return (
        <div className="calculator-container">
            {isSaving && (
                <div className="save-animation-overlay">
                    <div className="shockwave-ring"></div>
                    <div className="stamp-text">SAVED</div>
                </div>
            )}

            <div className="header">
                <h1>RATRIX <span style={{fontWeight:400, color:'var(--border-color)', margin:'0 10px'}}>|</span> 
                    <span className="current-client-badge">{client.name}</span>
                    <span style={{fontSize: '0.7rem', color:'var(--text-muted)', marginLeft: '10px', fontWeight: 'normal', fontFamily:'monospace'}}>#{client.id}</span>
                </h1>
                <button className="btn-save-view" onClick={handleSaveTransition} style={{display:'flex', alignItems:'center', gap:8}}>
                    <IconSave /> 
                    <span>Save & View</span>
                </button>
            </div>

            <div className="content-grid">
                <div className="input-panel">
                    <div className="input-group">
                        <label>Pricing Model</label>
                        <select value={model} onChange={(e) => setModel(e.target.value)}>
                            {/* NEW: Use MODEL_LABELS to display friendly names */}
                            {MODEL_KEYS.map(k => <option key={k} value={k}>{MODEL_LABELS[k]}</option>)}
                        </select>
                    </div>

                    <div className="input-group" style={{paddingTop: 10, borderTop: '1px dashed var(--border-color)'}}>
                        <label>Saved Table</label>
                        <div style={{display:'flex', gap: '8px', width: '100%', alignItems:'center'}}>
                            <select value={activeProfileId} onChange={(e) => {
                                const newData = JSON.parse(JSON.stringify(dataStore));
                                newData[model].activeId = e.target.value;
                                updateStore(newData);
                            }} style={{flex: 1, minWidth: 0, height: '35px'}}>
                                {Object.keys(modelData.profiles).map(pid => (
                                    <option key={pid} value={pid}>{modelData.profiles[pid].name}</option>
                                ))}
                            </select>
                            
                            <button 
                                onClick={addNewProfile} 
                                title="Add New Table"
                                style={{
                                    width: '35px', height: '35px', cursor:'pointer', 
                                    background:'var(--bg-container)', border:'1px solid var(--brand-primary)', 
                                    color:'var(--brand-primary)', borderRadius:'6px', 
                                    display:'flex', alignItems:'center', justifyContent:'center', padding:0
                                }}
                            >
                                <IconPlus />
                            </button>
                            <button 
                                onClick={renameProfile} 
                                title="Rename Current Table"
                                style={{
                                    width: '35px', height: '35px', cursor:'pointer', 
                                    background:'var(--bg-container)', border:'1px solid var(--text-muted)', 
                                    color:'var(--text-muted)', borderRadius:'6px', 
                                    display:'flex', alignItems:'center', justifyContent:'center', padding:0
                                }}
                            >
                                <IconEdit />
                            </button>
                            <button 
                                onClick={deleteProfile} 
                                title="Delete Current Table"
                                style={{
                                    width: '35px', height: '35px', cursor:'pointer', 
                                    background:'var(--bg-container)', border:'1px solid var(--state-danger-text)', 
                                    color:'var(--state-danger-text)', borderRadius:'6px', 
                                    display:'flex', alignItems:'center', justifyContent:'center', padding:0
                                }}
                            >
                                <IconTrash />
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Category</label>
                        <div className="category-selector">
                            <button 
                                className={`category-btn air ${inputs.category === 'AIR' ? 'active' : ''}`}
                                onClick={() => setInputs({...inputs, category: 'AIR'})}
                            >
                                <span className="icon"><IconPlaneFilled /></span> Air
                            </button>
                            <button 
                                className={`category-btn land ${inputs.category === 'LAND' ? 'active' : ''}`}
                                onClick={() => setInputs({...inputs, category: 'LAND'})}
                            >
                                <span className="icon"><IconTruck /></span> Land
                            </button>
                            <button 
                                className={`category-btn sea ${inputs.category === 'SEA' ? 'active' : ''}`}
                                onClick={() => setInputs({...inputs, category: 'SEA'})}
                            >
                                <span className="icon"><IconShip /></span> Sea
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Service Mode</label>
                        <select value={inputs.serviceMode} onChange={e => setInputs({...inputs, serviceMode: e.target.value})}>
                            <option value="DOOR TO DOOR">DOOR TO DOOR</option>
                            <option value="PORT TO PORT">PORT TO PORT</option>
                            <option value="DOOR TO PORT">DOOR TO PORT</option>
                            <option value="PORT TO DOOR">PORT TO DOOR</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Route</label>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                            <select value={inputs.origin} onChange={e => setInputs({...inputs, origin: e.target.value})}>
                                <option value="">Origin</option>
                                {origins.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                            <select value={inputs.dest} onChange={e => setInputs({...inputs, dest: e.target.value})}>
                                <option value="">Dest</option>
                                {dests.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Dimensions (cm)</label>
                        <div className="dim-grid">
                            <input type="number" placeholder="L" value={inputs.dimL} onChange={e => setInputs({...inputs, dimL: e.target.value})} />
                            <input type="number" placeholder="W" value={inputs.dimW} onChange={e => setInputs({...inputs, dimW: e.target.value})} />
                            <input type="number" placeholder="H" value={inputs.dimH} onChange={e => setInputs({...inputs, dimH: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="input-group">
                         <label>Vol Divisor</label>
                         <input type="number" value={inputs.volDivisor} onChange={e => setInputs({...inputs, volDivisor: e.target.value})} />
                    </div>

                    <div className="input-group">
                         <label>Weight (kg)</label>
                         <input type="number" value={inputs.weight} onChange={e => setInputs({...inputs, weight: e.target.value})} />
                    </div>

                    <div className="input-group">
                        <label>Charge Basis</label>
                        <select value={inputs.chargeBasis} onChange={e => setInputs({...inputs, chargeBasis: e.target.value})}>
                            <option value="actual">Actual Weight</option>
                            <option value="volumetric">Volumetric Weight</option>
                        </select>
                    </div>

                    <button id="calculateBtn" onClick={handleCalculate}>Calculate Freight</button>

                    {/* --- RESULT BOX (MOVED HERE) --- */}
                    <div className="result-box" style={{marginTop: '20px'}}>
                         <div className="stat-grid">
                            <div className="stat-item"><span className="stat-title">Actual</span><span className="stat-val">{calcResult ? calcResult.actWt : 0} kg</span></div>
                            <div className="stat-item"><span className="stat-title">Volumetric</span><span className="stat-val">{calcResult ? calcResult.volWt : 0} kg</span></div>
                            <div className="stat-item"><span className="stat-title">CBM</span><span className="stat-val">{calcResult ? calcResult.cbm.toFixed(4) : 0}</span></div>
                         </div>
                         <span className="result-label">Total Freight</span>
                         <span className="result-value">
                             {calcResult && calcResult.error ? calcResult.error : `Php ${calcResult ? calcResult.price.toFixed(2) : '0.00'}`}
                         </span>
                         <span className="formula-text">
                            {calcResult && !calcResult.error 
                                ? `${inputs.category} | ${MODEL_LABELS[model]} | ${inputs.serviceMode}` 
                                : 'Enter details to calculate'}
                         </span>
                    </div>
                </div>

                <div className="info-panel">
                    {/* --- BUTTONS MOVED TO TOP OF TABLE --- */}
                    <div className="action-bar" style={{marginBottom: '10px'}}>
                        <button onClick={addRow} className="btn-add">+ Add Route</button>
                        <button onClick={addColumn} className="btn-add" style={{background: 'var(--bg-secondary)', color:'var(--text-muted)'}}>+ Add Weight Col</button>
                    </div>

                    <div className="table-wrapper">
                        <table className="rate-table">
                            <thead>
                                <tr>
                                    <th style={{width:100}}>Origin</th>
                                    <th style={{width:100}}>Dest</th>
                                    {activeProfile.limits.map((lim, i) => {
                                        const prev = i === 0 ? 1 : activeProfile.limits[i-1] + 1;
                                        return (
                                            <th key={i}>
                                                 <div className="col-header-container">
                                                    <button className="btn-col-delete" onClick={() => deleteColumn(i)}><IconX size={10} /></button>
                                                    <div className="range-wrapper">
                                                        <span>{prev}-</span>
                                                        <input type="number" className="header-input" value={lim} onChange={(e) => handleLimitChange(i, e.target.value)} />
                                                    </div>
                                                 </div>
                                            </th>
                                        );
                                    })}
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeProfile.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className={calcResult && calcResult.routeIndex === rIdx ? 'active-route-row' : ''}>
                                        <td>
                                            <input className="editable-input text-input" value={row.origin} onChange={(e) => handleEditRoute(rIdx, 'origin', e.target.value)} />
                                        </td>
                                        <td>
                                            <input className="editable-input text-input" value={row.dest} onChange={(e) => handleEditRoute(rIdx, 'dest', e.target.value)} />
                                        </td>
                                        {activeProfile.limits.map((_, cIdx) => (
                                            <td key={cIdx}>
                                                <input className="editable-input" 
                                                    type="number"
                                                    value={row.rates[cIdx] === null ? "" : row.rates[cIdx]} 
                                                    placeholder="-"
                                                    onChange={(e) => handleEditRate(rIdx, cIdx, e.target.value)} />
                                            </td>
                                        ))}
                                        <td>
                                            <button className="btn-delete" onClick={() => deleteRow(rIdx)}><IconX size={12}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style={{display:'flex', gap:10, marginBottom:15}}>
                        <button onClick={handleExportExcel} className="btn-export">Download Excel (XLSX)</button>
                        <button onClick={handleBackupJson} className="btn-export">Backup Client Data (JSON)</button>
                    </div>

                    <div style={{marginBottom: 20, borderTop: '1px dashed var(--border-color)', paddingTop: 15, display:'flex', gap:10}}>
                        <div style={{flex:1}}>
                             <input type="file" accept=".xlsx" ref={excelInputRef} style={{display:'none'}} onChange={handleImportExcel} />
                             <button className="btn-import" style={{background:'var(--bg-container)', border:'1px solid var(--brand-primary)', color:'var(--brand-primary)', display:'flex', alignItems:'center', justifyContent:'center', gap:8}}
                                onClick={() => excelInputRef.current.click()}>
                                <IconUpload /> Import Excel Rates
                             </button>
                        </div>
                        <div style={{flex:1}}>
                             <input type="file" accept=".json" ref={jsonInputRef} style={{display:'none'}} onChange={handleRestoreJson} />
                             <button className="btn-import" onClick={() => jsonInputRef.current.click()} style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                                <IconFolder /> Restore Client Backup
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorView;