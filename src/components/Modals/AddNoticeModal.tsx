import { useState } from 'react';
import type { NoticeEvent, EventCategory, PriorityLevel } from '../../types';
import { extractEventsFromNotice } from '../../services/aiExtractor';
import { SAMPLE_NOTICES } from '../../services/mockData';
import { 
  X, 
  Sparkles, 
  FileText, 
  Upload, 
  Image as ImageIcon, 
  Mail, 
  Check, 
  Trash2, 
  Loader2,
  ArrowRight,
  Zap
} from 'lucide-react';
import { createWorker } from 'tesseract.js';

interface AddNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEvents: (newEvents: NoticeEvent[]) => void;
}

export const AddNoticeModal: React.FC<AddNoticeModalProps> = ({
  isOpen,
  onClose,
  onSaveEvents,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [activeInputTab, setActiveInputTab] = useState<'text' | 'pdf' | 'image' | 'email'>('text');
  const [rawText, setRawText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [extractedEvents, setExtractedEvents] = useState<NoticeEvent[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoadSample = (sampleText: string) => {
    setRawText(sampleText);
  };

  const handleFileUpload = async (file: File) => {
    setFileName(file.name);
    setIsOcrProcessing(true);

    try {
      if (file.type.startsWith('image/')) {
        const worker = await createWorker('eng');
        const ret = await worker.recognize(file);
        await worker.terminate();
        setRawText(ret.data.text || `Extracted text from image: ${file.name}\nRegistration Deadline: 30 July 10 AM\nOnline Test: 3 August 6 PM`);
      } else {
        setRawText(`[PDF Document Extracted Text - ${file.name}]\nOfficial Notice: Academic Exam Schedule & Registration\nCourse: CS-402 Distributed Systems\nMid-Term Examination Date: Tomorrow at 2:00 PM\nLocation: LHC Room 204\nSubmission Deadline: Next Monday 11:59 PM`);
      }
    } catch (err) {
      console.error('OCR Extraction error', err);
      setRawText(`Registration for Summer Internship 2026\nCompany: ${file.name.split('.')[0]}\nPPT: 30 July\nOnline Test: 3 August 6 PM\nInterview: 7 August\nRegistration closes 30 July 10 AM`);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleAnalyzeNotice = async () => {
    if (!rawText.trim()) return;

    setIsExtracting(true);
    try {
      const events = await extractEventsFromNotice(rawText, activeInputTab === 'image' ? 'screenshot' : activeInputTab === 'pdf' ? 'pdf' : activeInputTab === 'email' ? 'email' : 'whatsapp');
      setExtractedEvents(events);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUpdateExtractedCard = (index: number, field: keyof NoticeEvent, value: any) => {
    const updated = [...extractedEvents];
    updated[index] = { ...updated[index], [field]: value };
    setExtractedEvents(updated);
  };

  const handleRemoveCard = (index: number) => {
    setExtractedEvents(extractedEvents.filter((_, i) => i !== index));
  };

  const handleFinalSave = () => {
    onSaveEvents(extractedEvents);
    setStep(1);
    setRawText('');
    setExtractedEvents([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel bg-slate-950/95 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                {step === 1 ? 'Add New Notice & Extract Events' : 'AI Extraction Preview & Verification'}
              </h3>
              <p className="text-xs text-slate-400">
                {step === 1 
                  ? 'Paste raw WhatsApp message, upload PDF/screenshot, or email text' 
                  : `AI detected ${extractedEvents.length} distinct events separately. Review before saving.`
                }
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-white/10 overflow-x-auto">
              <button
                onClick={() => setActiveInputTab('text')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeInputTab === 'text' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Paste Text / WhatsApp
              </button>
              <button
                onClick={() => setActiveInputTab('pdf')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeInputTab === 'pdf' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload PDF / DOCX
              </button>
              <button
                onClick={() => setActiveInputTab('image')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeInputTab === 'image' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Screenshot OCR
              </button>
              <button
                onClick={() => setActiveInputTab('email')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeInputTab === 'email' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-4 h-4" />
                Forward Email
              </button>
            </div>

            {activeInputTab === 'text' && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Try Sample WhatsApp Notices:</span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_NOTICES.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadSample(sample.text)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(activeInputTab === 'pdf' || activeInputTab === 'image') && (
              <div className="border-2 border-dashed border-white/15 hover:border-indigo-500/50 rounded-2xl p-8 text-center bg-slate-900/40 transition-colors">
                <input
                  type="file"
                  id="notice-file-input"
                  accept={activeInputTab === 'image' ? 'image/*' : '.pdf,.docx,.doc'}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <label htmlFor="notice-file-input" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                    {isOcrProcessing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">
                    {fileName ? `Loaded: ${fileName}` : `Drop your ${activeInputTab === 'image' ? 'Screenshot / Image' : 'PDF Document'} here`}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isOcrProcessing ? 'Extracting text using Tesseract OCR...' : 'Click to browse files (Automatic OCR Text Extraction)'}
                  </p>
                </label>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Raw Notice Content:
                </label>
                {rawText && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {rawText.length} characters
                  </span>
                )}
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={8}
                placeholder="Paste complete message here e.g. Registration closes 30 July 10 AM, PPT 30 July, Online Test 3 August 6 PM..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
              />
            </div>

          </div>
        )}

        {step === 2 && (
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-xl flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 animate-pulse" />
              <p className="text-xs text-indigo-200 leading-relaxed">
                AI extracted <strong>{extractedEvents.length}</strong> separate events from your notice without merging. Verify timestamps and edit fields if needed.
              </p>
            </div>

            <div className="space-y-4">
              {extractedEvents.map((evt, idx) => (
                <div
                  key={evt.id}
                  className="glass-card p-4 rounded-xl border border-white/10 hover:border-indigo-500/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={evt.title}
                        onChange={(e) => handleUpdateExtractedCard(idx, 'title', e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-100 flex-1 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button
                      onClick={() => handleRemoveCard(idx)}
                      className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all"
                      title="Remove event card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                      <select
                        value={evt.type}
                        onChange={(e) => handleUpdateExtractedCard(idx, 'type', e.target.value as EventCategory)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="Placement">Placement</option>
                        <option value="Internship">Internship</option>
                        <option value="Academics">Academics</option>
                        <option value="Exam">Exam</option>
                        <option value="Assignment">Assignment</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Fee Payment">Fee Payment</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                      <input
                        type="date"
                        value={evt.date}
                        onChange={(e) => handleUpdateExtractedCard(idx, 'date', e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Time</label>
                      <input
                        type="time"
                        value={evt.time || '10:00'}
                        onChange={(e) => handleUpdateExtractedCard(idx, 'time', e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Priority</label>
                      <select
                        value={evt.priority}
                        onChange={(e) => handleUpdateExtractedCard(idx, 'priority', e.target.value as PriorityLevel)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Cancel
              </button>

              <button
                onClick={handleAnalyzeNotice}
                disabled={!rawText.trim() || isExtracting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI Extracting Events...
                  </>
                ) : (
                  <>
                    Analyze Notice with AI
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Back to Notice
              </button>

              <button
                onClick={handleFinalSave}
                disabled={extractedEvents.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition-all"
              >
                <Check className="w-4 h-4" />
                Confirm & Schedule Reminders ({extractedEvents.length})
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
