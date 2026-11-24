import React, { useState } from 'react';
import { Check, Copy, Heart, RotateCcw, Sparkles, Maximize2 } from 'lucide-react';
import { PoseEntry, ViewMode } from '../types';
import { CATEGORY_LABELS_RU } from '../utils/i18nRu';

interface PoseCardProps {
  pose: PoseEntry;
  isSelected: boolean;
  viewMode: ViewMode;
  originalPrompt: string;
  onSelect: (id: number) => void;
  onUpdatePrompt: (id: number, nextPrompt: string) => void;
  onResetPrompt: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onPreviewImage: (pose: PoseEntry) => void;
}

export const PoseCard: React.FC<PoseCardProps> = ({
  pose,
  isSelected,
  viewMode,
  originalPrompt,
  onSelect,
  onUpdatePrompt,
  onResetPrompt,
  onToggleFavorite,
  onPreviewImage,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const paddedId = String(pose.id).padStart(2, '0');
  const isEdited = pose.promptStatus === 'edited';
  const isDifferentFromDefault = pose.prompt !== originalPrompt;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pose.prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const el = document.createElement('textarea');
      el.value = pose.prompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <article
      id={`pose-card-${pose.id}`}
      className={`group rounded-xl bg-white transition-all duration-150 ${
        isSelected
          ? 'border border-[#111110] ring-1 ring-[#C5B393]'
          : 'border border-[#E6DFD3] hover:border-[#C5B393]'
      } p-4 sm:p-5`}
    >
      {/* Верхний блок: слева визуальный референс, справа номер, название и описание на русском */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* СЛЕВА: Визуальный референс позы */}
        <div
          className={`relative shrink-0 overflow-hidden rounded-lg border border-[#E6DFD3] bg-[#F7F3EB] ${
            viewMode === 'list'
              ? 'w-full sm:w-36 aspect-[3/4]'
              : 'w-full sm:w-32 aspect-[3/4]'
          }`}
        >
          {!imgError ? (
            <img
              src={pose.referenceImage}
              alt={`Поза № ${paddedId}: ${pose.titleRu}`}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
              <span className="font-display text-2xl font-semibold text-[#111110] tabular-nums">
                № {paddedId}
              </span>
              <span className="mt-1 text-xs text-[#4A4742]">{pose.titleRu}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => onPreviewImage(pose)}
            aria-label={`Увеличить референс для позы № ${paddedId}`}
            title="Увеличить схему позы"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-[#111110] opacity-90 shadow-xs transition-opacity hover:bg-white focus-visible:outline-2 focus-visible:outline-[#111110] sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* СПРАВА: Номер позы, название и описание на русском */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#767067]">
                <span className="font-mono-tabular font-medium text-[#111110]">
                  № {paddedId}
                </span>
                <span aria-hidden="true">·</span>
                <span>{CATEGORY_LABELS_RU[pose.category]}</span>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    isEdited ? 'font-medium text-[#7A5C38]' : 'text-[#767067]'
                  }
                >
                  {isEdited ? 'Отредактировано' : 'Новый черновик'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onToggleFavorite(pose.id)}
                aria-pressed={pose.favorite}
                aria-label={
                  pose.favorite
                    ? `Убрать позу № ${paddedId} из избранного`
                    : `Добавить позу № ${paddedId} в избранное`
                }
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  pose.favorite
                    ? 'border-[#C5B393] bg-[#F7F1E6] text-[#8C5B32]'
                    : 'border-[#E6DFD3] bg-white text-[#767067] hover:border-[#C5B393] hover:text-[#111110]'
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${pose.favorite ? 'fill-current' : ''}`}
                />
              </button>
            </div>

            <h3 className="mt-1.5 font-display text-xl font-semibold leading-snug text-[#111110]">
              {pose.titleRu}
            </h3>

            <p className="mt-2 text-[13px] leading-relaxed text-[#4A4742]">
              {pose.descriptionRu}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(pose.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-[#111110] text-[#FAF8F4]'
                  : 'border border-[#D8CFC0] bg-[#FAF8F4] text-[#111110] hover:border-[#111110] hover:bg-[#F3EFE7]'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isSelected ? 'Выбрана в студии' : 'Выбрать в студию'}
            </button>
          </div>
        </div>
      </div>

      {/* СНИЗУ: Редактируемый промпт на английском + кнопка копирования */}
      <div className="mt-4 border-t border-[#EFEAE0] pt-3.5">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label
            htmlFor={`pose-prompt-${pose.id}`}
            className="text-xs font-medium text-[#4A4742]"
          >
            Промпт позы (на английском)
          </label>
          <div className="flex items-center gap-2">
            {isDifferentFromDefault && (
              <button
                type="button"
                onClick={() => onResetPrompt(pose.id)}
                className="inline-flex items-center gap-1 text-xs text-[#767067] hover:text-[#111110] whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3 w-3" />
                Сбросить черновик
              </button>
            )}
          </div>
        </div>

        <textarea
          id={`pose-prompt-${pose.id}`}
          rows={viewMode === 'list' ? 2 : 3}
          value={pose.prompt}
          onChange={(e) => onUpdatePrompt(pose.id, e.target.value)}
          placeholder="Введите текст промпта на английском..."
          className="w-full resize-y rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-3 py-2 text-[13px] leading-relaxed text-[#111110] placeholder:text-[#9A9389] focus:border-[#111110] focus:bg-white focus:outline-none"
        />

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#767067] tabular-nums">
            {pose.prompt.length} симв. · Автосохранение локально
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              copied
                ? 'bg-[#2C4A34] text-white'
                : 'bg-[#111110] text-[#FAF8F4] hover:bg-[#2A2825]'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Скопировано
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Копировать промпт
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
