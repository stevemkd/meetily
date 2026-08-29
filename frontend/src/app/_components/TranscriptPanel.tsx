import { useState, useMemo } from 'react';
import { VirtualizedTranscriptView } from '@/components/VirtualizedTranscriptView';
import { PermissionWarning } from '@/components/PermissionWarning';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Copy, GlobeIcon, Download, Users, Sparkles } from 'lucide-react';
import { useTranscripts } from '@/contexts/TranscriptContext';
import { useConfig } from '@/contexts/ConfigContext';
import { useRecordingState } from '@/contexts/RecordingStateContext';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';
import { ModalType } from '@/hooks/useModalState';
import { useIsLinux } from '@/hooks/usePlatform';
import { SpeakerManagerModal, SpeakerProfile } from '@/components/SpeakerManagerModal';
import { ExportControlsModal } from '@/components/ExportControlsModal';

interface TranscriptPanelProps {
  isProcessingStop: boolean;
  isStopping: boolean;
  showModal: (name: ModalType, message?: string) => void;
}

export function TranscriptPanel({
  isProcessingStop,
  isStopping,
  showModal
}: TranscriptPanelProps) {
  // Contexts
  const { transcripts, transcriptContainerRef, copyTranscript, meetingTitle } = useTranscripts();
  const { transcriptModelConfig } = useConfig();
  const { isRecording, isPaused } = useRecordingState();
  const { checkPermissions, isChecking, hasSystemAudio, hasMicrophone } = usePermissionCheck();
  const isLinux = useIsLinux();

  // Modals for OpenControl features
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [speakers, setSpeakers] = useState<SpeakerProfile[]>([
    { id: 'spk-1', name: 'Speaker 1', color: '#4F46E5', role: 'Participant' },
    { id: 'spk-2', name: 'Speaker 2', color: '#059669', role: 'Participant' }
  ]);

  // Convert transcripts to segments for virtualized view
  const segments = useMemo(() =>
    transcripts.map(t => ({
      id: t.id,
      timestamp: t.audio_start_time ?? 0,
      endTime: t.audio_end_time,
      text: t.text,
      confidence: t.confidence,
    })),
    [transcripts]
  );

  const fullTranscriptText = useMemo(() => {
    return transcripts.map(t => t.text).join('\n');
  }, [transcripts]);

  return (
    <div ref={transcriptContainerRef} className="w-full border-r border-gray-200 bg-white flex flex-col overflow-y-auto">
      {/* Speaker Diarization Modal */}
      <SpeakerManagerModal
        isOpen={isSpeakerModalOpen}
        onClose={() => setIsSpeakerModalOpen(false)}
        speakers={speakers}
        onUpdateSpeakers={setSpeakers}
      />

      {/* Multi-Format Export Modal */}
      <ExportControlsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        meetingTitle={meetingTitle || 'Meeting Minutes'}
        transcriptText={fullTranscriptText}
        summaryText=""
        transcriptItems={transcripts.map(t => ({
          speaker: 'Speaker 1',
          text: t.text,
          timestamp: t.audio_start_time ? `${Math.floor(t.audio_start_time / 60)}:${Math.floor(t.audio_start_time % 60).toString().padStart(2, '0')}` : undefined
        }))}
      />

      {/* Title area - Sticky header */}
      <div className="sticky top-0 z-10 bg-white p-4 border-gray-200 shadow-sm">
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-center items-center space-x-2">
              <ButtonGroup>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSpeakerModalOpen(true)}
                  title="Speakers & Diarization"
                >
                  <Users className="w-4 h-4 mr-1 text-indigo-600" />
                  <span className="hidden md:inline">Speakers</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExportModalOpen(true)}
                  title="Export Minutes & Transcripts"
                >
                  <Download className="w-4 h-4 mr-1 text-emerald-600" />
                  <span className="hidden md:inline">Export</span>
                </Button>

                {transcripts?.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyTranscript}
                    title="Copy Transcript"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    <span className="hidden md:inline">Copy</span>
                  </Button>
                )}

                {transcriptModelConfig.provider === "localWhisper" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showModal('languageSettings')}
                    title="Language"
                  >
                    <GlobeIcon className="w-4 h-4 mr-1" />
                    <span className="hidden md:inline">Language</span>
                  </Button>
                )}
              </ButtonGroup>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Warning - Not needed on Linux */}
      {!isRecording && !isChecking && !isLinux && (
        <div className="flex justify-center px-4 pt-4">
          <PermissionWarning
            hasMicrophone={hasMicrophone}
            hasSystemAudio={hasSystemAudio}
            onRecheck={checkPermissions}
            isRechecking={isChecking}
          />
        </div>
      )}

      {/* Transcript content */}
      <div className="pb-20">
        <div className="flex justify-center">
          <div className="w-2/3 max-w-[750px]">
            <VirtualizedTranscriptView
              segments={segments}
              isRecording={isRecording}
              isPaused={isPaused}
              isProcessing={isProcessingStop}
              isStopping={isStopping}
              enableStreaming={isRecording}
              showConfidence={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
