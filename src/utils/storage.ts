import { INITIAL_POSES } from '../data/poses';
import { PoseEntry, PromptStatus, StudioState, ViewMode } from '../types';

const STORAGE_KEYS = {
  POSE_OVERRIDES: 'afpb_pose_overrides_v1',
  STUDIO_STATE: 'afpb_studio_state_v1',
  VIEW_MODE: 'afpb_view_mode_v1',
};

export interface PoseOverride {
  prompt: string;
  promptStatus: PromptStatus;
  favorite: boolean;
}

export const DEFAULT_STUDIO_STATE: StudioState = {
  selectedPoseId: 1,
  character: {
    imageDataUrl: null,
    fileName: null,
    identityLock: true,
    notes: '',
  },
  fashion: {
    outfitDescription: 'tailored warm-sand wool double-breasted blazer over silk ivory slip dress',
    clothingStyle: 'Minimalist Quiet Luxury',
    shoes: 'pointed leather slingback heels',
    accessories: 'none',
    handbag: 'structured matte calfskin top-handle bag',
    jewelry: 'sculptural brushed-gold hoop earrings',
  },
  camera: {
    angle: 'eye level',
    shotType: 'full body',
    lens: '85mm',
    distance: '3.5 meters',
    composition: 'rule of thirds',
    aspectRatio: '3:4',
  },
  lightingBackground: {
    lighting: 'Soft studio',
    backgroundPreset: 'White studio',
    customBackground: '',
  },
  manualMasterPrompt: null,
};

export function loadPosesFromStorage(): PoseEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POSE_OVERRIDES);
    if (!raw) return INITIAL_POSES;
    const overrides = JSON.parse(raw) as Record<string, PoseOverride>;
    return INITIAL_POSES.map((pose) => {
      const override = overrides[String(pose.id)];
      if (!override) return pose;
      return {
        ...pose,
        prompt: typeof override.prompt === 'string' ? override.prompt : pose.prompt,
        promptStatus:
          override.promptStatus === 'edited' ? 'edited' : pose.promptStatus,
        favorite: Boolean(override.favorite),
      };
    });
  } catch {
    return INITIAL_POSES;
  }
}

export function savePosesToStorage(poses: PoseEntry[]): void {
  try {
    const overrides: Record<string, PoseOverride> = {};
    for (const pose of poses) {
      const initial = INITIAL_POSES.find((p) => p.id === pose.id);
      const isModified =
        pose.prompt !== initial?.prompt ||
        pose.promptStatus !== initial?.promptStatus ||
        pose.favorite !== initial?.favorite;

      if (isModified) {
        overrides[String(pose.id)] = {
          prompt: pose.prompt,
          promptStatus: pose.promptStatus,
          favorite: pose.favorite,
        };
      }
    }
    localStorage.setItem(STORAGE_KEYS.POSE_OVERRIDES, JSON.stringify(overrides));
  } catch {
    // Ignore quota errors gracefully
  }
}

export function loadStudioState(): StudioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDIO_STATE);
    if (!raw) return DEFAULT_STUDIO_STATE;
    const parsed = JSON.parse(raw) as Partial<StudioState>;
    return {
      selectedPoseId:
        typeof parsed.selectedPoseId === 'number' &&
        parsed.selectedPoseId >= 1 &&
        parsed.selectedPoseId <= 81
          ? parsed.selectedPoseId
          : DEFAULT_STUDIO_STATE.selectedPoseId,
      character: {
        ...DEFAULT_STUDIO_STATE.character,
        ...(parsed.character ?? {}),
      },
      fashion: {
        ...DEFAULT_STUDIO_STATE.fashion,
        ...(parsed.fashion ?? {}),
      },
      camera: {
        ...DEFAULT_STUDIO_STATE.camera,
        ...(parsed.camera ?? {}),
      },
      lightingBackground: {
        ...DEFAULT_STUDIO_STATE.lightingBackground,
        ...(parsed.lightingBackground ?? {}),
      },
      manualMasterPrompt:
        typeof parsed.manualMasterPrompt === 'string' ? parsed.manualMasterPrompt : null,
    };
  } catch {
    return DEFAULT_STUDIO_STATE;
  }
}

export function saveStudioState(state: StudioState): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDIO_STATE, JSON.stringify(state));
    return true;
  } catch {
    // If character data URL exceeds quota, retry without imageDataUrl so settings still save
    try {
      const fallback: StudioState = {
        ...state,
        character: {
          ...state.character,
          imageDataUrl: null,
        },
      };
      localStorage.setItem(STORAGE_KEYS.STUDIO_STATE, JSON.stringify(fallback));
    } catch {
      // Ignore
    }
    return false;
  }
}

export function loadViewMode(): ViewMode {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    return val === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
}

export function saveViewMode(mode: ViewMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
  } catch {
    // Ignore
  }
}

export function clearAllStoredData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.POSE_OVERRIDES);
    localStorage.removeItem(STORAGE_KEYS.STUDIO_STATE);
    localStorage.removeItem(STORAGE_KEYS.VIEW_MODE);
  } catch {
    // Ignore
  }
}

// Downscale uploaded character portrait cleanly so it fits reliably in LocalStorage
export function resizeImageFileToDataUrl(file: File, maxDimension = 720): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onerror = () => resolve(src);
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
