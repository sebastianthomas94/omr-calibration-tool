import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Circle, Rect, Group, Text } from 'react-konva';
import { FieldBlock, CalibrationStep } from '../types';

interface CanvasWorkbenchProps {
  image: HTMLImageElement | null;
  blocks: FieldBlock[];
  activeBlockId: string | null;
  calibrationStep: CalibrationStep;
  showPreview: boolean;
  bubbleDimensions: [number, number];
  pendingPoint: [number, number] | null;
  onCanvasClick: (x: number, y: number) => void;
  onBlockUpdate: (block: FieldBlock) => void;
}

export const CanvasWorkbench: React.FC<CanvasWorkbenchProps> = ({
  image,
  blocks,
  activeBlockId,
  calibrationStep,
  showPreview,
  bubbleDimensions,
  pendingPoint,
  onCanvasClick,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: window.innerWidth - 400, height: window.innerHeight });
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleStageClick = (e: any) => {
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    if (pointer) {
      const x = (pointer.x - stage.x()) / stage.scaleX();
      const y = (pointer.y - stage.y()) / stage.scaleY();
      onCanvasClick(Math.round(x), Math.round(y));
    }
  };

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (pointer) {
      const x = (pointer.x - stage.x()) / stage.scaleX();
      const y = (pointer.y - stage.y()) / stage.scaleY();
      setMousePos({ x: Math.round(x), y: Math.round(y) });
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0a0a0a] overflow-hidden relative cursor-crosshair">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        ref={stageRef}
        onClick={handleStageClick}
        draggable
      >
        <Layer>
          {image && <KonvaImage image={image} />}
          
          {showPreview && blocks.map((block) => {
            const numLabels = block.fieldLabels.length;
            const bubblesPerLabel = block.fieldType === 'QTYPE_MCQ4' ? 4 : block.fieldType === 'QTYPE_INT' ? 10 : (block.bubbleValues?.length || 1);
            
            return (
              <Group key={block.id} listening={false}>
                {/* Render all bubbles for this block */}
                {Array.from({ length: numLabels }).map((_, labelIndex) => (
                  <Group key={`label-${labelIndex}`} listening={false}>
                    {Array.from({ length: bubblesPerLabel }).map((_, bubbleIndex) => {
                      let x, y;
                      
                      if (block.fieldType === 'QTYPE_MCQ4') {
                        // MCQ: labelsGap is vertical (between questions), bubblesGap is horizontal (between A,B,C,D)
                        x = block.origin[0] + bubbleIndex * block.bubblesGap;
                        y = block.origin[1] + labelIndex * block.labelsGap;
                      } else if (block.fieldType === 'QTYPE_INT') {
                        // INT: labelsGap is horizontal (between columns), bubblesGap is vertical (between 0-9)
                        x = block.origin[0] + labelIndex * block.labelsGap;
                        y = block.origin[1] + bubbleIndex * block.bubblesGap;
                      } else {
                        // CUSTOM: uses direction
                        if (block.direction === 'vertical') {
                          x = block.origin[0] + labelIndex * block.labelsGap;
                          y = block.origin[1] + bubbleIndex * block.bubblesGap;
                        } else {
                          x = block.origin[0] + bubbleIndex * block.bubblesGap;
                          y = block.origin[1] + labelIndex * block.labelsGap;
                        }
                      }
                      
                      return (
                        <Circle
                          key={`bubble-${labelIndex}-${bubbleIndex}`}
                          x={x}
                          y={y}
                          radius={bubbleDimensions[0] / 2}
                          stroke={block.id === activeBlockId ? "#3b82f6" : "#8e9299"}
                          strokeWidth={2}
                          fill={block.id === activeBlockId ? "rgba(59, 130, 246, 0.2)" : "transparent"}
                          listening={false}
                        />
                      );
                    })}
                  </Group>
                ))}
                
                {/* Origin indicator */}
                <Rect
                  x={block.origin[0] - 5}
                  y={block.origin[1] - 5}
                  width={10}
                  height={10}
                  fill="#ef4444"
                  rotation={45}
                  listening={false}
                />
              </Group>
            );
          })}

          {/* Pending Point Indicator */}
          {pendingPoint && (
            <Group x={pendingPoint[0]} y={pendingPoint[1]}>
              <Circle
                radius={bubbleDimensions[0] / 2}
                stroke="#facc15"
                strokeWidth={3}
                dash={[5, 5]}
                fill="rgba(250, 204, 21, 0.1)"
              />
              <Rect
                x={-10}
                y={-1}
                width={20}
                height={2}
                fill="#facc15"
              />
              <Rect
                x={-1}
                y={-10}
                width={2}
                height={20}
                fill="#facc15"
              />
            </Group>
          )}
        </Layer>
      </Stage>

      {/* Overlay info */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="bg-black/80 border border-white/10 p-3 rounded-lg backdrop-blur-sm">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-mono">Status</div>
          <div className="text-sm font-medium text-white flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${calibrationStep !== 'IDLE' ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
            {calibrationStep === 'IDLE' ? 'Ready' : `Calibrating: ${calibrationStep.replace(/_/g, ' ')}`}
          </div>
        </div>

        <div className="bg-black/80 border border-white/10 p-3 rounded-lg backdrop-blur-sm">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-mono">Coordinates</div>
          <div className="text-sm font-mono text-white">
            X: {mousePos.x} Y: {mousePos.y}
          </div>
        </div>
      </div>
    </div>
  );
};
