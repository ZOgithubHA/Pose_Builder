import React, { useRef, useState } from 'react';
import {
  Camera,
  Check,
  Copy,
  Download,
  FileJson,
  FileText,
  ImagePlus,
  Lock,
  RefreshCw,
  RotateCcw,
  Shirt,
  Sun,
  Trash2,
  Unlock,
  User,
} from 'lucide-react';
import {
  AspectRatioOption,
  BackgroundPreset,
  CameraAngle,
  LensOption,
  LightingOption,
  PoseEntry,
  ShotType,
  StudioState,
} from '../types';
import {
  BACKGROUND_LABELS_RU,
  CAMERA_ANGLE_LABELS_RU,
  CATEGORY_LABELS_RU,
  LENS_LABELS_RU,
  LIGHTING_LABELS_RU,
  SHOT_TYPE_LABELS_RU,
} from '../utils/i18nRu';
import { resizeImageFileToDataUrl } from '../utils/storage';

type StudioTab = 'character' | 'fashion' | 'camera' | 'lighting';

interface StudioWorkbenchProps {
  selectedPose: PoseEntry;
  studio: StudioState;
  generatedPrompt: string;
  activePrompt: string;
  onUpdateStudio: (updater: (prev: StudioState) => StudioState) => void;
  onResetStudioSettings: () => void;
  onRegenerateMasterPrompt: () => void;
  onExportSelectedTxt: () => void;
  onExportLibraryJson: () => void;
  onJumpToPose: (id: number) => void;
}

const CAMERA_ANGLES: CameraAngle[] = [
  'eye level',
  'low angle',
  'high angle',
  'overhead',
  'side angle',
  'front angle',
];

const SHOT_TYPES: ShotType[] = ['close-up', 'medium', 'three-quarter', 'full body'];

const LENS_OPTIONS: LensOption[] = ['35mm', '50mm', '85mm', '105mm'];

const ASPECT_RATIOS: AspectRatioOption[] = ['2:3', '3:4', '4:5', '9:16', '1:1'];

const LIGHTING_OPTIONS: LightingOption[] = [
  'Soft studio',
  'Beauty lighting',
  'Rembrandt lighting',
  'Golden hour',
  'Cinematic lighting',
  'Natural daylight',
];

const BACKGROUND_PRESETS: BackgroundPreset[] = [
  'White studio',
  'Luxury interior',
  'Urban street',
  'Nature',
  'Custom',
];

const OUTFIT_PRESETS = [
  {
    label: 'Песочный блейзер',
    outfit: 'tailored warm-sand wool double-breasted blazer over silk ivory slip dress',
    style: 'Minimalist Quiet Luxury',
    shoes: 'pointed leather slingback heels',
    handbag: 'structured matte calfskin top-handle bag',
    accessories: 'none',
    jewelry: 'sculptural brushed-gold hoop earrings',
  },
  {
    label: 'Парижский тренч',
    outfit:
      'belted stone-beige gabardine trench coat over crisp poplin shirt and wide-leg charcoal trousers',
    style: 'Parisian Editorial Tailoring',
    shoes: 'black square-toe leather ankle boots',
    handbag: 'folded espresso leather clutch',
    accessories: 'silk neck scarf',
    jewelry: 'delicate gold chain necklace',
  },
  {
    label: 'Вечернее платье',
    outfit: 'floor-length champagne bias-cut silk satin evening gown with draped back',
    style: 'Haute Couture Evening',
    shoes: 'minimalist metallic strappy sandals',
    handbag: 'micro satin evening pouch',
    accessories: 'sheer opera gloves',
    jewelry: 'baroque pearl drop earrings',
  },
  {
    label: 'Монохромный костюм',
    outfit: 'oversized architectural ivory linen suit with relaxed pleated trousers',
    style: 'Avant-Garde Minimalism',
    shoes: 'architectural flat leather loafers',
    handbag: 'oversized woven leather tote',
    accessories: 'slim tortoiseshell acetate sunglasses',
    jewelry: 'sculptural silver cuff bracelet',
  },
];

export const StudioWorkbench: React.FC<StudioWorkbenchProps> = ({
  selectedPose,
  studio,
  generatedPrompt,
  activePrompt,
  onUpdateStudio,
  onResetStudioSettings,
  onRegenerateMasterPrompt,
  onExportSelectedTxt,
  onExportLibraryJson,
  onJumpToPose,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('character');
  const [copiedMaster, setCopiedMaster] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isManualOverride =
    studio.manualMasterPrompt !== null &&
    studio.manualMasterPrompt !== generatedPrompt;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Пожалуйста, выберите корректный файл изображения (JPG, PNG или WEBP).');
      return;
    }

    try {
      const dataUrl = await resizeImageFileToDataUrl(file, 720);
      onUpdateStudio((prev) => ({
        ...prev,
        character: {
          ...prev.character,
          imageDataUrl: dataUrl,
          fileName: file.name,
        },
      }));
    } catch {
      setUploadError('Не удалось загрузить выбранное изображение.');
    } finally {
      e.target.value = '';
    }
  };

  const handleCopyMaster = async () => {
    try {
      await navigator.clipboard.writeText(activePrompt);
      setCopiedMaster(true);
      window.setTimeout(() => setCopiedMaster(false), 1800);
    } catch {
      const el = document.createElement('textarea');
      el.value = activePrompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedMaster(true);
      window.setTimeout(() => setCopiedMaster(false), 1800);
    }
  };

  return (
    <aside
      id="prompt-studio"
      aria-label="Студия настройки промпта"
      className="rounded-xl border border-[#E6DFD3] bg-white p-5"
    >
      {/* Заголовок активной позы */}
      <div className="flex items-start justify-between gap-3 border-b border-[#EFEAE0] pb-4">
        <div className="min-w-0">
          <p className="text-xs text-[#767067]">
            Активная поза ·{' '}
            <span className="font-mono-tabular font-medium text-[#111110]">
              № {String(selectedPose.id).padStart(2, '0')}
            </span>
          </p>
          <h2 className="mt-0.5 truncate font-display text-2xl font-semibold text-[#111110]">
            {selectedPose.titleRu}
          </h2>
          <p className="truncate text-xs text-[#8C7355]">
            {CATEGORY_LABELS_RU[selectedPose.category]}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onJumpToPose(selectedPose.id)}
          className="rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-3 py-1.5 text-xs font-medium text-[#111110] hover:border-[#111110] whitespace-nowrap shrink-0"
        >
          К карточке
        </button>
      </div>

      {/* Вкладки модулей студии */}
      <div
        role="tablist"
        aria-label="Разделы настроек студии"
        className="mt-4 grid grid-cols-4 gap-1 rounded-lg bg-[#F3EFE7] p-1"
      >
        {(
          [
            { id: 'character', label: 'Персонаж', icon: User },
            { id: 'fashion', label: 'Образ', icon: Shirt },
            { id: 'camera', label: 'Камера', icon: Camera },
            { id: 'lighting', label: 'Свет', icon: Sun },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center justify-center gap-1 rounded-md px-1.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === id
                ? 'bg-white text-[#111110] shadow-xs'
                : 'text-[#5D574F] hover:text-[#111110]'
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Панели настроек */}
      <div className="mt-4 space-y-4">
        {activeTab === 'character' && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Загрузить референс-изображение персонажа"
            />

            {studio.character.imageDataUrl ? (
              <div className="flex gap-3.5 rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] p-3">
                <div className="h-28 w-22 shrink-0 overflow-hidden rounded-md border border-[#E6DFD3] bg-white">
                  <img
                    src={studio.character.imageDataUrl}
                    alt="Загруженный референс персонажа"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#111110]">
                      Референс персонажа загружен
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-[#767067]">
                      {studio.character.fileName ?? 'Локальный портрет персонажа'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#D8CFC0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#111110] hover:border-[#111110] whitespace-nowrap shrink-0"
                    >
                      <ImagePlus className="h-3.5 w-3.5" />
                      Заменить
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateStudio((prev) => ({
                          ...prev,
                          character: {
                            ...prev.character,
                            imageDataUrl: null,
                            fileName: null,
                          },
                        }))
                      }
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#E6DFD3] bg-white px-2.5 py-1.5 text-xs font-medium text-[#767067] hover:border-[#111110] hover:text-[#111110] whitespace-nowrap shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#C5B393] bg-[#FAF8F4] px-4 py-6 text-center transition-colors hover:border-[#111110] hover:bg-[#F3EFE7]"
              >
                <ImagePlus className="h-6 w-6 text-[#8C7355]" />
                <span className="mt-2 text-xs font-medium text-[#111110]">
                  Загрузить фото-референс AI-персонажа
                </span>
                <span className="mt-0.5 text-[11px] text-[#767067]">
                  Выберите JPG, PNG или WEBP с вашего устройства
                </span>
              </button>
            )}

            {uploadError && (
              <p className="text-xs text-[#9B2C2C]">{uploadError}</p>
            )}

            {/* Переключатель фиксации внешности */}
            <div className="rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {studio.character.identityLock ? (
                    <Lock className="h-4 w-4 text-[#111110]" />
                  ) : (
                    <Unlock className="h-4 w-4 text-[#767067]" />
                  )}
                  <div>
                    <p className="text-xs font-semibold text-[#111110]">
                      Фиксация внешности (Identity Lock)
                    </p>
                    <p className="text-[11px] text-[#767067]">
                      {studio.character.identityLock
                        ? 'Включена в промпт'
                        : 'Отключена'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={studio.character.identityLock}
                  onClick={() =>
                    onUpdateStudio((prev) => ({
                      ...prev,
                      character: {
                        ...prev.character,
                        identityLock: !prev.character.identityLock,
                      },
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    studio.character.identityLock ? 'bg-[#111110]' : 'bg-[#D2C7B4]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      studio.character.identityLock ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <p className="mt-2.5 text-[11px] leading-relaxed text-[#4A4742]">
                Добавляет в промпт сохранение черт лица, овала, глаз, носа, губ,
                оттенка кожи, причёски и индивидуальных особенностей.{' '}
                <span className="font-medium text-[#111110]">
                  Важно: один только текст не гарантирует 100% портретное сходство
                </span>{' '}
                — обязательно прикрепляйте фото-референс в вашем генераторе изображений
                (Face Reference / IP-Adapter / Character Weight).
              </p>
            </div>

            <div>
              <label
                htmlFor="character-notes"
                className="mb-1 block text-xs font-medium text-[#4A4742]"
              >
                Дополнительные черты персонажа (для промпта на англ.)
              </label>
              <input
                id="character-notes"
                type="text"
                value={studio.character.notes}
                onChange={(e) =>
                  onUpdateStudio((prev) => ({
                    ...prev,
                    character: { ...prev.character, notes: e.target.value },
                  }))
                }
                placeholder="Например: sleek low bun, subtle beauty mark near left cheek"
                className="w-full rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-3 py-2 text-xs text-[#111110] placeholder:text-[#9A9389] focus:border-[#111110] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'fashion' && (
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-[#767067]">
                Быстрые пресеты образов (подставляются в английский промпт)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {OUTFIT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      onUpdateStudio((prev) => ({
                        ...prev,
                        fashion: {
                          outfitDescription: preset.outfit,
                          clothingStyle: preset.style,
                          shoes: preset.shoes,
                          accessories: preset.accessories,
                          handbag: preset.handbag,
                          jewelry: preset.jewelry,
                        },
                      }))
                    }
                    className="rounded-md border border-[#E6DFD3] bg-[#FAF8F4] px-2.5 py-1 text-[11px] font-medium text-[#4A4742] hover:border-[#111110] hover:text-[#111110] whitespace-nowrap shrink-0"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="outfit-desc"
                className="mb-1 block text-xs font-medium text-[#4A4742]"
              >
                Описание одежды
              </label>
              <textarea
                id="outfit-desc"
                rows={2}
                value={studio.fashion.outfitDescription}
                onChange={(e) =>
                  onUpdateStudio((prev) => ({
                    ...prev,
                    fashion: { ...prev.fashion, outfitDescription: e.target.value },
                  }))
                }
                placeholder="Опишите одежду, ткань, крой и палитру для промпта..."
                className="w-full rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-3 py-2 text-xs text-[#111110] focus:border-[#111110] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="clothing-style"
                  className="mb-1 block text-xs font-medium text-[#4A4742]"
                >
                  Стиль одежды
                </label>
                <input
                  id="clothing-style"
                  type="text"
                  value={studio.fashion.clothingStyle}
                  onChange={(e) =>
                    onUpdateStudio((prev) => ({
                      ...prev,
                      fashion: { ...prev.fashion, clothingStyle: e.target.value },
                    }))
                  }
                  placeholder="Например: Quiet Luxury, Haute Couture"
                  className="w-full rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-3 py-2 text-xs text-[#111110] focus:border-[#111110] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="fashion-shoes"
                  className="mb-1 block text-xs font-medium text-[#4A4742]"
                >
                  Обувь
                </label>
                <input
                  id="fashion-shoes"
                  type="text"
                  value={studio.fashion.shoes}
                  onChange={(e) =>
                    onUpdateStudio((prev) => ({
                      ...prev,
                      fashion: { ...prev.fashion, shoes: e.target.value },
                    }))
                  }
                  placeholder="Например: pointed leather slingbacks"
                  className="w-full rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-3 py-2 text-xs text-[#111110] focus:border-[#111110] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="fashion-handbag"
                  className="mb-1 block text-xs font-medium text-[#4A4742]"
                >
                  Сумка
                </label>
                <input
                  id="fashion-handbag"
                  type="text"
                  value={studio.fashion.handbag}
                  onChange={(e) =>
                    onUpdateStudio((prev) => ({
                      ...prev,
                      fashion: { ...prev.fashion, handbag: e.target.value },
                    }))
                  }
                  placeholder="Например: structured leather tote"
                  className="w-full rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-3 py-2 text-xs text-[#111110] focus:border-[#111110] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="fashion-jewelry"
                  className="mb-1 block text-xs font-medium text-[#4A4742]"
                >
                  Украшения
                </label>
                <input
                  id="fashion-jewelry"
                  type="text"
                  value={studio.fashion.jewelry}
                  onChange={(e) =>
                    onUpdateStudio((prev) => ({
                      ...prev,
                      fashion: { ...prev.fashion, jewelry: e.target.value },
                    }))
                  }
                  placeholder="Например: sculptural gold hoops"
                  className="w-full rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-3 py-2 text-xs text-[#111110] focus:border-[#111110] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="fashion-accessories"
                className="mb-1 block text-xs font-medium text-[#4A4742]"
              >
                Аксессуары
              </label>
              <input
                id="fashion-accessories"
                type="text"
                value={studio.fashion.accessories}
                onChange={(e) =>
                  onUpdateStudio((prev) => ({
                    ...prev,
                    fashion: { ...prev.fashion, accessories: e.target.value },
                  }))
                }
                placeholder="Например: silk neck scarf, belt, sunglasses"
                className="w-full rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-3 py-2 text-xs text-[#111110] focus:border-[#111110] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'camera' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="cam-angle"
                  className="mb-1 block text-xs font-medium text-[#4A4742]"
                >
                  Ракурс камеры
                </label>
                <select
                  id="cam-angle"
                  value={studio.camera.angle}
                  onChange={(e) =>
                    onUpdateStudio((prev) => ({
                      ...prev,
                      camera: {
                        ...prev.camera,
                        angle: e.target.value as CameraAngle,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-2.5 py-2 text-xs text-[#111110] focus:border-[#111110] focus:bg-white focus:outline-none"
                >
                  {CAMERA_ANGLES.map((angle) => (
                    <option key={angle} value={angle}>
                      {CAMERA_ANGLE_LABELS_RU[angle]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="cam-shot"
                  className="mb-1 block text-xs font-medium text-[#4A4742]"
                >
                  Тип плана
                </label>
                <select
                  id="cam-shot"
                  value={studio.camera.shotType}
                  onChange={(e) =>
                    onUpdateStudio((prev) => ({
                      ...prev,
                      camera: {
                        ...prev.camera,
                        shotType: e.target.value as ShotType,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-2.5 py-2 text-xs text-[#111110] focus:border-[#111110] focus:bg-white focus:outline-none"
                >
                  {SHOT_TYPES.map((shot) => (
                    <option key={shot} value={shot}>
                      {SHOT_TYPE_LABELS_RU[shot]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-medium text-[#4A4742]">
                Объектив
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {LENS_OPTIONS.map((lens) => (
                  <button
                    key={lens}
                    type="button"
                    onClick={() =>
                      onUpdateStudio((prev) => ({
                        ...prev,
                        camera: { ...prev.camera, lens },
                      }))
                    }
                    className={`rounded-lg py-2 text-xs font-mono-tabular font-medium transition-colors whitespace-nowrap shrink-0 ${
                      studio.camera.lens === lens
                        ? 'bg-[#111110] text-[#FAF8F4]'
                        : 'border border-[#E6DFD3] bg-[#FAF8F4] text-[#4A4742] hover:border-[#111110]'
                    }`}
                  >
                    {LENS_LABELS_RU[lens]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-medium text-[#4A4742]">
                Соотношение сторон
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() =>
                      onUpdateStudio((prev) => ({
                        ...prev,
                        camera: { ...prev.camera, aspectRatio: ratio },
                      }))
                    }
                    className={`rounded-lg py-2 text-xs font-mono-tabular font-medium transition-colors whitespace-nowrap shrink-0 ${
                      studio.camera.aspectRatio === ratio
                        ? 'bg-[#111110] text-[#FAF8F4]'
                        : 'border border-[#E6DFD3] bg-[#FAF8F4] text-[#4A4742] hover:border-[#111110]'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="cam-distance"
                  className="mb-1 block text-xs font-medium text-[#4A4742]"
                >
                  Дистанция съёмки
                </label>
                <input
                  id="cam-distance"
                  type="text"
                  value={studio.camera.distance}
                  onChange={(e) =>
                    onUpdateStudio((prev) => ({
                      ...prev,
                      camera: { ...prev.camera, distance: e.target.value },
                    }))
                  }
                  placeholder="Например: 3.5 meters"
                  className="w-full rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-3 py-2 text-xs text-[#111110] focus:border-[#111110] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="cam-comp"
                  className="mb-1 block text-xs font-medium text-[#4A4742]"
                >
                  Композиция
                </label>
                <input
                  id="cam-comp"
                  type="text"
                  value={studio.camera.composition}
                  onChange={(e) =>
                    onUpdateStudio((prev) => ({
                      ...prev,
                      camera: { ...prev.camera, composition: e.target.value },
                    }))
                  }
                  placeholder="Например: rule of thirds"
                  className="w-full rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-3 py-2 text-xs text-[#111110] focus:border-[#111110] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lighting' && (
          <div className="space-y-3.5">
            <div>
              <span className="mb-1.5 block text-xs font-medium text-[#4A4742]">
                Освещение
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {LIGHTING_OPTIONS.map((light) => (
                  <button
                    key={light}
                    type="button"
                    onClick={() =>
                      onUpdateStudio((prev) => ({
                        ...prev,
                        lightingBackground: {
                          ...prev.lightingBackground,
                          lighting: light,
                        },
                      }))
                    }
                    className={`rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors whitespace-nowrap shrink-0 truncate ${
                      studio.lightingBackground.lighting === light
                        ? 'bg-[#111110] text-[#FAF8F4]'
                        : 'border border-[#E6DFD3] bg-[#FAF8F4] text-[#4A4742] hover:border-[#111110]'
                    }`}
                  >
                    {LIGHTING_LABELS_RU[light]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-medium text-[#4A4742]">
                Фон
              </span>
              <div className="flex flex-wrap gap-1.5">
                {BACKGROUND_PRESETS.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() =>
                      onUpdateStudio((prev) => ({
                        ...prev,
                        lightingBackground: {
                          ...prev.lightingBackground,
                          backgroundPreset: bg,
                        },
                      }))
                    }
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      studio.lightingBackground.backgroundPreset === bg
                        ? 'bg-[#111110] text-[#FAF8F4]'
                        : 'border border-[#E6DFD3] bg-[#FAF8F4] text-[#4A4742] hover:border-[#111110]'
                    }`}
                  >
                    {BACKGROUND_LABELS_RU[bg]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="custom-background"
                className="mb-1 block text-xs font-medium text-[#4A4742]"
              >
                Свой фон{' '}
                <span className="font-normal text-[#767067]">
                  (дополняет или заменяет пресет в промпте)
                </span>
              </label>
              <input
                id="custom-background"
                type="text"
                value={studio.lightingBackground.customBackground}
                onChange={(e) =>
                  onUpdateStudio((prev) => ({
                    ...prev,
                    lightingBackground: {
                      ...prev.lightingBackground,
                      customBackground: e.target.value,
                    },
                  }))
                }
                placeholder="Например: travertine gallery staircase with warm morning sunbeams"
                className="w-full rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-3 py-2 text-xs text-[#111110] placeholder:text-[#9A9389] focus:border-[#111110] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* ГЕНЕРАТОР ИТОГОВОГО ПРОМПТА (всегда виден, текст промпта остаётся на английском) */}
      <div className="mt-5 border-t border-[#E6DFD3] pt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-semibold text-[#111110]">
              Генератор итогового промпта
            </h3>
            <p className="text-[11px] text-[#767067]">
              {isManualOverride
                ? 'Активно ручное редактирование · Нажмите «Пересобрать» для синхронизации'
                : 'Синхронизирован с позой, внешностью, образом, камерой и светом'}
            </p>
          </div>
        </div>

        <textarea
          aria-label="Сгенерированный итоговый промпт на английском"
          rows={9}
          value={activePrompt}
          onChange={(e) =>
            onUpdateStudio((prev) => ({
              ...prev,
              manualMasterPrompt: e.target.value,
            }))
          }
          className="w-full resize-y rounded-lg border border-[#D8CFC0] bg-[#FAF8F4] p-3 text-xs leading-relaxed text-[#111110] focus:border-[#111110] focus:bg-white focus:outline-none"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyMaster}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              copiedMaster
                ? 'bg-[#2C4A34] text-white'
                : 'bg-[#111110] text-[#FAF8F4] hover:bg-[#2A2825]'
            }`}
          >
            {copiedMaster ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Промпт скопирован
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Копировать промпт
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onRegenerateMasterPrompt}
            title="Пересобрать промпт из текущей позы и настроек студии"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8CFC0] bg-white px-3 py-2.5 text-xs font-medium text-[#111110] hover:border-[#111110] whitespace-nowrap shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Пересобрать
          </button>

          <button
            type="button"
            onClick={onResetStudioSettings}
            title="Сбросить настройки студии к базовым значениям"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-3 py-2.5 text-xs font-medium text-[#4A4742] hover:border-[#111110] hover:text-[#111110] whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Сбросить
          </button>
        </div>

        {/* Кнопки экспорта */}
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#EFEAE0] pt-3">
          <button
            type="button"
            onClick={onExportSelectedTxt}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-3 py-2 text-xs font-medium text-[#111110] hover:border-[#111110] hover:bg-[#F3EFE7] whitespace-nowrap shrink-0"
          >
            <FileText className="h-3.5 w-3.5 text-[#8C7355]" />
            Экспорт .TXT
          </button>

          <button
            type="button"
            onClick={onExportLibraryJson}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E6DFD3] bg-[#FAF8F4] px-3 py-2 text-xs font-medium text-[#111110] hover:border-[#111110] hover:bg-[#F3EFE7] whitespace-nowrap shrink-0"
          >
            <FileJson className="h-3.5 w-3.5 text-[#8C7355]" />
            Экспорт 81 JSON
          </button>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#767067]">
          <Download className="h-3 w-3 shrink-0" />
          <span>
            Все правки 81 позы и настройки студии сохраняются автоматически в LocalStorage.
          </span>
        </p>
      </div>
    </aside>
  );
};
