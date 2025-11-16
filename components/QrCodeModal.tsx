
import React, { useEffect, useRef } from 'react';
import { X } from './icons';
import { useTranslation } from '../context/LanguageContext';

declare const QRCode: any; // Declare the global QRCode object from the script

interface QrCodeModalProps {
  url: string;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ url, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (canvasRef.current && typeof QRCode !== 'undefined') {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#e2e8f0', // slate-200
          light: '#1e293b' // slate-800
        }
      }, (error: any) => {
        if (error) console.error(error);
      });
    }
  }, [url]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-cyan-300">{t('QR_MODAL_TITLE')}</h3>
        <div className="p-2 bg-slate-200 rounded-lg inline-block">
            <canvas ref={canvasRef} width="256" height="256"></canvas>
        </div>
        <p className="text-sm text-slate-400 break-all">{url}</p>
        <button 
          onClick={onClose}
          className="mt-4 w-full py-2 px-4 bg-slate-700 text-white font-semibold rounded-full hover:bg-slate-600 transition"
        >
          {t('QR_MODAL_CLOSE')}
        </button>
      </div>
    </div>
  );
};