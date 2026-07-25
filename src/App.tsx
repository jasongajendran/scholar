import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { Search, Bookmark, LayoutGrid, List, Layers, Shuffle, Sparkles, Filter, X, BookOpen, GraduationCap } from 'lucide-react';
import { wordsData } from './data';
import { WordRow } from './components/WordRow';
import { WordCard } from './components/WordCard';
import { WordDetailModal } from './components/WordDetailModal';
import { FlashcardView } from './components/FlashcardView';
import { FilterSheet } from './components/FilterSheet';
import { BottomNav } from './components/BottomNav';
import { LexiconWord } from './types';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const POS_TYPES = ["all", "noun", "verb", "adj.", "phrase"];
const CATEGORY_TYPES = ["all", "Peer Review", "Manuscript Editing", "Life Sciences", "Editorial Meetings"];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('all');
  const [activePos, setActivePos] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  // View & Nav State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentTab, setCurrentTab] = useState<'feed' | 'study'>('feed');
  const [selectedWord, setSelectedWord] = useState<LexiconWord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('scholar-lexicon-bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarkedIds(JSON.parse(savedBookmarks));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('scholar-lexicon-bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  const toggleBookmark = (id: number) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  };

  const handleSelectRandomWord = () => {
    if (wordsData.length === 0) return;
    const randomIndex = Math.floor(Math.random() * wordsData.length);
    setSelectedWord(wordsData[randomIndex]);
    setIsDetailOpen(true);
  };

  const handleWordSearchOrSelect = (term: string) => {
    if (!term) return;
    const cleanTerm = term.trim();
    const exactMatch = wordsData.find(w => w.word.toLowerCase() === cleanTerm.toLowerCase());
    if (exactMatch) {
      setSelectedWord(exactMatch);
      setIsDetailOpen(true);
    } else {
      // Create a virtual LexiconWord for synonyms/antonyms or terms not in the main lexicon list
      const virtualWord: LexiconWord = {
        id: 999000 + Math.floor(Math.random() * 1000),
        word: cleanTerm,
        pos: 'Related Term',
        pronunciation: `/${cleanTerm.toLowerCase().replace(/[^a-z0-9]/g, '')}/`,
        definition: `An academic and scientific term commonly encountered as a synonym, antonym, or contextual counterpart in research literature.`,
        etymology: `Derived from classical scholarly terminology used in peer-reviewed manuscripts.`,
        manuscriptExample: `Authors highlighted how ${cleanTerm.toLowerCase()} serves as an essential comparative benchmark in experimental design.`,
        conferenceExample: `Session delegates discussed the relevance of ${cleanTerm.toLowerCase()} during methodological deliberations.`,
        tags: ["Related Term", "Academic Lexicon"],
        synonyms: [],
        antonyms: []
      };
      setSelectedWord(virtualWord);
      setIsDetailOpen(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute letters that exist in data
  const addressedLetters = Array.from(new Set(wordsData.map(w => w.word.charAt(0).toUpperCase()))).sort();

  const filteredWords = wordsData.filter((w) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
                          w.word.toLowerCase().includes(q) || 
                          w.definition.toLowerCase().includes(q) ||
                          w.manuscriptExample.toLowerCase().includes(q) ||
                          w.conferenceExample.toLowerCase().includes(q) ||
                          (w.tags && w.tags.some(t => t.toLowerCase().includes(q))) ||
                          (w.synonyms && w.synonyms.some(s => s.toLowerCase().includes(q))) ||
                          (w.antonyms && w.antonyms.some(a => a.toLowerCase().includes(q)));

    const matchesLetter = activeLetter === 'all' || w.word.toUpperCase().startsWith(activeLetter);
    const matchesPos = activePos === 'all' || w.pos.toLowerCase() === activePos.toLowerCase();
    const matchesCategory = activeCategory === 'all' || (w.tags && w.tags.includes(activeCategory));
    const matchesBookmark = !showOnlyBookmarks || bookmarkedIds.includes(w.id);
    
    return matchesSearch && matchesLetter && matchesPos && matchesCategory && matchesBookmark;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-50 flex flex-col lg:flex-row overflow-x-hidden selection:bg-emerald-400 selection:text-black pb-24 lg:pb-0">
      
      {/* Reading Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-400 origin-left z-50 shadow-[0_0_10px_#34d399]" 
        style={{ scaleX }} 
      />

      {/* Background Subtle Letter Accent */}
      <div className="fixed right-[-8vw] top-[-5vh] text-[38vw] font-serif italic text-zinc-900/15 select-none pointer-events-none -z-10 transition-all duration-700">
        {activeLetter !== 'all' ? activeLetter : 'S'}
      </div>

      {/* Left Sidebar (Desktop / Tablet Header) */}
      <motion.aside 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="lg:w-[36%] xl:w-[32%] lg:h-screen lg:sticky lg:top-0 border-b lg:border-b-0 lg:border-r border-zinc-800/60 bg-[#0a0a0c]/90 backdrop-blur-xl z-10 flex flex-col p-6 md:p-10 lg:p-12 overflow-y-auto no-scrollbar"
      >
        <div className="flex-grow">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-400 flex items-center justify-center text-black font-serif italic font-bold shadow-lg shadow-emerald-400/20">
                S
              </div>
              <div>
                <span className="text-xs font-mono tracking-widest text-zinc-200 uppercase block font-semibold">Scholar Lexicon</span>
                <span className="text-[10px] font-mono text-emerald-400 block font-medium">Life Sciences & Publication Guide</span>
              </div>
            </div>

            <button
              onClick={handleSelectRandomWord}
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-emerald-400 active:scale-95 transition-all text-xs font-mono flex items-center gap-1.5"
              title="Surprise Word"
            >
              <Shuffle size={14} />
              <span className="hidden sm:inline">Random</span>
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-300 bg-sky-950/60 px-3 py-1 rounded-full border border-sky-800/40 font-medium">
              <GraduationCap size={13} /> Research & Peer Review Edition
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.08] mb-6 tracking-tight font-medium">
            Scholar <br/> <span className="italic text-emerald-400">Lexicon.</span>
          </h1>
          
          <p className="text-zinc-400 text-sm md:text-base font-sans font-light leading-relaxed mb-8 max-w-sm">
            Curated scientific vocabulary and expression guide engineered for Life Science researchers, peer reviewers, and journal manuscript editors.
          </p>

          {/* Search Bar */}
          <div className="relative group mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search terms, concepts, or context (Cmd+K)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 text-zinc-100 rounded-2xl py-3.5 pl-11 pr-10 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all placeholder:text-zinc-600 font-sans text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Quick Category Filtering Pills */}
          <div className="mb-6">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-2.5">
              Domain Categories
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_TYPES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? 'all' : cat)}
                  className={`text-xs font-mono px-3 py-1 rounded-full border transition-all ${
                    activeCategory === cat
                      ? 'bg-sky-400 text-black border-sky-400 font-bold shadow-md shadow-sky-400/20'
                      : 'bg-sky-950/40 text-sky-300 border-sky-800/40 hover:bg-sky-900/60'
                  }`}
                >
                  {cat === 'all' ? 'All Domains' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Bookmarks Toggle */}
          <div className="mb-8">
            <button
              onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-xs font-mono ${
                showOnlyBookmarks
                  ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                  : 'bg-zinc-900/50 border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bookmark size={15} className={showOnlyBookmarks ? 'fill-amber-400 text-amber-400' : ''} />
                <span>Show Bookmarked Terms</span>
              </div>
              <span className="bg-zinc-800 px-2 py-0.5 rounded-full text-[10px]">
                {bookmarkedIds.length}
              </span>
            </button>
          </div>

          {/* Desktop POS Filter & Mode Toggles */}
          <div className="hidden lg:block space-y-6 pt-6 border-t border-zinc-800/60">
            <div>
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-3">
                Part of Speech
              </span>
              <div className="flex flex-wrap gap-2">
                {POS_TYPES.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setActivePos(pos)}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all border ${
                      activePos === pos
                        ? 'bg-purple-400 text-black border-purple-400 font-bold'
                        : 'bg-purple-950/30 text-purple-300 border-purple-800/30 hover:border-purple-700/50'
                    }`}
                  >
                    {pos.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop View Mode & Tabs */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setCurrentTab('feed')}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all ${
                  currentTab === 'feed'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                    : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:text-white'
                }`}
              >
                <BookOpen size={15} />
                <span>Lexicon Feed</span>
              </button>

              <button
                onClick={() => {
                  setCurrentTab('study');
                  setShowOnlyBookmarks(false);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all ${
                  currentTab === 'study'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                    : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:text-white'
                }`}
              >
                <Layers size={15} />
                <span>Flashcard Deck</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>{wordsData.length} Published Terms</span>
          <span className="text-emerald-400/80 font-medium">Life Sciences Ed.</span>
        </div>
      </motion.aside>

      {/* Main Content Feed Area */}
      <main className="flex-1 min-h-screen p-4 md:p-8 lg:p-12 overflow-y-auto">
        
        {/* Top Control Bar for Mobile / Desktop */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          
          {/* Alphabet Bar */}
          <div className="w-full flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveLetter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-serif italic transition-all border shrink-0 ${
                  activeLetter === 'all'
                    ? 'bg-emerald-400 text-black border-emerald-400 font-bold'
                    : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                ALL
              </button>
              {ALPHABET.map((letter) => {
                const isAddressed = addressedLetters.includes(letter);
                return (
                  <button
                    key={letter}
                    disabled={!isAddressed}
                    onClick={() => isAddressed && setActiveLetter(letter)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-serif italic transition-all border flex items-center justify-center shrink-0 ${
                      activeLetter === letter
                        ? 'bg-emerald-400 text-black border-emerald-400 font-bold'
                        : isAddressed
                        ? 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-emerald-400/40'
                        : 'bg-zinc-950 text-zinc-700 border-zinc-900 opacity-30 cursor-not-allowed'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Layout & Filter Controls */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {currentTab === 'feed' && (
              <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
                    viewMode === 'list'
                      ? 'bg-zinc-800 text-emerald-400 font-medium'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="List View"
                >
                  <List size={16} />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-zinc-800 text-emerald-400 font-medium'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                  <span className="hidden sm:inline">Grid</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsFilterSheetOpen(true)}
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white active:scale-95 transition-all text-xs font-mono flex items-center gap-1.5 lg:hidden"
            >
              <Filter size={15} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Active Filters Bar */}
        {(searchQuery || activeLetter !== 'all' || activePos !== 'all' || activeCategory !== 'all' || showOnlyBookmarks) && (
          <div className="max-w-6xl mx-auto mb-6 flex flex-wrap items-center gap-2 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80 text-xs font-mono">
            <span className="text-zinc-400">Active Filters:</span>

            {searchQuery && (
              <span className="bg-zinc-800 text-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-white"><X size={12}/></button>
              </span>
            )}

            {activeCategory !== 'all' && (
              <span className="bg-sky-950 text-sky-300 px-2.5 py-1 rounded-full border border-sky-800/40 flex items-center gap-1">
                Domain: {activeCategory}
                <button onClick={() => setActiveCategory('all')} className="hover:text-white"><X size={12}/></button>
              </span>
            )}

            {activeLetter !== 'all' && (
              <span className="bg-zinc-800 text-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                Letter: {activeLetter}
                <button onClick={() => setActiveLetter('all')} className="hover:text-white"><X size={12}/></button>
              </span>
            )}

            {activePos !== 'all' && (
              <span className="bg-purple-950 text-purple-300 px-2.5 py-1 rounded-full border border-purple-800/40 flex items-center gap-1">
                POS: {activePos.toUpperCase()}
                <button onClick={() => setActivePos('all')} className="hover:text-white"><X size={12}/></button>
              </span>
            )}

            {showOnlyBookmarks && (
              <span className="bg-amber-950 text-amber-300 px-2.5 py-1 rounded-full border border-amber-800/40 flex items-center gap-1">
                Bookmarked Only
                <button onClick={() => setShowOnlyBookmarks(false)} className="hover:text-white"><X size={12}/></button>
              </span>
            )}

            <button
              onClick={() => {
                setSearchQuery('');
                setActiveLetter('all');
                setActivePos('all');
                setActiveCategory('all');
                setShowOnlyBookmarks(false);
              }}
              className="text-zinc-500 hover:text-zinc-300 underline ml-auto text-[11px]"
            >
              Reset All
            </button>
          </div>
        )}

        {/* FEED MODE vs STUDY FLASHCARD MODE */}
        <div className="max-w-6xl mx-auto">
          {currentTab === 'study' ? (
            <FlashcardView
              words={filteredWords}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={toggleBookmark}
            />
          ) : (
            <>
              {filteredWords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-600">
                    <Search size={28} />
                  </div>
                  <h3 className="text-2xl font-serif italic text-zinc-300 mb-2">No Matching Terms Found</h3>
                  <p className="text-zinc-500 font-sans text-sm max-w-sm mb-6">
                    Try clearing your search query or switching domain category filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveLetter('all');
                      setActivePos('all');
                      setActiveCategory('all');
                      setShowOnlyBookmarks(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-400 text-black font-mono text-xs uppercase tracking-wider font-bold shadow-lg"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : viewMode === 'list' ? (
                <div className="flex flex-col">
                  {filteredWords.map((word, index) => (
                    <WordRow
                      key={word.id}
                      word={word}
                      index={index + 1}
                      isBookmarked={bookmarkedIds.includes(word.id)}
                      onToggleBookmark={() => toggleBookmark(word.id)}
                      onSelectWord={(w) => {
                        setSelectedWord(w);
                        setIsDetailOpen(true);
                      }}
                      onWordSearch={handleWordSearchOrSelect}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredWords.map((word, index) => (
                    <WordCard
                      key={word.id}
                      word={word}
                      index={index + 1}
                      isBookmarked={bookmarkedIds.includes(word.id)}
                      onToggleBookmark={() => toggleBookmark(word.id)}
                      onSelectWord={(w) => {
                        setSelectedWord(w);
                        setIsDetailOpen(true);
                      }}
                      onWordSearch={handleWordSearchOrSelect}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <WordDetailModal
        word={selectedWord}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        isBookmarked={selectedWord ? bookmarkedIds.includes(selectedWord.id) : false}
        onToggleBookmark={() => selectedWord && toggleBookmark(selectedWord.id)}
        onWordSearch={handleWordSearchOrSelect}
      />

      {/* Filter Sheet Drawer */}
      <FilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeLetter={activeLetter}
        setActiveLetter={setActiveLetter}
        activePos={activePos}
        setActivePos={setActivePos}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        alphabet={ALPHABET}
        posTypes={POS_TYPES}
        categoryTypes={CATEGORY_TYPES}
        addressedLetters={addressedLetters}
        totalTerms={filteredWords.length}
        bookmarkedCount={bookmarkedIds.length}
        showOnlyBookmarks={showOnlyBookmarks}
        setShowOnlyBookmarks={setShowOnlyBookmarks}
      />

      {/* Bottom Navigation for Mobile / Tablet */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
        showOnlyBookmarks={showOnlyBookmarks}
        setShowOnlyBookmarks={setShowOnlyBookmarks}
        bookmarkedCount={bookmarkedIds.length}
        onSelectRandomWord={handleSelectRandomWord}
      />
    </div>
  );
}
