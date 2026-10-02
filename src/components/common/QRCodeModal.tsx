import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, Share2, MessageCircle, Send } from 'lucide-react';
import { Modal } from './ConfirmDialog';
import { useToast } from './Toast';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  payloadUrl?: string;
  title: string;
  userName: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  payloadUrl,
  title,
  userName,
}) => {
  const [svgString, setSvgString] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { showToast } = useToast();

  const qrTargetUrl = payloadUrl || url;

  useEffect(() => {
    if (!isOpen || !qrTargetUrl) return;

    // Generate SVG string
    QRCode.toString(
      qrTargetUrl,
      {
        type: 'svg',
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        width: 280,
      },
      (err, svg) => {
        if (!err && svg) {
          setSvgString(svg);
        }
      }
    );

    // Generate to Canvas for PNG download
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        qrTargetUrl,
        {
          width: 512,
          margin: 3,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error(error);
        }
      );
    }
  }, [isOpen, qrTargetUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('تم نسخ الرابط إلى الحافظة بنجاح!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const pngUrl = canvasRef.current.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `qrcode-${userName}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showToast('تم تحميل رمز QR بصيغة PNG', 'success');
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = `qrcode-${userName}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(blobUrl);
    showToast('تم تحميل رمز QR بصيغة SVG', 'success');
  };

  const shareText = encodeURIComponent(`تفضل بزيارة صفحتي الرقمية: ${userName}\n${url}`);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="رمز الاستجابة السريعة ومشاركة الصفحة"
      description={`صفحة ${title}`}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center space-y-5">
        {/* Hidden Canvas for PNG render */}
        <canvas ref={canvasRef} className="hidden" />

        {/* QR Preview Box */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-md flex items-center justify-center">
          {svgString ? (
            <div
              className="w-56 h-56 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: svgString }}
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">
              جاري تجهيز الرمز...
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500">
          اطبع هذا الرمز على بطاقات عملك، منشوراتك، أو واجهة متجرك لمسحه مباشرة.
        </p>

        {/* Action Buttons for Download */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          <button
            onClick={handleDownloadPng}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            تحميل PNG
          </button>
          <button
            onClick={handleDownloadSvg}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            تحميل SVG (للطباعة)
          </button>
        </div>

        {/* Link Copy Box */}
        <div className="w-full pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-600 text-right mb-1.5">
            الرابط المباشر للصفحة
          </label>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1.5 pr-3 text-xs text-slate-700">
            <span className="truncate flex-1 font-mono text-left dir-ltr select-all">{url}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg transition shrink-0 flex items-center gap-1 font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="w-full pt-2">
          <p className="text-xs font-semibold text-slate-600 text-right mb-2">مشاركة فورية عبر:</p>
          <div className="grid grid-cols-4 gap-2">
            <a
              href={`https://wa.me/?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200/60"
            >
              <MessageCircle className="w-4 h-4 mb-1" />
              <span className="text-[11px] font-medium">واتساب</span>
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition border border-sky-200/60"
            >
              <Send className="w-4 h-4 mb-1" />
              <span className="text-[11px] font-medium">تيليجرام</span>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition border border-slate-300/60"
            >
              <span className="font-bold text-xs mb-1">𝕏</span>
              <span className="text-[11px] font-medium">منصة X</span>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200/60"
            >
              <Share2 className="w-4 h-4 mb-1" />
              <span className="text-[11px] font-medium">فيسبوك</span>
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};
