import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Copy, Check, Bookmark, X, Share2, Sparkles, BookOpen, FileText, Landmark, Compass } from 'lucide-react';
import { LexiconWord } from '../types';
import { speakWord } from '../utils/speech';

interface WordDetailModalProps {
  word: LexiconWord | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onWordSearch?: (word: string) => void;
}

export function WordDetailModal({
  word,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onWordSearch
}: WordDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [shared, setShared] = useState(false);

  if (!word) return null;

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(15);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleSpeak = () => {
    triggerHaptic();
    speakWord(
      word.word,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const handleCopy = () => {
    triggerHaptic();
    navigator.clipboard.writeText(
      `${word.word} (${word.pos})\nDef: ${word.definition}\nManuscript Context: ${word.manuscriptExample}\nConference Context: ${word.conferenceExample}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    triggerHaptic();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Scholar Lexicon: ${word.word}`,
          text: `${word.word} - ${word.definition}`,
          url: window.location.href,
        });
      } catch (e) {
        // fallback
      }
    } else {
      handleCopy();
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleSynAntClick = (text: string) => {
    if (onWordSearch) {
      onWordSearch(text);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal / Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#121216] border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl z-10 flex flex-col no-scrollbar"
          >
            {/* Drag Handle for Mobile */}
            <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-6 sm:hidden shrink-0" />

            {/* Top Bar Badges */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                {/* POS: Lavender / Purple Pill */}
                <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/40 uppercase tracking-wider font-medium">
                  {word.pos}
                </span>
                {/* Domain Category Tags: Pastel Blue / Slate Pills */}
                {word.tags && word.tags.map((tag, i) => (
                  <span key={i} className="text-xs font-mono text-sky-300 bg-sky-950/60 px-2.5 py-1 rounded-full border border-sky-800/40">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Word Header */}
            <div className="mb-6">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="text-4xl sm:text-5xl font-serif italic text-zinc-50 tracking-tight font-medium">
                    {word.word}
                  </h2>
                  {word.pronunciation && (
                    <p className="text-sm font-mono text-emerald-400/90 mt-1">
                      {word.pronunciation}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSpeak}
                  className={`p-3 rounded-full bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-lg flex items-center justify-center shrink-0 ${
                    isSpeaking ? 'ring-4 ring-emerald-400/40 animate-pulse' : ''
                  }`}
                  title="Listen Pronunciation"
                >
                  <Volume2 size={20} />
                </button>
              </div>

              {/* Sound Wave Animation when speaking */}
              {isSpeaking && (
                <div className="flex items-center gap-1 mt-3">
                  <span className="text-xs font-mono text-emerald-400 mr-2">Pronouncing...</span>
                  {[0, 1, 2, 3, 4].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: ['4px', '16px', '4px'] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                      className="w-1 bg-emerald-400 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action Dock */}
            <div className="grid grid-cols-3 gap-3 mb-6 bg-zinc-900/60 p-2 rounded-2xl border border-zinc-800/80">
              <button
                onClick={() => {
                  triggerHaptic();
                  onToggleBookmark();
                }}
                className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all text-xs font-mono gap-1.5 ${
                  isBookmarked
                    ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Bookmark size={18} className={isBookmarked ? 'fill-amber-400' : ''} />
                <span>{isBookmarked ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800/50 gap-1.5"
              >
                {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800/50 gap-1.5"
              >
                {shared ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
                <span>{shared ? 'Shared' : 'Share'}</span>
              </button>
            </div>

            {/* Core Definition */}
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/70">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={15} className="text-emerald-400" />
                  <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Definition</h4>
                </div>
                <p className="text-zinc-200 font-sans text-base leading-relaxed">
                  {word.definition}
                </p>
              </div>

              {/* Etymology */}
              {word.etymology && (
                <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Compass size={14} className="text-amber-400/80" />
                    <h4 className="text-xs font-mono text-amber-400/80 uppercase tracking-widest">Etymology & Origin</h4>
                  </div>
                  <p className="text-zinc-300 font-sans text-xs leading-relaxed italic">
                    {word.etymology}
                  </p>
                </div>
              )}

              {/* Dual Context Cards */}
              <div className="space-y-3">
                {/* Manuscript Context */}
                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-sky-900/40">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <FileText size={15} className="text-sky-400 shrink-0" />
                    <h4 className="text-xs font-mono text-sky-300 uppercase tracking-widest font-semibold">Manuscript Context</h4>
                  </div>
                  <p className="text-zinc-200 font-serif italic text-base leading-relaxed">
                    "{word.manuscriptExample}"
                  </p>
                </div>

                {/* Conference & Meeting Context */}
                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-indigo-900/40">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Landmark size={15} className="text-indigo-400 shrink-0" />
                    <h4 className="text-xs font-mono text-indigo-300 uppercase tracking-widest font-semibold">Conference & Meeting Context</h4>
                  </div>
                  <p className="text-zinc-200 font-serif italic text-base leading-relaxed">
                    "{word.conferenceExample}"
                  </p>
                </div>
              </div>

              {/* Synonyms & Antonyms */}
              {((word.synonyms && word.synonyms.length > 0) || (word.antonyms && word.antonyms.length > 0)) && (
                <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
                  {word.synonyms && word.synonyms.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Sparkles size={13} className="text-emerald-400" />
                        <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">Synonyms</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {word.synonyms.map((syn, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSynAntClick(syn)}
                            className="text-xs font-mono text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40 hover:bg-emerald-900/80 transition-colors"
                          >
                            {syn}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {word.antonyms && word.antonyms.length > 0 && (
                    <div>
                      <span className="text-xs font-mono text-rose-400 uppercase tracking-widest block mb-2 font-semibold">Antonyms</span>
                      <div className="flex flex-wrap gap-2">
                        {word.antonyms.map((ant, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSynAntClick(ant)}
                            className="text-xs font-mono text-rose-300 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800/40 hover:bg-rose-900/80 transition-colors"
                          >
                            {ant}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
