import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Volume2, Copy, Check, Bookmark, FileText, Landmark } from 'lucide-react';
import { LexiconWord } from '../types';
import { speakWord } from '../utils/speech';

interface WordRowProps {
  key?: number;
  word: LexiconWord; 
  index: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onSelectWord: (word: LexiconWord) => void;
  onWordSearch?: (word: string) => void;
}

export function WordRow({ 
  word, 
  index,
  isBookmarked,
  onToggleBookmark,
  onSelectWord,
  onWordSearch
}: WordRowProps) {
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

  const highlightMatch = (text: string, match: string) => {
    if (!match || typeof match !== 'string' || typeof text !== 'string') return text;
    const safeMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${safeMatch})`, 'gi'));
    
    return (
      <>
        {parts.map((part, i) => {
          const isMatch = part.toLowerCase() === match.toLowerCase();
          return isMatch ? (
            <span key={i} className="rounded-sm px-0.5 -mx-0.5 font-medium text-emerald-400 bg-emerald-400/10">{part}</span>
          ) : (
            part
          );
        })}
      </>
    );
  };

  return (
    <div 
      onClick={() => {
        triggerHaptic();
        onSelectWord(word);
      }}
      className="group relative flex flex-col lg:flex-row gap-6 lg:gap-12 py-10 lg:py-16 border-t border-zinc-800/60 transition-colors duration-200 px-4 md:px-8 cursor-pointer hover:bg-zinc-900/40 active:bg-zinc-900/60"
    >
      {/* Index Number */}
      <div className="absolute top-4 left-4 md:top-6 md:left-8 text-xs font-mono text-zinc-600 tracking-widest flex items-center gap-2">
        <span>#{index.toString().padStart(2, '0')}</span>
        {isBookmarked && <Bookmark size={12} className="text-amber-400 fill-amber-400" />}
      </div>

      {/* Top Right Actions */}
      <div className="absolute top-4 right-4 md:top-6 md:right-8 flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={handleBookmark}
          className={`p-2 rounded-full bg-zinc-900/80 md:bg-transparent hover:bg-zinc-800 transition-colors ${isBookmarked ? 'text-amber-400' : 'text-zinc-400 hover:text-amber-400'}`}
          title="Toggle bookmark"
        >
          <Bookmark size={16} className={isBookmarked ? "fill-amber-400" : ""} />
        </button>
        <button 
          onClick={handleSpeak}
          className={`p-2 rounded-full bg-zinc-900/80 md:bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors ${
            isSpeaking ? 'text-emerald-400 animate-pulse' : ''
          }`}
          title="Pronounce word"
        >
          <Volume2 size={16} />
        </button>
        <button 
          onClick={handleCopy}
          className="p-2 rounded-full bg-zinc-900/80 md:bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
        </button>
      </div>

      {/* Left Column: Word, POS, Tags, Definition */}
      <div className="lg:w-5/12 flex flex-col justify-center">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif italic tracking-tight text-zinc-100">
            {word.word}
          </h2>
          {/* POS Badge */}
          <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-800/40 uppercase tracking-wider font-medium">
            {word.pos}
          </span>
        </div>

        {word.pronunciation && (
          <p className="text-xs font-mono text-emerald-400/80 mt-1">
            {word.pronunciation}
          </p>
        )}

        {/* Category Pills */}
        {word.tags && word.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {word.tags.map((tag, i) => (
              <span key={i} className="text-[10px] font-mono text-sky-300 bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-800/40">
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-zinc-300 font-sans text-sm md:text-base leading-relaxed tracking-wide mt-4">
          <span className="text-zinc-500 font-mono text-xs italic mr-2">def.</span>
          {word.definition}
        </p>

        {/* Interactive Synonyms & Antonyms */}
        {(word.synonyms?.length || word.antonyms?.length) ? (
          <div className="mt-4 flex flex-col gap-2">
            {word.synonyms && word.synonyms.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-widest font-semibold">Synonyms</span>
                <div className="flex flex-wrap gap-1.5">
                  {word.synonyms.map((syn, i) => (
                    <button 
                      key={i} 
                      onClick={(e) => handleSynAntClick(e, syn)}
                      className="text-xs font-mono text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-800/40 transition-colors"
                    >
                      {syn}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {word.antonyms && word.antonyms.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono text-rose-400/80 uppercase tracking-widest font-semibold">Antonyms</span>
                <div className="flex flex-wrap gap-1.5">
                  {word.antonyms.map((ant, i) => (
                    <button 
                      key={i} 
                      onClick={(e) => handleSynAntClick(e, ant)}
                      className="text-xs font-mono text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 px-2.5 py-0.5 rounded-full border border-rose-800/40 transition-colors"
                    >
                      {ant}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Right Column: Dual Context Cards */}
      <div className="lg:w-7/12 flex flex-col justify-center gap-4">
        {/* Manuscript Context */}
        <div className="relative p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 group-hover:border-sky-500/30 transition-colors duration-200">
          <div className="flex items-center gap-2 text-sky-300 font-mono text-xs uppercase tracking-wider mb-1 font-semibold flex-wrap">
            <FileText size={14} className="shrink-0" />
            <span>Manuscript Context</span>
          </div>
          <p className="text-sm md:text-base font-serif text-zinc-200 italic leading-relaxed">
            "{highlightMatch(word.manuscriptExample, word.word)}"
          </p>
        </div>
        
        {/* Conference & Meeting Context */}
        <div className="relative p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 group-hover:border-indigo-500/30 transition-colors duration-200">
          <div className="flex items-center gap-2 text-indigo-300 font-mono text-xs uppercase tracking-wider mb-1 font-semibold flex-wrap">
            <Landmark size={14} className="shrink-0" />
            <span>Conference & Meeting Context</span>
          </div>
          <p className="text-sm md:text-base font-serif text-zinc-200 italic leading-relaxed">
            "{highlightMatch(word.conferenceExample, word.word)}"
          </p>
        </div>
      </div>
    </div>
  );
}
