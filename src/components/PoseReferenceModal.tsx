import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PoseEntry } from '../types';
import { CATEGORY_LABELS_RU } from '../utils/i18nRu';

interface PoseReferenceModalProps {
  pose: PoseEntry | null;
  onClose: () => void;
  onSelectPose: (id: number) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const PoseReferenceModal: React.FC<PoseReferenceModalProps> = ({
  pose,
  onClose,
  onSelectPose,
  onNavigate,
}) => {
  useEffect(() => {
    if (!pose) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate('prev');
      if (e.key === 'ArrowRight') onNavigate('next');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pose, onClose, onNavigate]);

  if (!pose) return null;

  const paddedId = String(pose.id).padStart(2, '0');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Схема позы № ${paddedId}: ${pose.titleRu}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-[#E6DFD3] bg-[#FAF8F4] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E6DFD3] bg-white px-5 py-3.5">
          <div className="flex items-center gap-2 text-xs text-[#767067]">
            <span className="font-mono-tabular font-semibold text-[#111110]">
              № {paddedId}
            </span>
            <span aria-hidden="true">·</span>
            <span>{CATEGORY_LABELS_RU[pose.category]}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть просмотр схемы позы"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6DFD3] text-[#111110] hover:border-[#111110]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-[260px_1fr]">
          <div className="overflow-hidden rounded-lg border border-[#E6DFD3] bg-[#F7F3EB] aspect-[3/4]">
            <img
              src={pose.referenceImage}
              alt={`Поза № ${paddedId}: ${pose.titleRu}`}
              referrerPolicy="no-referrer"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold text-[#111110]">
                {pose.titleRu}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4A4742]">
                {pose.descriptionRu}
              </p>

              <div className="mt-4 rounded-lg border border-[#E6DFD3] bg-white p-3">
                <p className="text-[11px] font-medium text-[#767067]">
                  Промпт позы (
                  {pose.promptStatus === 'edited'
                    ? 'Отредактировано'
                    : 'Новый черновик'}
                  )
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#111110]">
                  {pose.prompt}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#E6DFD3] pt-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('prev')}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#D8CFC0] bg-white px-3 py-1.5 text-xs font-medium text-[#111110] hover:border-[#111110]"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('next')}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#D8CFC0] bg-white px-3 py-1.5 text-xs font-medium text-[#111110] hover:border-[#111110]"
                >
                  Далее
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectPose(pose.id);
                  onClose();
                }}
                className="rounded-lg bg-[#111110] px-4 py-2 text-xs font-semibold text-[#FAF8F4] hover:bg-[#2A2825]"
              >
                Выбрать позу № {paddedId}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
