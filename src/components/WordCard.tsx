import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, Copy, Check, Bookmark, FileText, Landmark, ExternalLink } from 'lucide-react';
import { LexiconWord } from '../types';
import { speakWord } from '../utils/speech';

export interface WordCardProps {
  key?: number;
  word: LexiconWord;
  index: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onSelectWord: (word: LexiconWord) => void;
  onWordSearch?: (word: string) => void;
}

export function WordCard({
  word,
  index,
  isBookmarked,
  onToggleBookmark,
  onSelectWord,
  onWordSearch
}: WordCardProps) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(10);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    speakWord(
      word.word,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    navigator.clipboard.writeText(
      `${word.word} (${word.pos})\nDef: ${word.definition}\nManuscript Context: ${word.manuscriptExample}\nConference Context: ${word.conferenceExample}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    onToggleBookmark();
  };

  const handleSynAntClick = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (onWordSearch) {
      onWordSearch(text);
    }
  };

  return (
    <div
      onClick={() => {
        triggerHaptic();
        onSelectWord(word);
      }}
      className="group relative flex flex-col justify-between p-6 rounded-2xl bg-zinc-900 border border-zinc-800/80 hover:border-emerald-500/40 active:border-emerald-500/60 transition-colors duration-200 shadow-xl cursor-pointer overflow-hidden"
    >
      {/* Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
            #{index.toString().padStart(2, '0')}
          </span>
          {/* POS Badge: Soft Lavender / Purple Pill */}
          <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-800/40 uppercase tracking-wider font-medium">
            {word.pos}
          </span>
          {/* Category Tags: Pastel Blue / Slate Pills */}
          {word.tags && word.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="text-[10px] font-mono text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-800/40">
              {tag}
            </span>
          ))}
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleSpeak}
            className={`p-2 rounded-xl text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800/80 active:bg-emerald-400/20 transition-all ${
              isSpeaking ? 'text-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-400/30 animate-pulse' : ''
            }`}
            title="Pronounce"
          >
            <Volume2 size={16} />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800/80 active:bg-emerald-400/20 transition-all"
            title="Copy"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-xl transition-all ${
              isBookmarked
                ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30'
                : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/80'
            }`}
            title="Bookmark"
          >
            <Bookmark size={16} className={isBookmarked ? 'fill-amber-400' : ''} />
          </button>
        </div>
      </div>

      {/* Word & Pronunciation */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-2xl md:text-3xl font-serif italic text-zinc-100 font-medium">
            {word.word}
          </h3>
          <ExternalLink size={14} className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0" />
        </div>
        {word.pronunciation && (
          <p className="text-xs font-mono text-emerald-400/80 mt-1">
            {word.pronunciation}
          </p>
        )}
      </div>

      {/* Definition */}
      <p className="text-xs md:text-sm text-zinc-300 font-sans leading-relaxed mb-5">
        {word.definition}
      </p>

      {/* Dual Context Cards (Manuscript & Conference) */}
      <div className="space-y-2.5 mb-5">
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-sky-400 font-mono text-[10px] uppercase tracking-wider mb-1 font-semibold">
            <FileText size={12} />
            <span>Manuscript / Editorial Context</span>
          </div>
          <p className="text-zinc-300 font-serif italic line-clamp-2">
            "{word.manuscriptExample}"
          </p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-[10px] uppercase tracking-wider mb-1 font-semibold">
            <Landmark size={12} />
            <span>Academic Meeting / Conference Context</span>
          </div>
          <p className="text-zinc-300 font-serif italic line-clamp-2">
            "{word.conferenceExample}"
          </p>
        </div>
      </div>

      {/* Footer: Interactive Synonyms / Antonyms & Details Link */}
      <div className="pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          {word.synonyms && word.synonyms.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-emerald-400/80 uppercase font-semibold">Syn:</span>
              {word.synonyms.slice(0, 2).map((syn, i) => (
                <button
                  key={i}
                  onClick={(e) => handleSynAntClick(e, syn)}
                  className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40 hover:bg-emerald-900/80 transition-colors"
                >
                  {syn}
                </button>
              ))}
            </div>
          )}
          {word.antonyms && word.antonyms.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-rose-400/80 uppercase font-semibold">Ant:</span>
              {word.antonyms.slice(0, 1).map((ant, i) => (
                <button
                  key={i}
                  onClick={(e) => handleSynAntClick(e, ant)}
                  className="text-[11px] font-mono text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/40 hover:bg-rose-900/80 transition-colors"
                >
                  {ant}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-[10px] text-zinc-400 font-mono ml-auto">
          Full Details &rarr;
        </span>
      </div>
    </div>
  );
}
