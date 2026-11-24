import {
  CameraSettings,
  CharacterReferenceState,
  FashionSettings,
  LightingBackgroundSettings,
  PoseEntry,
  StudioState,
} from '../types';
import {
  BACKGROUND_LABELS_RU,
  CAMERA_ANGLE_LABELS_RU,
  CATEGORY_LABELS_RU,
  LIGHTING_LABELS_RU,
  SHOT_TYPE_LABELS_RU,
} from './i18nRu';

const BACKGROUND_DESCRIPTIONS: Record<string, string> = {
  'White studio':
    'seamless matte warm-white cyclorama photography studio with subtle natural floor shadow',
  'Luxury interior':
    'opulent European architectural interior with travertine stone walls, arched daylight windows, and refined minimalist furniture',
  'Urban street':
    'quiet cobblestone Parisian fashion avenue with limestone facades and soft architectural depth',
  Nature:
    'minimalist coastal limestone cliffs and tall golden meadow grass under open sky',
};

const LIGHTING_DESCRIPTIONS: Record<string, string> = {
  'Soft studio':
    'soft diffused octabox studio lighting with gentle wrap-around tonal transitions and clean catchlights',
  'Beauty lighting':
    'crisp beauty dish key light with balanced silver reflector fill, luminous skin micro-contrast, and soft shadow falloff',
  'Rembrandt lighting':
    'sculpted Rembrandt studio lighting creating a delicate triangular highlight on the shadowed cheek and dramatic editorial depth',
  'Golden hour':
    'warm low-angle golden hour sunlight casting long sculptural shadows and rich amber rim glow',
  'Cinematic lighting':
    'moody cinematic directional lighting with subtle atmospheric haze, rich highlight roll-off, and editorial shadow contrast',
  'Natural daylight':
    'clean directional natural window daylight with true-to-life color rendition and airy organic highlights',
};

export function buildIdentityLockClause(character: CharacterReferenceState): string {
  if (!character.identityLock) {
    return '';
  }

  const refMention = character.imageDataUrl
    ? 'Use the attached character reference image as the primary subject guide. '
    : '';

  const customNotes = character.notes.trim()
    ? ` Additional character notes: ${character.notes.trim()}.`
    : '';

  return `${refMention}Identity lock directive: maintain consistent facial identity, face shape, eyes, nose, lips, skin tone, hairstyle, and distinctive features from the character reference across the frame.${customNotes}`;
}

export function buildFashionClause(fashion: FashionSettings): string {
  const parts: string[] = [];

  if (fashion.outfitDescription.trim()) {
    parts.push(`wearing ${fashion.outfitDescription.trim()}`);
  }
  if (fashion.clothingStyle.trim()) {
    parts.push(`${fashion.clothingStyle.trim()} styling`);
  }
  if (fashion.shoes.trim() && fashion.shoes !== 'None') {
    parts.push(`paired with ${fashion.shoes.trim()}`);
  }
  if (fashion.handbag.trim() && fashion.handbag !== 'None') {
    parts.push(`carrying ${fashion.handbag.trim()}`);
  }
  if (fashion.accessories.trim() && fashion.accessories !== 'None') {
    parts.push(`accented with ${fashion.accessories.trim()}`);
  }
  if (fashion.jewelry.trim() && fashion.jewelry !== 'None') {
    parts.push(`finished with ${fashion.jewelry.trim()}`);
  }

  return parts.length > 0 ? `Fashion & styling: ${parts.join(', ')}.` : '';
}

export function buildCameraClause(camera: CameraSettings): string {
  const specs = [
    `${camera.shotType} framing`,
    `${camera.angle} camera angle`,
    `${camera.lens} prime editorial lens`,
    camera.distance ? `camera distance ${camera.distance}` : '',
    camera.composition ? `${camera.composition} composition` : '',
    `aspect ratio ${camera.aspectRatio}`,
  ].filter(Boolean);

  return `Camera & composition: ${specs.join(', ')}.`;
}

export function buildLightingBackgroundClause(lb: LightingBackgroundSettings): string {
  const lightingText = LIGHTING_DESCRIPTIONS[lb.lighting] ?? lb.lighting;
  const bgText =
    lb.backgroundPreset === 'Custom'
      ? lb.customBackground.trim() || 'custom minimalist editorial environment'
      : lb.customBackground.trim()
      ? `${BACKGROUND_DESCRIPTIONS[lb.backgroundPreset] ?? lb.backgroundPreset}, ${lb.customBackground.trim()}`
      : BACKGROUND_DESCRIPTIONS[lb.backgroundPreset] ?? lb.backgroundPreset;

  return `Lighting & setting: ${lightingText}; set in a ${bgText}.`;
}

export function buildMasterPrompt(pose: PoseEntry, studio: StudioState): string {
  const sections: string[] = [];

  sections.push(
    `High-fashion luxury editorial photograph — Pose #${String(pose.id).padStart(2, '0')}: ${pose.title}.`
  );

  const identity = buildIdentityLockClause(studio.character);
  if (identity) {
    sections.push(identity);
  }

  sections.push(`Pose direction: ${pose.prompt.trim()}`);

  const fashion = buildFashionClause(studio.fashion);
  if (fashion) {
    sections.push(fashion);
  }

  sections.push(buildCameraClause(studio.camera));
  sections.push(buildLightingBackgroundClause(studio.lightingBackground));

  sections.push(
    'Editorial finish: natural skin texture, authentic fabric drape and weave detail, refined magazine color grading, sharp focus on subject, zero artificial distortion.'
  );

  return sections.join('\n\n');
}

export function formatPromptTxtExport(
  pose: PoseEntry,
  studio: StudioState,
  finalPrompt: string
): string {
  const statusLabel =
    pose.promptStatus === 'edited'
      ? 'Отредактирован пользователем'
      : 'Новый авторский черновик (не исторический текст)';

  return [
    'КОНСТРУКТОР МОДНЫХ ПОЗ AI — ЭКСПОРТ ПРОМПТА',
    '==========================================',
    `Номер позы       : № ${String(pose.id).padStart(2, '0')}`,
    `Название         : ${pose.titleRu}`,
    `Категория        : ${CATEGORY_LABELS_RU[pose.category]}`,
    `Описание         : ${pose.descriptionRu}`,
    `Статус промпта   : ${statusLabel}`,
    `Фиксация лица    : ${studio.character.identityLock ? 'Включена' : 'Отключена'}`,
    `Камера           : ${SHOT_TYPE_LABELS_RU[studio.camera.shotType]} | ${CAMERA_ANGLE_LABELS_RU[studio.camera.angle]} | ${studio.camera.lens} | ${studio.camera.aspectRatio}`,
    `Освещение        : ${LIGHTING_LABELS_RU[studio.lightingBackground.lighting]}`,
    `Фон              : ${
      studio.lightingBackground.backgroundPreset === 'Custom'
        ? studio.lightingBackground.customBackground || 'Свой фон'
        : BACKGROUND_LABELS_RU[studio.lightingBackground.backgroundPreset]
    }`,
    '',
    'ИТОГОВЫЙ ПРОМПТ (ENGLISH):',
    '--------------------------',
    finalPrompt,
    '',
    'ПРИМЕЧАНИЕ О ФИКСАЦИИ ВНЕШНОСТИ:',
    'Текстовый промпт сам по себе не гарантирует 100% портретное сходство во всех генераторах изображений. Всегда прикрепляйте референс персонажа в поле Face Reference / IP-Adapter вашего генератора.',
  ].join('\n');
}

export function triggerFileDownload(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
