import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  title?: string;
}

export default function SignatureModal({ isOpen, onClose, onSave, title = "Gambar Tanda Tangan" }: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Handle High DPI displays
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
        
        ctx.strokeStyle = "#1e293b"; // slate-800
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        // Fill canvas with white background so transparency isn't an issue
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCoordinates = (e: any) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Handle Touch vs Mouse
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const { x, y } = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      isDrawingRef.current = true;
    }
  };

  const draw = (e: any) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const { x, y } = getCoordinates(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onSave(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative border border-slate-100">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center">
          <h4 className="text-sm font-bold tracking-wide">{title}</h4>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden relative group">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-40 block cursor-crosshair touch-none bg-white"
            />
            <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 pointer-events-none select-none">
              Gunakan jari atau mouse di sini
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={clearCanvas}
              className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs py-2.5 rounded-lg font-bold transition duration-150"
            >
              Bersihkan
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 rounded-lg font-bold transition duration-150 shadow-md shadow-emerald-600/20"
            >
              Gunakan tanda tangan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
