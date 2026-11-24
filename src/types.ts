export type PoseCategory =
  | 'Standing & Editorial'
  | 'Walking & Motion'
  | 'Seated & Lounge'
  | 'Portrait & Upper Body'
  | 'Architectural & Leaning'
  | 'Props & Styling'
  | 'Runway & Dynamic';

export type PromptStatus = 'newly_authored' | 'edited';

export type PropType =
  | 'none'
  | 'wall'
  | 'bench'
  | 'chair'
  | 'phone'
  | 'sunglasses'
  | 'handbag'
  | 'hat'
  | 'mirror'
  | 'steps'
  | 'column'
  | 'coat'
  | 'coffee'
  | 'magazine'
  | 'umbrella'
  | 'scarf'
  | 'camera'
  | 'railing';

export interface PoseJoints {
  head: [number, number];
  headTilt?: number;
  shoulders: [number, number, number, number]; // lx, ly, rx, ry
  elbows: [number, number, number, number];
  wrists: [number, number, number, number];
  waist: [number, number];
  hips: [number, number, number, number];
  knees: [number, number, number, number];
  ankles: [number, number, number, number];
  prop?: PropType;
  silhouette?: 'coat' | 'gown' | 'blazer' | 'trench' | 'suit' | 'slip';
  framing?: 'full' | 'three-quarter' | 'medium' | 'close';
  gaze?: 'camera' | 'left' | 'right' | 'up' | 'down' | 'away';
}

export interface PoseEntry {
  id: number;
  title: string;
  titleRu: string;
  descriptionRu: string;
  titleUz: string;
  descriptionUz: string;
  category: PoseCategory;
  referenceImage: string;
  prompt: string;
  promptStatus: PromptStatus;
  favorite: boolean;
}

export interface CharacterReferenceState {
  imageDataUrl: string | null;
  fileName: string | null;
  identityLock: boolean;
  notes: string;
}

export interface FashionSettings {
  outfitDescription: string;
  clothingStyle: string;
  shoes: string;
  accessories: string;
  handbag: string;
  jewelry: string;
}

export type CameraAngle =
  | 'eye level'
  | 'low angle'
  | 'high angle'
  | 'overhead'
  | 'side angle'
  | 'front angle';

export type ShotType = 'close-up' | 'medium' | 'three-quarter' | 'full body';

export type LensOption = '35mm' | '50mm' | '85mm' | '105mm';

export type AspectRatioOption = '2:3' | '3:4' | '4:5' | '9:16' | '1:1';

export interface CameraSettings {
  angle: CameraAngle;
  shotType: ShotType;
  lens: LensOption;
  distance: string;
  composition: string;
  aspectRatio: AspectRatioOption;
}

export type LightingOption =
  | 'Soft studio'
  | 'Beauty lighting'
  | 'Rembrandt lighting'
  | 'Golden hour'
  | 'Cinematic lighting'
  | 'Natural daylight';

export type BackgroundPreset =
  | 'White studio'
  | 'Luxury interior'
  | 'Urban street'
  | 'Nature'
  | 'Custom';

export interface LightingBackgroundSettings {
  lighting: LightingOption;
  backgroundPreset: BackgroundPreset;
  customBackground: string;
}

export interface StudioState {
  selectedPoseId: number;
  character: CharacterReferenceState;
  fashion: FashionSettings;
  camera: CameraSettings;
  lightingBackground: LightingBackgroundSettings;
  manualMasterPrompt: string | null;
}

export type ViewMode = 'grid' | 'list';
export type StatusFilter = 'all' | 'newly_authored' | 'edited' | 'favorites';
