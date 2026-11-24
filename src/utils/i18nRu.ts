import {
  BackgroundPreset,
  CameraAngle,
  LensOption,
  LightingOption,
  PoseCategory,
  ShotType,
} from '../types';

export const CATEGORY_LABELS_RU: Record<PoseCategory, string> = {
  'Standing & Editorial': 'Стоя и эдиториал',
  'Walking & Motion': 'В движении',
  'Seated & Lounge': 'Сидя и лаунж',
  'Portrait & Upper Body': 'Портрет и верхний план',
  'Architectural & Leaning': 'Архитектура и опора',
  'Props & Styling': 'Реквизит и стайлинг',
  'Runway & Dynamic': 'Подиум и динамика',
};

export const CATEGORY_SHORT_RU: Record<PoseCategory, string> = {
  'Standing & Editorial': 'ЭДИТОРИАЛ',
  'Walking & Motion': 'ДВИЖЕНИЕ',
  'Seated & Lounge': 'СИДЯ',
  'Portrait & Upper Body': 'ПОРТРЕТ',
  'Architectural & Leaning': 'АРХИТЕКТУРА',
  'Props & Styling': 'СТАЙЛИНГ',
  'Runway & Dynamic': 'ПОДИУМ',
};

export const CAMERA_ANGLE_LABELS_RU: Record<CameraAngle, string> = {
  'eye level': 'На уровне глаз',
  'low angle': 'Нижний ракурс',
  'high angle': 'Верхний ракурс',
  overhead: 'Вид сверху',
  'side angle': 'Боковой ракурс',
  'front angle': 'Фронтальный ракурс',
};

export const SHOT_TYPE_LABELS_RU: Record<ShotType, string> = {
  'close-up': 'Крупный план',
  medium: 'Средний план',
  'three-quarter': 'Поколенный (3/4)',
  'full body': 'В полный рост',
};

export const LENS_LABELS_RU: Record<LensOption, string> = {
  '35mm': '35 мм',
  '50mm': '50 мм',
  '85mm': '85 мм',
  '105mm': '105 мм',
};

export const LIGHTING_LABELS_RU: Record<LightingOption, string> = {
  'Soft studio': 'Мягкий студийный',
  'Beauty lighting': 'Бьюти-свет',
  'Rembrandt lighting': 'Рембрандтовский свет',
  'Golden hour': 'Золотой час',
  'Cinematic lighting': 'Кинематографичный',
  'Natural daylight': 'Естественный дневной',
};

export const BACKGROUND_LABELS_RU: Record<BackgroundPreset, string> = {
  'White studio': 'Белая студия',
  'Luxury interior': 'Люксовый интерьер',
  'Urban street': 'Городская улица',
  Nature: 'Природа',
  Custom: 'Свой фон',
};
