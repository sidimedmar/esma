
import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { Language } from '../types';

interface EditorCanvasProps {
  onCanvasReady: (canvas: fabric.Canvas) => void;
  backgroundImage: string;
  lang: Language;
  onShutterClick?: () => void;
  onRotateClick?: () => void;
  onGalleryClick?: () => void;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({ 
  onCanvasReady, backgroundImage, lang, onShutterClick, onRotateClick, onGalleryClick 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current && !fabricRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 340,
        height: 600,
        backgroundColor: 'transparent',
        preserveObjectStacking: true,
        selection: true,
      });

      fabricRef.current = canvas;
      onCanvasReady(canvas);

      // Add default welcome text
      const welcome = new fabric.IText('Double clic pour éditer', {
        left: 170,
        top: 300,
        fontFamily: 'Poppins',
        fontSize: 16,
        fill: '#ffffff',
        originX: 'center',
        opacity: 0.5,
      });
      canvas.add(welcome);
      canvas.renderAll();
    }
  }, [onCanvasReady]);

  return (
    <div className="relative isolate">
      {/* Phone Frame */}
      <div className="relative h-[640px] w-[360px] border-[10px] border-gray-800 rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden bg-black ring-1 ring-white/10 z-10">
        
        {/* Dynamic Background Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 z-0"
          style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none', backgroundColor: '#000' }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Fabric Canvas Interaction Layer */}
        <div className="relative z-20 w-full h-full flex items-center justify-center">
          <canvas ref={canvasRef} />
        </div>

        {/* Notches & Static Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-30 shadow-inner"></div>

        {/* Simulation Interaction Buttons (STRICT Z-INDEX 50) */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-between px-10 items-center z-50 pointer-events-none">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onGalleryClick?.(); }}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-2xl flex items-center justify-center border border-white/20 hover:bg-white/30 transition-all active:scale-90 pointer-events-auto shadow-2xl"
            title="Importer Image"
          >
            <i className="fa-solid fa-image text-white text-sm"></i>
          </button>
          
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShutterClick?.(); }}
            className="w-20 h-20 rounded-full border-[8px] border-white shadow-2xl hover:scale-110 transition-all active:scale-90 bg-transparent pointer-events-auto"
            title="Prendre Photo"
          ></button>
          
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRotateClick?.(); }}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-2xl flex items-center justify-center border border-white/20 hover:bg-white/30 transition-all active:scale-90 pointer-events-auto shadow-2xl"
            title="Changer de Scène"
          >
            <i className="fa-solid fa-rotate text-white text-sm"></i>
          </button>
        </div>
      </div>
      
      {/* Decorative Glow */}
      <div className="absolute -inset-10 bg-purple-600/10 blur-[100px] -z-10 rounded-full"></div>
    </div>
  );
};

export default EditorCanvas;
