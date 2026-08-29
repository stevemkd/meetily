'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Download, FileText, Code, FileJson, FileCode, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ExportControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingTitle?: string;
  transcriptText?: string;
  summaryText?: string;
  transcriptItems?: Array<{ speaker: string; text: string; timestamp?: string }>;
}

export function ExportControlsModal({
  isOpen,
  onClose,
  meetingTitle = 'Meeting Minutes',
  transcriptText = '',
  summaryText = '',
  transcriptItems = [],
}: ExportControlsModalProps) {
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeTranscript, setIncludeTranscript] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [exportFormat, setExportFormat] = useState<'markdown' | 'txt' | 'json' | 'srt' | 'html'>('markdown');

  const generateContent = () => {
    const dateStr = new Date().toLocaleString();

    if (exportFormat === 'json') {
      const data: any = {};
      if (includeMetadata) {
        data.metadata = { title: meetingTitle, exportedAt: dateStr };
      }
      if (includeSummary) data.summary = summaryText;
      if (includeTranscript) {
        data.transcript = transcriptItems.length > 0 ? transcriptItems : transcriptText;
      }
      return JSON.stringify(data, null, 2);
    }

    if (exportFormat === 'srt') {
      if (transcriptItems.length > 0) {
        return transcriptItems
          .map((item, idx) => {
            const time = item.timestamp || `00:00:${(idx * 5).toString().padStart(2, '0')},000`;
            return `${idx + 1}\n${time} --> ${time}\n[${item.speaker}]: ${item.text}\n`;
          })
          .join('\n');
      }
      return transcriptText;
    }

    if (exportFormat === 'html') {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${meetingTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1f2937; }
    h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; }
    .meta { font-size: 0.9em; color: #6b7280; margin-bottom: 20px; }
    .summary { background: #f9fafb; border-left: 4px solid #4f46e5; padding: 15px; border-radius: 4px; }
    .speaker { font-weight: bold; color: #4f46e5; }
    .turn { margin-bottom: 12px; }
  </style>
</head>
<body>
  <h1>${meetingTitle}</h1>
  ${includeMetadata ? `<div class="meta">Exported: ${dateStr}</div>` : ''}
  ${includeSummary && summaryText ? `<h2>Meeting Summary</h2><div class="summary">${summaryText.replace(/\n/g, '<br>')}</div>` : ''}
  ${
    includeTranscript
      ? `<h2>Transcript</h2>${
          transcriptItems.length > 0
            ? transcriptItems
                .map(
                  (t) =>
                    `<div class="turn">${includeTimestamps && t.timestamp ? `<span style="color:#9ca3af;font-size:0.85em;">[${t.timestamp}] </span>` : ''}<span class="speaker">${t.speaker}:</span> ${t.text}</div>`
                )
                .join('')
            : `<div>${transcriptText.replace(/\n/g, '<br>')}</div>`
        }`
      : ''
  }
</body>
</html>`;
    }

    // Markdown / TXT default
    let md = `# ${meetingTitle}\n`;
    if (includeMetadata) md += `*Date: ${dateStr}*\n\n`;
    if (includeSummary && summaryText) {
      md += `## Meeting Summary\n\n${summaryText}\n\n`;
    }
    if (includeTranscript) {
      md += `## Transcript\n\n`;
      if (transcriptItems.length > 0) {
        transcriptItems.forEach((t) => {
          const tsStr = includeTimestamps && t.timestamp ? `\`${t.timestamp}\` ` : '';
          md += `${tsStr}**${t.speaker}**: ${t.text}\n\n`;
        });
      } else {
        md += `${transcriptText}\n\n`;
      }
    }
    return md;
  };

  const handleCopy = () => {
    const text = generateContent();
    navigator.clipboard.writeText(text);
    toast.success('Copied formatted content to clipboard!');
  };

  const handleDownload = () => {
    const text = generateContent();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = meetingTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const ext = exportFormat === 'markdown' ? 'md' : exportFormat;
    a.download = `${safeTitle}_export.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${meetingTitle}_export.${ext}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-lg p-6">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" /> Export Meeting Minutes
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-1">
            Choose your format and custom options to export your transcripts and summaries.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Format selection */}
          <div>
            <Label className="text-xs font-semibold text-gray-700">Export Format</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[
                { id: 'markdown', label: 'Markdown', ext: '.md' },
                { id: 'txt', label: 'Text', ext: '.txt' },
                { id: 'json', label: 'JSON', ext: '.json' },
                { id: 'srt', label: 'Subtitle', ext: '.srt' },
                { id: 'html', label: 'HTML', ext: '.html' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setExportFormat(f.id as any)}
                  className={`p-2 border rounded-md text-center text-xs font-medium transition-all ${
                    exportFormat === f.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-bold">{f.label}</div>
                  <div className="text-[10px] text-gray-400">{f.ext}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Inclusion Toggles */}
          <div className="space-y-3 bg-gray-50 p-3 border rounded-lg">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Content Controls</div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-700">Include Meeting Summary</Label>
              <Switch checked={includeSummary} onCheckedChange={setIncludeSummary} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-700">Include Full Transcript</Label>
              <Switch checked={includeTranscript} onCheckedChange={setIncludeTranscript} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-700">Include Metadata & Dates</Label>
              <Switch checked={includeMetadata} onCheckedChange={setIncludeMetadata} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-700">Include Speaker Timestamps</Label>
              <Switch checked={includeTimestamps} onCheckedChange={setIncludeTimestamps} />
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between border-t pt-3">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-1" /> Copy to Clipboard
          </Button>
          <Button size="sm" onClick={handleDownload} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Download className="w-4 h-4 mr-1" /> Export File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
