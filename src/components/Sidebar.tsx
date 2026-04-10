import React from 'react';
import { Plus, Trash2, Download, Upload, Settings2, Layers, Crosshair } from 'lucide-react';
import { FieldBlock, CalibrationStep } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  blocks: FieldBlock[];
  activeBlockId: string | null;
  calibrationStep: CalibrationStep;
  showPreview: boolean;
  bubbleDimensions: [number, number];
  onTogglePreview: () => void;
  onBubbleDimensionsChange: (dims: [number, number]) => void;
  onAddBlock: (type: FieldBlock['fieldType']) => void;
  onSelectBlock: (id: string) => void;
  onBlockUpdate: (block: FieldBlock) => void;
  onDeleteBlock: (id: string) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  blocks,
  activeBlockId,
  calibrationStep,
  showPreview,
  bubbleDimensions,
  onTogglePreview,
  onBubbleDimensionsChange,
  onAddBlock,
  onSelectBlock,
  onBlockUpdate,
  onDeleteBlock,
  onExport,
  onImport,
  onImageUpload,
}) => {
  return (
    <div className="w-[400px] h-full bg-[var(--panel-bg)] border-l border-[var(--border)] flex flex-col shadow-2xl z-10">
      <div className="p-6 border-bottom border-[var(--border)]">
        <h1 className="text-xl font-bold tracking-tight mb-1">OMR Calibrator</h1>
        <p className="text-xs text-[var(--text-secondary)] font-mono uppercase tracking-widest">Visual Template Engine</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* Actions */}
        <section>
          <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold mb-4 flex items-center gap-2">
            <Settings2 size={12} /> Project Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col items-center justify-center p-4 border border-dashed border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all cursor-pointer group">
              <Upload size={20} className="mb-2 text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
              <span className="text-xs font-medium">Upload Sheet</span>
              <input type="file" className="hidden" accept="image/*" onChange={onImageUpload} />
            </label>
            <button 
              onClick={onExport}
              className="flex flex-col items-center justify-center p-4 border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all group"
            >
              <Download size={20} className="mb-2 text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
              <span className="text-xs font-medium">Export JSON</span>
            </button>
          </div>
          <button 
            onClick={onTogglePreview}
            className={cn(
              "w-full mt-3 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all text-xs font-medium",
              showPreview 
                ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]" 
                : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", showPreview ? "bg-[var(--accent)]" : "bg-white/20")} />
            {showPreview ? "Overlay Enabled" : "Overlay Disabled"}
          </button>

          <div className="mt-4 p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
            <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold mb-3">Bubble Calibration</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1">Width (px)</label>
                <input 
                  type="number" 
                  value={bubbleDimensions[0]}
                  onChange={(e) => onBubbleDimensionsChange([parseInt(e.target.value) || 0, bubbleDimensions[1]])}
                  className="w-full bg-[var(--panel-bg)] border border-[var(--border)] rounded px-2 py-1 text-xs focus:border-[var(--accent)] outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1">Height (px)</label>
                <input 
                  type="number" 
                  value={bubbleDimensions[1]}
                  onChange={(e) => onBubbleDimensionsChange([bubbleDimensions[0], parseInt(e.target.value) || 0])}
                  className="w-full bg-[var(--panel-bg)] border border-[var(--border)] rounded px-2 py-1 text-xs focus:border-[var(--accent)] outline-none"
                />
              </div>
            </div>
            <p className="text-[9px] text-[var(--text-secondary)] mt-2 italic">Adjust these values to match the size of bubbles on your sheet.</p>
          </div>
        </section>

        {/* Blocks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold flex items-center gap-2">
              <Layers size={12} /> Field Blocks
            </h2>
            <div className="flex gap-1">
              <button 
                onClick={() => onAddBlock('QTYPE_MCQ4')}
                className="p-1.5 hover:bg-[var(--accent)]/10 text-[var(--accent)] rounded-md transition-colors flex items-center gap-1"
                title="Add MCQ Block"
              >
                <Plus size={14} /> <span className="text-[9px] font-bold">MCQ</span>
              </button>
              <button 
                onClick={() => onAddBlock('QTYPE_INT')}
                className="p-1.5 hover:bg-[var(--accent)]/10 text-[var(--accent)] rounded-md transition-colors flex items-center gap-1"
                title="Add INT Block"
              >
                <Plus size={14} /> <span className="text-[9px] font-bold">INT</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {blocks.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[var(--border)] rounded-xl">
                <p className="text-xs text-[var(--text-secondary)]">No blocks added yet</p>
              </div>
            ) : (
              blocks.map((block) => (
                <div 
                  key={block.id}
                  onClick={() => onSelectBlock(block.id)}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer group relative",
                    activeBlockId === block.id 
                      ? "bg-[var(--accent)]/10 border-[var(--accent)]" 
                      : "bg-[var(--bg)] border-[var(--border)] hover:border-[var(--text-secondary)]"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-semibold">{block.name}</h3>
                      <p className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">{block.fieldType}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBlock(block.id);
                      }}
                      className="p-1 text-[var(--text-secondary)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono text-[var(--text-secondary)]">
                    <span>Origin: {block.origin[0]}, {block.origin[1]}</span>
                    <span>Bubbles Gap: {block.bubblesGap}px</span>
                    <span>Labels Gap: {block.labelsGap}px</span>
                    <span>Labels: {block.fieldLabels.length}</span>
                  </div>

                  {activeBlockId === block.id && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-3">
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1">Block Name</label>
                        <input 
                          type="text" 
                          value={block.name}
                          onChange={(e) => onBlockUpdate({ ...block, name: e.target.value })}
                          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 text-xs focus:border-[var(--accent)] outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1">Labels Count</label>
                          <input 
                            type="number" 
                            value={block.fieldLabels.length}
                            onChange={(e) => {
                              const count = parseInt(e.target.value) || 0;
                              const newLabels = Array.from({ length: count }).map((_, i) => `q${i + 1}`);
                              onBlockUpdate({ ...block, fieldLabels: newLabels });
                            }}
                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 text-xs focus:border-[var(--accent)] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1">Field Type</label>
                          <select 
                            value={block.fieldType}
                            onChange={(e) => onBlockUpdate({ ...block, fieldType: e.target.value as any })}
                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 text-xs focus:border-[var(--accent)] outline-none"
                          >
                            <option value="QTYPE_MCQ4">MCQ4</option>
                            <option value="QTYPE_INT">INT</option>
                            <option value="CUSTOM">CUSTOM</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1">Bubbles Gap</label>
                          <input 
                            type="number" 
                            value={block.bubblesGap}
                            onChange={(e) => onBlockUpdate({ ...block, bubblesGap: parseInt(e.target.value) || 0 })}
                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 text-xs focus:border-[var(--accent)] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1">Labels Gap</label>
                          <input 
                            type="number" 
                            value={block.labelsGap}
                            onChange={(e) => onBlockUpdate({ ...block, labelsGap: parseInt(e.target.value) || 0 })}
                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 text-xs focus:border-[var(--accent)] outline-none"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => onSelectBlock(block.id)} // This triggers calibration restart in App.tsx if we wanted, but here we just use it to focus
                        className="w-full py-2 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[var(--accent)]/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Crosshair size={12} /> Recalibrate
                      </button>
                    </div>
                  )}

                  {activeBlockId === block.id && calibrationStep !== 'IDLE' && (
                    <div className="mt-3 pt-3 border-t border-[var(--accent)]/20 flex items-center gap-2 text-[10px] text-[var(--accent)] font-bold animate-pulse">
                      <Crosshair size={10} />
                      CALIBRATING: {calibrationStep.replace(/_/g, ' ')}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Instructions */}
        <section className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)]">
          <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold mb-3">Quick Guide</h2>
          <ul className="text-xs space-y-2 text-[var(--text-secondary)] leading-relaxed">
            <li className="flex gap-2">
              <span className="text-[var(--accent)] font-bold">1.</span>
              Upload your OMR sheet image.
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--accent)] font-bold">2.</span>
              Add a block and select it to start calibration.
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--accent)] font-bold">3.</span>
              Click the first bubble to set the origin.
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--accent)] font-bold">4.</span>
              Click the next bubble in the column to set vertical gap.
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--accent)] font-bold">5.</span>
              Click the next bubble in the row to set horizontal gap.
            </li>
          </ul>
        </section>
      </div>

      <div className="p-6 border-t border-[var(--border)] bg-[var(--bg)]">
        <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono">
          <span>v1.0.0</span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> System Online
          </span>
        </div>
      </div>
    </div>
  );
};
