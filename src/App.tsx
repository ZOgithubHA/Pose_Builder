import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Copy,
  FileJson,
  FileText,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  Upload,
  X,
} from 'lucide-react';
import { CompletionMatrix } from './components/CompletionMatrix';
import { PoseCard } from './components/PoseCard';
import { PoseReferenceModal } from './components/PoseReferenceModal';
import { StudioWorkbench } from './components/StudioWorkbench';
import { INITIAL_POSES, POSE_CATEGORIES } from './data/poses';
import {
  PoseCategory,
  PoseEntry,
  StatusFilter,
  StudioState,
  ViewMode,
} from './types';
import { CATEGORY_LABELS_RU } from './utils/i18nRu';
import {
  buildMasterPrompt,
  formatPromptTxtExport,
  triggerFileDownload,
} from './utils/promptBuilder';
import {
  clearAllStoredData,
  DEFAULT_STUDIO_STATE,
  loadPosesFromStorage,
  loadStudioState,
  loadViewMode,
  savePosesToStorage,
  saveStudioState,
  saveViewMode,
} from './utils/storage';

export default function App() {
  const [poses, setPoses] = useState<PoseEntry[]>(() => loadPosesFromStorage());
  const [studio, setStudio] = useState<StudioState>(() => loadStudioState());
  const [viewMode, setViewMode] = useState<ViewMode>(() => loadViewMode());

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PoseCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [modalPoseId, setModalPoseId] = useState<number | null>(null);
  const [headerCopied, setHeaderCopied] = useState(false);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    savePosesToStorage(poses);
  }, [poses]);

  useEffect(() => {
    saveStudioState(studio);
  }, [studio]);

  useEffect(() => {
    saveViewMode(viewMode);
  }, [viewMode]);

  const selectedPose = useMemo(
    () => poses.find((p) => p.id === studio.selectedPoseId) ?? poses[0],
    [poses, studio.selectedPoseId]
  );

  const generatedMasterPrompt = useMemo(
    () => buildMasterPrompt(selectedPose, studio),
    [selectedPose, studio]
  );

  const activeMasterPrompt =
    studio.manualMasterPrompt !== null ? studio.manualMasterPrompt : generatedMasterPrompt;

  const modalPose = useMemo(
    () => (modalPoseId !== null ? poses.find((p) => p.id === modalPoseId) ?? null : null),
    [poses, modalPoseId]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: poses.length };
    for (const cat of POSE_CATEGORIES) {
      counts[cat] = poses.filter((p) => p.category === cat).length;
    }
    return counts;
  }, [poses]);

  const filteredPoses = useMemo(() => {
    const rawQ = searchQuery.trim().toLowerCase();
    const numericQuery = rawQ.replace(/^[#№\s]+/, '');
    const isNumericSearch = /^\d+$/.test(numericQuery);

    return poses.filter((pose) => {
      if (selectedCategory !== 'All' && pose.category !== selectedCategory) {
        return false;
      }
      if (statusFilter === 'edited' && pose.promptStatus !== 'edited') {
        return false;
      }
      if (statusFilter === 'newly_authored' && pose.promptStatus !== 'newly_authored') {
        return false;
      }
      if (statusFilter === 'favorites' && !pose.favorite) {
        return false;
      }

      if (!rawQ) return true;

      if (isNumericSearch) {
        return (
          String(pose.id) === numericQuery ||
          String(pose.id).padStart(2, '0').includes(numericQuery)
        );
      }

      return (
        pose.titleRu.toLowerCase().includes(rawQ) ||
        pose.descriptionRu.toLowerCase().includes(rawQ) ||
        pose.title.toLowerCase().includes(rawQ) ||
        CATEGORY_LABELS_RU[pose.category].toLowerCase().includes(rawQ) ||
        pose.category.toLowerCase().includes(rawQ) ||
        pose.prompt.toLowerCase().includes(rawQ)
      );
    });
  }, [poses, searchQuery, selectedCategory, statusFilter]);

  const handleSelectPose = (id: number) => {
    setStudio((prev) => ({
      ...prev,
      selectedPoseId: id,
      manualMasterPrompt: null,
    }));
  };

  const handleUpdatePosePrompt = (id: number, nextPrompt: string) => {
    setPoses((prev) =>
      prev.map((pose) => {
        if (pose.id !== id) return pose;
        const original = INITIAL_POSES.find((item) => item.id === id);
        const isBackToOriginal = original && nextPrompt === original.prompt;
        return {
          ...pose,
          prompt: nextPrompt,
          promptStatus: isBackToOriginal ? 'newly_authored' : 'edited',
        };
      })
    );
  };

  const handleResetPosePrompt = (id: number) => {
    const original = INITIAL_POSES.find((item) => item.id === id);
    if (!original) return;
    setPoses((prev) =>
      prev.map((pose) =>
        pose.id === id
          ? {
              ...pose,
              prompt: original.prompt,
              promptStatus: original.promptStatus,
            }
          : pose
      )
    );
  };

  const handleToggleFavorite = (id: number) => {
    setPoses((prev) =>
      prev.map((pose) =>
        pose.id === id ? { ...pose, favorite: !pose.favorite } : pose
      )
    );
  };

  const handleJumpToPose = (id: number) => {
    setSelectedCategory('All');
    setStatusFilter('all');
    setSearchQuery('');
    handleSelectPose(id);

    window.requestAnimationFrame(() => {
      const el = document.getElementById(`pose-card-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  const handleCopyMasterFromHeader = async () => {
    try {
      await navigator.clipboard.writeText(activeMasterPrompt);
    } catch {
      const el = document.createElement('textarea');
      el.value = activeMasterPrompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setHeaderCopied(true);
    window.setTimeout(() => setHeaderCopied(false), 1800);
  };

  const handleExportSelectedTxt = () => {
    const content = formatPromptTxtExport(
      selectedPose,
      studio,
      activeMasterPrompt
    );
    const slug = selectedPose.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    triggerFileDownload(
      `pose-${String(selectedPose.id).padStart(2, '0')}-${slug}.txt`,
      content,
      'text/plain;charset=utf-8'
    );
  };

  const handleExportLibraryJson = () => {
    const payload = {
      application: 'Конструктор модных поз AI',
      exportedAt: new Date().toISOString(),
      totalPoses: poses.length,
      sourceTransparencyNote:
        'Неизменённые записи отмечены как newly_authored, так как исходные исторические тексты промптов не были переданы в сессии.',
      studioConfiguration: {
        selectedPoseId: studio.selectedPoseId,
        identityLock: studio.character.identityLock,
        fashion: studio.fashion,
        camera: studio.camera,
        lightingBackground: studio.lightingBackground,
      },
      poses: poses.map((pose) => ({
        id: pose.id,
        title: pose.title,
        titleRu: pose.titleRu,
        descriptionRu: pose.descriptionRu,
        titleUz: pose.titleUz,
        descriptionUz: pose.descriptionUz,
        category: pose.category,
        categoryRu: CATEGORY_LABELS_RU[pose.category],
        referenceImage: pose.referenceImage,
        prompt: pose.prompt,
        promptStatus: pose.promptStatus,
        favorite: pose.favorite,
      })),
    };

    triggerFileDownload(
      'ai-fashion-pose-library-81.json',
      JSON.stringify(payload, null, 2),
      'application/json;charset=utf-8'
    );
  };

  const handleExportAllTxt = () => {
    const lines: string[] = [
      'КОНСТРУКТОР МОДНЫХ ПОЗ AI — ПОЛНЫЙ СБОРНИК 81 ПОЗЫ',
      '==================================================',
      `Дата экспорта: ${new Date().toISOString()}`,
      'Примечание: неотредактированные записи являются новыми авторскими черновиками.',
      '',
    ];

    for (const pose of poses) {
      const statusRu =
        pose.promptStatus === 'edited' ? 'Отредактировано' : 'Новый черновик';
      lines.push(
        `№ ${String(pose.id).padStart(2, '0')} | ${pose.titleRu} [${CATEGORY_LABELS_RU[pose.category]}] — ${statusRu}${pose.favorite ? ' ★' : ''}`
      );
      lines.push(`ОПИСАНИЕ: ${pose.descriptionRu}`);
      lines.push(`PROMPT: ${pose.prompt}`);
      lines.push('');
    }

    triggerFileDownload(
      'ai-fashion-pose-library-81.txt',
      lines.join('\n'),
      'text/plain;charset=utf-8'
    );
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportNotice(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importedList = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.poses)
        ? parsed.poses
        : null;

      if (!importedList) {
        setImportNotice('Неверный формат JSON. Ожидается массив или объект { poses: [...] }.');
        return;
      }

      const byId = new Map<number, Partial<PoseEntry>>();
      for (const item of importedList) {
        if (item && typeof item.id === 'number') {
          byId.set(item.id, item);
        }
      }

      let updatedCount = 0;
      setPoses((prev) =>
        prev.map((pose) => {
          const match = byId.get(pose.id);
          if (!match) return pose;
          updatedCount += 1;
          return {
            ...pose,
            prompt:
              typeof match.prompt === 'string' && match.prompt.trim()
                ? match.prompt
                : pose.prompt,
            promptStatus: match.promptStatus === 'edited' ? 'edited' : pose.promptStatus,
            favorite:
              typeof match.favorite === 'boolean' ? match.favorite : pose.favorite,
          };
        })
      );

      setImportNotice(`Импортированы обновления для ${updatedCount} поз.`);
    } catch {
      setImportNotice('Не удалось прочитать выбранный JSON-файл.');
    } finally {
      e.target.value = '';
    }
  };

  const handleResetAllData = () => {
    clearAllStoredData();
    setPoses(INITIAL_POSES);
    setStudio(DEFAULT_STUDIO_STATE);
    setViewMode('grid');
    setSearchQuery('');
    setSelectedCategory('All');
    setStatusFilter('all');
    setConfirmResetAll(false);
    setImportNotice('Все локальные правки и настройки студии сброшены к исходным.');
  };

  const handleNavigateModal = (direction: 'prev' | 'next') => {
    if (modalPoseId === null) return;
    const nextId =
      direction === 'prev'
        ? modalPoseId <= 1
          ? 81
          : modalPoseId - 1
        : modalPoseId >= 81
        ? 1
        : modalPoseId + 1;
    setModalPoseId(nextId);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#111110]">
      {/* ВЕРХНЯЯ ПАНЕЛЬ (3-зонный контракт) */}
      <header className="sticky top-0 z-30 border-b border-[#E6DFD3] bg-[#FAF8F4]/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Зона 1: Название */}
          <a
            href="#dashboard"
            className="font-display text-xl font-semibold tracking-tight text-[#111110] whitespace-nowrap shrink-0 sm:text-2xl"
          >
            Конструктор модных поз AI
          </a>

          {/* Зона 2: 4 навигационные ссылки в одну строку */}
          <nav
            aria-label="Основная навигация"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4A4742]"
          >
            <a
              href="#dashboard"
              className="hover:text-[#111110] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Панель
            </a>
            <a
              href="#pose-library"
              className="hover:text-[#111110] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Библиотека поз
            </a>
            <a
              href="#prompt-studio"
              className="hover:text-[#111110] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Студия промптов
            </a>
            <a
              href="#export-section"
              className="hover:text-[#111110] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Экспорт
            </a>
          </nav>

          {/* Зона 3: Основное действие */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleCopyMasterFromHeader}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                headerCopied
                  ? 'bg-[#2C4A34] text-white'
                  : 'bg-[#111110] text-[#FAF8F4] hover:bg-[#2A2825]'
              }`}
            >
              {headerCopied ? (
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
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* 1. ПАНЕЛЬ УПРАВЛЕНИЯ */}
        <section id="dashboard" className="space-y-5">
          <div className="flex flex-col gap-4 border-b border-[#E6DFD3] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium tracking-wide text-[#8C7355]">
                Эдиториал-архив промптов · 81 пронумерованная поза · Сохранение в браузере
              </p>
              <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-[#111110] sm:text-4xl [text-wrap:balance]">
                Библиотека модных поз и студия генерации промптов
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#4A4742]">
                Выберите любую из 81 пронумерованной позы, загрузите референс своего
                AI-персонажа, настройте одежду, оптику камеры и свет, затем отредактируйте,
                скопируйте или экспортируйте готовый английский промпт для генерации.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-[#4A4742] shrink-0">
              <div>
                <span className="block font-display text-2xl font-semibold text-[#111110] tabular-nums">
                  {poses.length}
                </span>
                <span className="text-xs text-[#767067]">Всего поз</span>
              </div>
              <div className="h-8 w-px bg-[#E6DFD3]" aria-hidden="true" />
              <div>
                <span className="block font-display text-2xl font-semibold text-[#111110] tabular-nums">
                  № {String(selectedPose.id).padStart(2, '0')}
                </span>
                <span className="text-xs text-[#767067]">Активная поза</span>
              </div>
              <div className="h-8 w-px bg-[#E6DFD3]" aria-hidden="true" />
              <div>
                <span className="block font-display text-2xl font-semibold text-[#111110] tabular-nums">
                  {studio.camera.aspectRatio}
                </span>
                <span className="text-xs text-[#767067]">Формат кадра</span>
              </div>
            </div>
          </div>

          {/* Прозрачное уведомление об источнике промптов */}
          <div className="rounded-xl border border-[#E6DFD3] bg-[#F5F0E6] px-4 py-3 text-xs leading-relaxed text-[#4A4742]">
            <span className="font-semibold text-[#111110]">Примечание об источнике:</span>{' '}
            тексты из прошлых переписок не были переданы в эту сессию. Чтобы не
            выдумывать исторические записи, все 81 исходных промпта честно отмечены как{' '}
            <span className="font-medium text-[#111110]">Новые черновики</span>. Любой
            отредактированный вами промпт получает статус{' '}
            <span className="font-medium text-[#7A5C38]">Отредактировано</span> и
            автоматически сохраняется в браузере.
          </div>

          {/* Статус 81 позы */}
          <CompletionMatrix
            poses={poses}
            selectedPoseId={studio.selectedPoseId}
            onJumpToPose={handleJumpToPose}
          />

          {/* Поиск, фильтры по категориям и статусу, переключение вида */}
          <div className="space-y-3.5 rounded-xl border border-[#E6DFD3] bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Поиск */}
              <div className="relative flex-1 md:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#767067]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по номеру (например, 46) или названию позы..."
                  aria-label="Поиск по номеру или названию позы"
                  className="w-full rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] py-2 pl-9 pr-8 text-sm text-[#111110] placeholder:text-[#8A8379] focus:border-[#111110] focus:bg-white focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Очистить поиск"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#767067] hover:text-[#111110]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Фильтр статуса + Сетка/Список */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div
                  role="group"
                  aria-label="Фильтр по статусу промпта"
                  className="flex items-center gap-1 rounded-lg bg-[#F3EFE7] p-1"
                >
                  {(
                    [
                      { id: 'all', label: 'Все' },
                      { id: 'newly_authored', label: 'Черновики' },
                      { id: 'edited', label: 'Изменённые' },
                      { id: 'favorites', label: 'Избранное' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStatusFilter(item.id)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        statusFilter === item.id
                          ? 'bg-white text-[#111110] shadow-xs'
                          : 'text-[#5D574F] hover:text-[#111110]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div
                  role="group"
                  aria-label="Режим отображения"
                  className="flex items-center gap-1 rounded-lg bg-[#F3EFE7] p-1"
                >
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    aria-pressed={viewMode === 'grid'}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      viewMode === 'grid'
                        ? 'bg-white text-[#111110] shadow-xs'
                        : 'text-[#5D574F] hover:text-[#111110]'
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Сетка
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    aria-pressed={viewMode === 'list'}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      viewMode === 'list'
                        ? 'bg-white text-[#111110] shadow-xs'
                        : 'text-[#5D574F] hover:text-[#111110]'
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    Список
                  </button>
                </div>
              </div>
            </div>

            {/* Кнопки категорий */}
            <div className="flex flex-wrap items-center gap-1.5 border-t border-[#EFEAE0] pt-3">
              {(['All', ...POSE_CATEGORIES] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#111110] text-[#FAF8F4]'
                      : 'border border-[#E6DFD3] bg-[#FAF8F4] text-[#4A4742] hover:border-[#111110] hover:text-[#111110]'
                  }`}
                >
                  {cat === 'All' ? 'Все категории' : CATEGORY_LABELS_RU[cat]}{' '}
                  <span className="opacity-70 tabular-nums">
                    ({categoryCounts[cat] ?? 0})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 2. ОСНОВНАЯ РАБОЧАЯ ОБЛАСТЬ: БИБЛИОТЕКА ПОЗ (СЛЕВА) + СТУДИЯ (СПРАВА) */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_440px] xl:grid-cols-[minmax(0,1fr)_460px]">
          {/* Библиотека поз */}
          <section id="pose-library" aria-label="Библиотека из 81 позы" className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-display text-2xl font-semibold text-[#111110]">
                Библиотека поз
              </h2>
              <p className="text-xs text-[#767067] tabular-nums">
                Показано {filteredPoses.length} из {poses.length} поз
              </p>
            </div>

            {filteredPoses.length === 0 ? (
              <div className="rounded-xl border border-[#E6DFD3] bg-white p-10 text-center">
                <p className="font-display text-xl font-semibold text-[#111110]">
                  По заданному фильтру позы не найдены
                </p>
                <p className="mt-1 text-xs text-[#4A4742]">
                  Попробуйте очистить строку поиска или вернуть отображение всех 81 поз.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setStatusFilter('all');
                  }}
                  className="mt-4 rounded-lg bg-[#111110] px-4 py-2 text-xs font-medium text-[#FAF8F4] hover:bg-[#2A2825]"
                >
                  Показать все 81 позы
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-4 xl:grid-cols-2'
                    : 'flex flex-col gap-4'
                }
              >
                {filteredPoses.map((pose) => {
                  const original = INITIAL_POSES.find((p) => p.id === pose.id);
                  return (
                    <PoseCard
                      key={pose.id}
                      pose={pose}
                      isSelected={pose.id === studio.selectedPoseId}
                      viewMode={viewMode}
                      originalPrompt={original?.prompt ?? pose.prompt}
                      onSelect={handleSelectPose}
                      onUpdatePrompt={handleUpdatePosePrompt}
                      onResetPrompt={handleResetPosePrompt}
                      onToggleFavorite={handleToggleFavorite}
                      onPreviewImage={(p) => setModalPoseId(p.id)}
                    />
                  );
                })}
              </div>
            )}
          </section>

          {/* Закреплённая студия промптов */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <StudioWorkbench
              selectedPose={selectedPose}
              studio={studio}
              generatedPrompt={generatedMasterPrompt}
              activePrompt={activeMasterPrompt}
              onUpdateStudio={setStudio}
              onResetStudioSettings={() =>
                setStudio((prev) => ({
                  ...DEFAULT_STUDIO_STATE,
                  selectedPoseId: prev.selectedPoseId,
                  character: prev.character,
                  manualMasterPrompt: null,
                }))
              }
              onRegenerateMasterPrompt={() =>
                setStudio((prev) => ({
                  ...prev,
                  manualMasterPrompt: null,
                }))
              }
              onExportSelectedTxt={handleExportSelectedTxt}
              onExportLibraryJson={handleExportLibraryJson}
              onJumpToPose={handleJumpToPose}
            />
          </div>
        </div>

        {/* 3. ЭКСПОРТ И РЕЗЕРВНОЕ КОПИРОВАНИЕ */}
        <section
          id="export-section"
          aria-label="Экспорт и резервное копирование"
          className="mt-10 rounded-xl border border-[#E6DFD3] bg-white p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#111110]">
                Экспорт и резервная копия библиотеки
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#4A4742]">
                Экспортируйте активный итоговый промпт в формате TXT, скачайте все 81
                позу (с описаниями, иллюстрациями, статусами и избранным) в формате JSON
                или импортируйте ранее сохранённую копию.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportSelectedTxt}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8CFC0] bg-[#FAF8F4] px-3.5 py-2 text-xs font-medium text-[#111110] hover:border-[#111110] whitespace-nowrap shrink-0"
              >
                <FileText className="h-3.5 w-3.5 text-[#8C7355]" />
                Экспорт выбранного .TXT
              </button>

              <button
                type="button"
                onClick={handleExportAllTxt}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8CFC0] bg-[#FAF8F4] px-3.5 py-2 text-xs font-medium text-[#111110] hover:border-[#111110] whitespace-nowrap shrink-0"
              >
                <FileText className="h-3.5 w-3.5 text-[#8C7355]" />
                Экспорт всех 81 .TXT
              </button>

              <button
                type="button"
                onClick={handleExportLibraryJson}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#111110] px-4 py-2 text-xs font-semibold text-[#FAF8F4] hover:bg-[#2A2825] whitespace-nowrap shrink-0"
              >
                <FileJson className="h-3.5 w-3.5" />
                Экспорт JSON (81 поза)
              </button>

              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportJson}
                className="hidden"
                aria-label="Импортировать JSON библиотеки поз"
              />
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8CFC0] bg-white px-3.5 py-2 text-xs font-medium text-[#111110] hover:border-[#111110] whitespace-nowrap shrink-0"
              >
                <Upload className="h-3.5 w-3.5" />
                Импорт JSON
              </button>

              {!confirmResetAll ? (
                <button
                  type="button"
                  onClick={() => setConfirmResetAll(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6DFD3] bg-white px-3.5 py-2 text-xs font-medium text-[#767067] hover:border-[#111110] hover:text-[#111110] whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Сбросить LocalStorage
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleResetAllData}
                    className="rounded-lg bg-[#9B2C2C] px-3 py-2 text-xs font-semibold text-white hover:bg-[#7F1D1D] whitespace-nowrap shrink-0"
                  >
                    Подтвердить сброс
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetAll(false)}
                    className="rounded-lg border border-[#E6DFD3] bg-white px-3 py-2 text-xs font-medium text-[#4A4742] hover:border-[#111110] whitespace-nowrap shrink-0"
                  >
                    Отмена
                  </button>
                </div>
              )}
            </div>
          </div>

          {importNotice && (
            <p className="mt-3 text-xs font-medium text-[#4A4742]">{importNotice}</p>
          )}
        </section>
      </main>

      <footer className="mt-12 border-t border-[#E6DFD3] bg-white/70 py-6">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 text-xs text-[#767067] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>Конструктор модных поз AI · 81 пронумерованная эдиториал-поза</span>
          <span>Работает локально в браузере · Без платных API · Сохранение в LocalStorage</span>
        </div>
      </footer>

      {/* Модальное окно увеличенного просмотра схемы позы */}
      <PoseReferenceModal
        pose={modalPose}
        onClose={() => setModalPoseId(null)}
        onSelectPose={handleSelectPose}
        onNavigate={handleNavigateModal}
      />
    </div>
  );
}
