'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Edit2, Check, Sparkles, Copy, FileText, Layers, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export interface SummaryTemplate {
  id: string;
  name: string;
  description: string;
  icon?: string;
  systemPrompt: string;
  userPromptTemplate: string;
  isBuiltIn?: boolean;
}

export const DEFAULT_TEMPLATES: SummaryTemplate[] = [
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'High-level overview focusing on strategic outcomes, key decisions, and major takeaways.',
    icon: 'briefcase',
    systemPrompt: 'You are an elite executive assistant. Summarize meeting transcripts with maximum clarity, conciseness, and actionable business insights.',
    userPromptTemplate: `Please summarize the following meeting:
Title: {meeting_title}
Date: {date}

Transcript:
{transcript}

Structure your response into:
1. Executive Overview (2-3 sentences)
2. Strategic Decisions Made
3. Critical Action Items & Owners
4. Open Risks & Next Steps`,
    isBuiltIn: true,
  },
  {
    id: 'action-items',
    name: 'Action Items & Commitments',
    description: 'Extracted task matrix with task names, assigned owners, and context.',
    icon: 'check-square',
    systemPrompt: 'You are a project manager expert. Extract all commitments, tasks, and follow-ups from the transcript.',
    userPromptTemplate: `Extract all action items from this meeting:
Title: {meeting_title}

Transcript:
{transcript}

For each action item, format as:
- [Task Name]: [Details/Context] (Owner: [Person or Unassigned])`,
    isBuiltIn: true,
  },
  {
    id: 'agile-standup',
    name: 'Agile / Standup Sync',
    description: 'Categorizes discussion into Accomplished, Today\'s Plan, and Blockers.',
    icon: 'zap',
    systemPrompt: 'You are a Scrum Master. Organize team updates into clear agile categories.',
    userPromptTemplate: `Organize this standup sync meeting transcript:
Transcript:
{transcript}

Format into:
- 🚀 Completed Items
- 🎯 Current Focus / Today's Plan
- ⚠️ Blockers & Dependencies`,
    isBuiltIn: true,
  },
  {
    id: 'technical-review',
    name: 'Technical Architecture & Code Review',
    description: 'Focuses on technical decisions, design choices, API specs, and bugs discussed.',
    icon: 'code',
    systemPrompt: 'You are a Principal Software Architect. Focus on technical specs, architecture decisions, trade-offs, and technical debt.',
    userPromptTemplate: `Analyze this technical meeting transcript:
Title: {meeting_title}

Transcript:
{transcript}

Structure:
1. Architectural Decisions & Consensus
2. Technical Specifications & API Changes
3. Trade-offs & Risks Identified
4. Engineering Action Items`,
    isBuiltIn: true,
  },
  {
    id: 'client-discovery',
    name: 'Client / Sales Discovery',
    description: 'Highlights customer pain points, requirements, feature requests, and deal notes.',
    icon: 'users',
    systemPrompt: 'You are a Senior Solutions Engineer and Client Partner.',
    userPromptTemplate: `Summarize this customer meeting:
Transcript:
{transcript}

Structure:
- Customer Goals & Vision
- Key Pain Points Identified
- Product Requirements / Feature Requests
- Follow-up Commitments & Deadlines`,
    isBuiltIn: true,
  },
];

const LOCAL_STORAGE_KEY = 'meetily_custom_prompt_templates';

export function getSavedTemplates(): SummaryTemplate[] {
  if (typeof window === 'undefined') return DEFAULT_TEMPLATES;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return DEFAULT_TEMPLATES;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TEMPLATES;
  } catch (e) {
    console.error('Failed to load custom prompt templates', e);
    return DEFAULT_TEMPLATES;
  }
}

export function saveTemplatesToStorage(templates: SummaryTemplate[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save custom prompt templates', e);
  }
}

interface PromptTemplateManagerProps {
  onSelectTemplate?: (template: SummaryTemplate) => void;
  selectedTemplateId?: string;
}

export function PromptTemplateManager({ onSelectTemplate, selectedTemplateId }: PromptTemplateManagerProps) {
  const [templates, setTemplates] = useState<SummaryTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<SummaryTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    setTemplates(getSavedTemplates());
  }, []);

  const handleSave = () => {
    if (!editingTemplate) return;
    if (!editingTemplate.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    let updated: SummaryTemplate[];
    if (isCreatingNew) {
      const newTmpl = {
        ...editingTemplate,
        id: 'custom-' + Date.now(),
        isBuiltIn: false,
      };
      updated = [...templates, newTmpl];
    } else {
      updated = templates.map((t) => (t.id === editingTemplate.id ? editingTemplate : t));
    }

    setTemplates(updated);
    saveTemplatesToStorage(updated);
    toast.success(`Template "${editingTemplate.name}" saved!`);
    setEditingTemplate(null);
    setIsCreatingNew(false);
  };

  const handleDelete = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    saveTemplatesToStorage(updated);
    toast.success('Template deleted');
    if (editingTemplate?.id === id) {
      setEditingTemplate(null);
    }
  };

  const handleResetDefaults = () => {
    setTemplates(DEFAULT_TEMPLATES);
    saveTemplatesToStorage(DEFAULT_TEMPLATES);
    toast.success('Reset templates to default!');
  };

  const startCreate = () => {
    setIsCreatingNew(true);
    setEditingTemplate({
      id: '',
      name: 'Custom Template',
      description: 'My custom meeting summary prompt',
      systemPrompt: 'You are an expert assistant.',
      userPromptTemplate: `Summarize the meeting transcript below:

{transcript}`,
    });
  };

  const insertVariable = (varName: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      userPromptTemplate: editingTemplate.userPromptTemplate + `\n${varName}`,
    });
  };

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" /> Custom Prompt & Summary Templates
          </h3>
          <p className="text-sm text-gray-500">
            Create, edit, and select custom summary prompt templates with full parameter control.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetDefaults}>
            <RotateCcw className="w-4 h-4 mr-1" /> Reset Defaults
          </Button>
          <Button size="sm" onClick={startCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-1" /> New Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Template List */}
        <div className="md:col-span-1 border rounded-lg p-3 bg-gray-50 space-y-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Available Templates</div>
          <ScrollArea className="h-[380px] pr-2">
            <div className="space-y-2">
              {templates.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id || editingTemplate?.id === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setEditingTemplate(tmpl);
                      setIsCreatingNew(false);
                      if (onSelectTemplate) onSelectTemplate(tmpl);
                    }}
                    className={`p-3 rounded-md border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        {tmpl.name}
                      </span>
                      {tmpl.isBuiltIn ? (
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Built-in</span>
                      ) : (
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Custom</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{tmpl.description}</p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Template Editor */}
        <div className="md:col-span-2 border rounded-lg p-4 bg-white space-y-4">
          {editingTemplate ? (
            <>
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-semibold text-gray-800 text-base">
                  {isCreatingNew ? 'Create New Template' : `Editing "${editingTemplate.name}"`}
                </h4>
                <div className="flex items-center gap-2">
                  {!editingTemplate.isBuiltIn && !isCreatingNew && (
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(editingTemplate.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  )}
                  <Button size="sm" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Check className="w-4 h-4 mr-1" /> Save Template
                  </Button>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <Label className="text-xs font-medium text-gray-700">Template Name</Label>
                  <Input
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    placeholder="e.g. Weekly Executive Briefing"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-700">Description</Label>
                  <Input
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                    placeholder="Short description of this template"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-700">System Prompt</Label>
                  <Input
                    value={editingTemplate.systemPrompt}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, systemPrompt: e.target.value })}
                    placeholder="e.g. You are an expert AI meeting assistant."
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs font-medium text-gray-700">User Prompt Template</Label>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-gray-500">Insert tag:</span>
                      {['{transcript}', '{meeting_title}', '{date}'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => insertVariable(tag)}
                          className="text-[10px] bg-gray-100 hover:bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-gray-200 font-mono"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={7}
                    value={editingTemplate.userPromptTemplate}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, userPromptTemplate: e.target.value })}
                    className="w-full p-2.5 text-xs font-mono border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="h-[380px] flex flex-col items-center justify-center text-center text-gray-400">
              <Layers className="w-12 h-12 mb-2 stroke-1" />
              <p className="text-sm font-medium">Select a template on the left to edit or create a new custom template.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
