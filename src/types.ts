export interface LexiconWord {
  id: number;
  word: string;
  pos: string; // e.g. "noun", "verb", "adj.", "adv.", "phrase"
  pronunciation?: string;
  definition: string;
  etymology?: string;
  manuscriptExample: string;
  conferenceExample: string;
  tags: string[]; // e.g. ["Peer Review", "Life Sciences", "Manuscript Editing", "Editorial Meetings"]
  synonyms?: string[];
  antonyms?: string[];
}

