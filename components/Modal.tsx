
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dynamic Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-[0_25px_100px_-15px_rgba(0,0,0,0.5)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ring-1 ring-black/5">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">{title}</h3>
            <div className="h-1 w-10 bg-purple-600 rounded-full"></div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:rotate-90 transition-all duration-300"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
