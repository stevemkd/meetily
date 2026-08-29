'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, BookOpen, Save, RotateCcw, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const GLOSSARY_STORAGE_KEY = 'meetily_custom_vocabulary_glossary';

const DEFAULT_TERMS = [
  'Meetily', 'Tauri', 'Ollama', 'Whisper', 'Next.js', 'React', 'Rust',
  'TypeScript', 'Docker', 'Kubernetes', 'PostgreSQL', 'GraphQL', 'FastAPI',
  'WebSockets', 'Tailwind', 'VectorDB', 'RAG'
];

export function getSavedGlossaryTerms(): string[] {
  if (typeof window === 'undefined') return DEFAULT_TERMS;
  try {
    const saved = localStorage.getItem(GLOSSARY_STORAGE_KEY);
    if (!saved) return DEFAULT_TERMS;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : DEFAULT_TERMS;
  } catch (e) {
    console.error('Failed to load vocabulary glossary', e);
    return DEFAULT_TERMS;
  }
}

export function saveGlossaryTermsToStorage(terms: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.getItem(GLOSSARY_STORAGE_KEY);
    localStorage.setItem(GLOSSARY_STORAGE_KEY, JSON.stringify(terms));
  } catch (e) {
    console.error('Failed to save vocabulary glossary', e);
  }
}

export function VocabularyGlossarySettings() {
  const [terms, setTerms] = useState<string[]>([]);
  const [newTerm, setNewTerm] = useState('');

  useEffect(() => {
    setTerms(getSavedGlossaryTerms());
  }, []);

  const handleAddTerm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTerm.trim();
    if (!trimmed) return;
    if (terms.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`"${trimmed}" is already in your glossary.`);
      return;
    }

    const updated = [...terms, trimmed];
    setTerms(updated);
    saveGlossaryTermsToStorage(updated);
    setNewTerm('');
    toast.success(`Added "${trimmed}" to custom vocabulary glossary.`);
  };

  const handleRemoveTerm = (termToRemove: string) => {
    const updated = terms.filter((t) => t !== termToRemove);
    setTerms(updated);
    saveGlossaryTermsToStorage(updated);
    toast.success(`Removed "${termToRemove}"`);
  };

  const handleResetDefaults = () => {
    setTerms(DEFAULT_TERMS);
    saveGlossaryTermsToStorage(DEFAULT_TERMS);
    toast.success('Reset vocabulary terms to default!');
  };

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" /> Custom Jargon & Technical Glossary
          </h3>
          <p className="text-sm text-gray-500">
            Add custom words, technical jargon, proper nouns, and acronyms to guide AI models for accurate spelling.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetDefaults}>
          <RotateCcw className="w-4 h-4 mr-1" /> Reset Defaults
        </Button>
      </div>

      <form onSubmit={handleAddTerm} className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            placeholder="Type a word, product name, or technical term (e.g. Microservices, Antigravity)..."
            className="w-full text-sm"
          />
        </div>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add Term
        </Button>
      </form>

      <div className="bg-gray-50 border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Active Glossary Words ({terms.length})
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Direct model bias hint
          </span>
        </div>

        {terms.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No terms added yet. Type a term above to add it.</p>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto pr-1">
            {terms.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-800 text-xs px-2.5 py-1 rounded-full shadow-sm hover:border-indigo-400 transition-colors"
              >
                <span className="font-medium">{t}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTerm(t)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
