'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, UserCheck, Palette, Edit, Check, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export interface SpeakerProfile {
  id: string;
  name: string;
  color: string;
  role?: string;
}

const PRESET_COLORS = [
  '#4F46E5', // Indigo
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#2563EB', // Blue
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#0891B2', // Cyan
];

interface SpeakerManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  speakers: SpeakerProfile[];
  onUpdateSpeakers: (updated: SpeakerProfile[]) => void;
  onRenameSpeakerTurn?: (oldName: string, newName: string) => void;
}

export function SpeakerManagerModal({
  isOpen,
  onClose,
  speakers,
  onUpdateSpeakers,
  onRenameSpeakerTurn,
}: SpeakerManagerModalProps) {
  const [localSpeakers, setLocalSpeakers] = useState<SpeakerProfile[]>(speakers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');
  const [editingRole, setEditingRole] = useState('');

  React.useEffect(() => {
    setLocalSpeakers(speakers);
  }, [speakers]);

  const handleStartEdit = (spk: SpeakerProfile) => {
    setEditingId(spk.id);
    setEditingName(spk.name);
    setEditingColor(spk.color || PRESET_COLORS[0]);
    setEditingRole(spk.role || '');
  };

  const handleSaveEdit = () => {
    if (!editingId || !editingName.trim()) return;
    const oldSpeaker = localSpeakers.find((s) => s.id === editingId);
    const updated = localSpeakers.map((s) => {
      if (s.id === editingId) {
        return { ...s, name: editingName.trim(), color: editingColor, role: editingRole.trim() };
      }
      return s;
    });

    setLocalSpeakers(updated);
    onUpdateSpeakers(updated);

    if (oldSpeaker && oldSpeaker.name !== editingName.trim() && onRenameSpeakerTurn) {
      onRenameSpeakerTurn(oldSpeaker.name, editingName.trim());
    }

    toast.success(`Updated speaker "${editingName.trim()}"`);
    setEditingId(null);
  };

  const handleAddSpeaker = () => {
    const nextNum = localSpeakers.length + 1;
    const newSpk: SpeakerProfile = {
      id: 'spk-' + Date.now(),
      name: `Speaker ${nextNum}`,
      color: PRESET_COLORS[(nextNum - 1) % PRESET_COLORS.length],
      role: 'Participant',
    };
    const updated = [...localSpeakers, newSpk];
    setLocalSpeakers(updated);
    onUpdateSpeakers(updated);
    toast.success(`Added ${newSpk.name}`);
  };

  const handleDeleteSpeaker = (id: string) => {
    const updated = localSpeakers.filter((s) => s.id !== id);
    setLocalSpeakers(updated);
    onUpdateSpeakers(updated);
    toast.success('Speaker removed');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg bg-white rounded-lg p-6">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Speaker Diarization & Labeling
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-1">
            Manage speaker names, roles, and avatar colors across your transcript.
          </p>
        </DialogHeader>

        <div className="space-y-3 py-3 max-h-[350px] overflow-y-auto pr-1">
          {localSpeakers.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-xs">
              No speakers added yet. Click &quot;Add Speaker&quot; to assign speaker labels.
            </div>
          ) : (
            localSpeakers.map((spk) => {
              const isEditing = editingId === spk.id;
              return (
                <div
                  key={spk.id}
                  className="p-3 border rounded-lg bg-gray-50 flex items-center justify-between gap-3"
                >
                  {isEditing ? (
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Speaker Name"
                          className="text-xs font-medium"
                        />
                        <Input
                          value={editingRole}
                          onChange={(e) => setEditingRole(e.target.value)}
                          placeholder="Role (e.g. Host, Engineer)"
                          className="text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-gray-500 font-medium">Badge Color:</span>
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setEditingColor(c)}
                            className={`w-5 h-5 rounded-full border-2 transition-transform ${
                              editingColor === c ? 'scale-110 border-gray-900' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit} className="bg-indigo-600 text-white">
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm"
                          style={{ backgroundColor: spk.color || '#4F46E5' }}
                        >
                          {spk.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-800">{spk.name}</div>
                          {spk.role && <div className="text-xs text-gray-400">{spk.role}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleStartEdit(spk)}>
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSpeaker(spk.id)} className="text-red-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="flex items-center justify-between border-t pt-3">
          <Button variant="outline" size="sm" onClick={handleAddSpeaker}>
            <Plus className="w-4 h-4 mr-1" /> Add Speaker
          </Button>
          <Button size="sm" onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
