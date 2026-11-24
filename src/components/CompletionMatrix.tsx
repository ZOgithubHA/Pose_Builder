import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PoseEntry } from '../types';

interface CompletionMatrixProps {
  poses: PoseEntry[];
  selectedPoseId: number;
  onJumpToPose: (id: number) => void;
}

export const CompletionMatrix: React.FC<CompletionMatrixProps> = ({
  poses,
  selectedPoseId,
  onJumpToPose,
}) => {
  const [expanded, setExpanded] = useState(false);

  const editedCount = poses.filter((p) => p.promptStatus === 'edited').length;
  const draftCount = poses.length - editedCount;
  const favoriteCount = poses.filter((p) => p.favorite).length;

  return (
    <section
      aria-label="Статус заполнения 81 позы"
      className="rounded-xl border border-[#E6DFD3] bg-white p-4 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#111110]">
            Статус библиотеки из 81 позы
          </h2>
          <p className="mt-0.5 text-xs text-[#4A4742] tabular-nums">
            <span className="font-semibold text-[#111110]">{poses.length} / 81</span>{' '}
            поз в базе <span aria-hidden="true">·</span>{' '}
            <span className="font-medium text-[#7A5C38]">
              {editedCount} отредактировано
            </span>{' '}
            <span aria-hidden="true">·</span>{' '}
            <span>{draftCount} новых черновиков</span>{' '}
            <span aria-hidden="true">·</span>{' '}
            <span>{favoriteCount} в избранном</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-[#D8CFC0] bg-[#FAF8F4] px-3 py-1.5 text-xs font-medium text-[#111110] hover:border-[#111110] whitespace-nowrap shrink-0 sm:self-auto"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Скрыть индекс поз
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              Показать все 81 номера
            </>
          )}
        </button>
      </div>

      {/* Индикатор прогресса */}
      <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-[#EFEAE0]">
        <div
          style={{ width: `${(editedCount / poses.length) * 100}%` }}
          className="bg-[#111110] transition-all duration-200"
          title={`Отредактировано поз: ${editedCount}`}
        />
        <div
          style={{ width: `${(draftCount / poses.length) * 100}%` }}
          className="bg-[#C5B393] transition-all duration-200"
          title={`Новых черновиков: ${draftCount}`}
        />
      </div>

      {expanded && (
        <div className="mt-4 border-t border-[#EFEAE0] pt-4">
          <div className="mb-2.5 flex flex-wrap items-center gap-4 text-[11px] text-[#4A4742]">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-xs bg-[#111110]" />
              Выбрана
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-xs bg-[#8C7355]" />
              Отредактирована
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-xs border border-[#D8CFC0] bg-[#FAF8F4]" />
              Новый черновик
            </span>
            <span className="text-[#767067]">
              Нажмите на номер, чтобы перейти к позе
            </span>
          </div>

          <div className="grid grid-cols-9 gap-1.5 sm:grid-cols-14 md:grid-cols-18">
            {poses.map((pose) => {
              const active = pose.id === selectedPoseId;
              const edited = pose.promptStatus === 'edited';
              return (
                <button
                  key={pose.id}
                  type="button"
                  onClick={() => onJumpToPose(pose.id)}
                  title={`№ ${pose.id}: ${pose.titleRu} (${
                    edited ? 'Отредактирована' : 'Новый черновик'
                  })`}
                  className={`h-8 rounded-md text-xs font-mono-tabular font-medium transition-colors ${
                    active
                      ? 'bg-[#111110] text-[#FAF8F4]'
                      : edited
                      ? 'bg-[#8C7355] text-white hover:bg-[#735D43]'
                      : 'border border-[#E6DFD3] bg-[#FAF8F4] text-[#4A4742] hover:border-[#111110] hover:text-[#111110]'
                  }`}
                >
                  {pose.id}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
