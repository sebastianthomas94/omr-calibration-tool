import React, { useState, useCallback, useEffect } from 'react';
import { CanvasWorkbench } from './components/CanvasWorkbench';
import { Sidebar } from './components/Sidebar';
import { FieldBlock, OMRConfig, CalibrationStep, QuestionType } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { MousePointer2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [blocks, setBlocks] = useState<FieldBlock[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [calibrationStep, setCalibrationStep] = useState<CalibrationStep>("IDLE");
  const [showPreview, setShowPreview] = useState(true);
  const [bubbleDimensions, setBubbleDimensions] = useState<[number, number]>([40, 40]);
  const [pendingPoint, setPendingPoint] = useState<[number, number] | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        showNotification("Image uploaded successfully", "success");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddBlock = (type: QuestionType) => {
    const newBlock: FieldBlock = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Block_${blocks.length + 1}`,
      fieldType: type,
      origin: [100, 100],
      bubblesGap: 40,
      labelsGap: 40,
      fieldLabels: type === 'QTYPE_MCQ4' ? ["q1", "q2", "q3", "q4"] : ["q1", "q2"],
      direction: type === 'QTYPE_INT' ? 'vertical' : 'horizontal',
    };
    setBlocks([...blocks, newBlock]);
    setActiveBlockId(newBlock.id);
    setCalibrationStep("SELECT_ORIGIN");
    showNotification("Click the first bubble (top-left) to set origin");
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (!activeBlockId || calibrationStep === "IDLE") return;
    setPendingPoint([x, y]);
    showNotification("Point selected. Click 'Confirm' to save or click elsewhere to reposition.");
  };

  const handleConfirmPoint = () => {
    if (!activeBlockId || !pendingPoint) return;

    const [x, y] = pendingPoint;
    const updatedBlocks = blocks.map(block => {
      if (block.id !== activeBlockId) return block;

      if (calibrationStep === "SELECT_ORIGIN") {
        setCalibrationStep("SELECT_BUBBLE_GAP");
        showNotification(`Origin set. Now click the bubble to set ${block.fieldType === 'QTYPE_INT' ? 'vertical' : 'horizontal'} bubble gap`);
        return { ...block, origin: [x, y] as [number, number] };
      }

      if (calibrationStep === "SELECT_BUBBLE_GAP") {
        const gap = block.fieldType === 'QTYPE_INT' 
          ? Math.abs(y - block.origin[1]) 
          : Math.abs(x - block.origin[0]);
        setCalibrationStep("SELECT_LABEL_GAP");
        showNotification(`Bubble gap set. Now click the next label to set ${block.fieldType === 'QTYPE_INT' ? 'horizontal' : 'vertical'} label gap`);
        return { ...block, bubblesGap: gap };
      }

      if (calibrationStep === "SELECT_LABEL_GAP") {
        const gap = block.fieldType === 'QTYPE_INT'
          ? Math.abs(x - block.origin[0])
          : Math.abs(y - block.origin[1]);
        setCalibrationStep("IDLE");
        showNotification("Calibration complete!", "success");
        return { ...block, labelsGap: gap };
      }

      return block;
    });

    setBlocks(updatedBlocks);
    setPendingPoint(null);
  };

  const handleExport = () => {
    const config: OMRConfig = {
      pageDimensions: image ? [image.width, image.height] : [1846, 1500],
      bubbleDimensions: bubbleDimensions,
      preProcessors: [
        {
          name: "CropPage",
          options: { morphKernel: [10, 10] }
        },
        {
          name: "CropOnMarkers",
          options: { relativePath: "omr_marker.jpg", sheetToMarkerWidthRatio: 17 }
        }
      ],
      customLabels: {},
      fieldBlocks: blocks.reduce((acc, block) => {
        const { id, name, ...rest } = block;
        acc[name] = rest as any;
        return acc;
      }, {} as Record<string, FieldBlock>),
      outputColumns: blocks.flatMap(b => b.fieldLabels),
      emptyValue: "",
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omr-config.json';
    a.click();
    showNotification("Configuration exported", "success");
  };

  return (
    <div className="flex h-screen w-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <main className="flex-1 relative">
        {!image ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-6 border border-[var(--accent)]/20">
              <Upload size={40} className="text-[var(--accent)]" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome to OMR Calibrator</h2>
            <p className="text-[var(--text-secondary)] max-w-md mb-8 leading-relaxed">
              Upload an OMR sheet image to begin visually mapping bubbles to data fields. 
              Precision calibration made simple.
            </p>
            <label className="px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-xl font-semibold transition-all cursor-pointer shadow-lg shadow-blue-500/20">
              Select OMR Sheet
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
        ) : (
          <CanvasWorkbench 
            image={image}
            blocks={blocks}
            activeBlockId={activeBlockId}
            calibrationStep={calibrationStep}
            showPreview={showPreview}
            bubbleDimensions={bubbleDimensions}
            pendingPoint={pendingPoint}
            onCanvasClick={handleCanvasClick}
            onBlockUpdate={(updated) => setBlocks(blocks.map(b => b.id === updated.id ? updated : b))}
          />
        )}

        {/* Floating Notifications */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: 20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className={cn(
                "fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 border backdrop-blur-md",
                notification.type === 'success' ? "bg-green-500/20 border-green-500/50 text-green-400" : 
                notification.type === 'error' ? "bg-red-500/20 border-red-500/50 text-red-400" : 
                "bg-blue-500/20 border-blue-500/50 text-blue-400"
              )}
            >
              {notification.type === 'success' ? <CheckCircle2 size={18} /> : 
               notification.type === 'error' ? <AlertCircle size={18} /> : 
               <MousePointer2 size={18} />}
              <span className="text-sm font-medium">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Sidebar 
        blocks={blocks}
        activeBlockId={activeBlockId}
        calibrationStep={calibrationStep}
        showPreview={showPreview}
        bubbleDimensions={bubbleDimensions}
        pendingPoint={pendingPoint}
        onTogglePreview={() => setShowPreview(!showPreview)}
        onBubbleDimensionsChange={setBubbleDimensions}
        onConfirmPoint={handleConfirmPoint}
        onCancelPoint={() => setPendingPoint(null)}
        onAddBlock={handleAddBlock}
        onSelectBlock={(id) => {
          setActiveBlockId(id);
          setCalibrationStep("SELECT_ORIGIN");
          setPendingPoint(null);
          showNotification("Recalibrating: Click the first bubble to set origin");
        }}
        onBlockUpdate={(updated) => setBlocks(blocks.map(b => b.id === updated.id ? updated : b))}
        onDeleteBlock={(id) => {
          setBlocks(blocks.filter(b => b.id !== id));
          if (activeBlockId === id) setActiveBlockId(null);
        }}
        onExport={handleExport}
        onImport={() => {}}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
}

// Helper icons for the empty state
function Upload({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
