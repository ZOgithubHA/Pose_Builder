import { PoseCategory, PoseJoints } from '../types';
import { CATEGORY_SHORT_RU } from './i18nRu';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function renderProp(joints: PoseJoints): string {
  const { prop, wrists, head, hips } = joints;
  const [lwx, lwy, rwx, rwy] = wrists;
  const [hx, hy] = head;
  const [, , rhx, rhy] = hips;

  switch (prop) {
    case 'wall':
      return `
        <line x1="172" y1="24" x2="172" y2="294" stroke="#8C7355" stroke-width="1.8" />
        <rect x="172" y="24" width="44" height="270" fill="#EAE2D3" opacity="0.55" />
        <line x1="186" y1="36" x2="186" y2="282" stroke="#C5B393" stroke-width="0.8" stroke-dasharray="3 4" />
      `;
    case 'bench':
      return `
        <rect x="46" y="198" width="148" height="10" rx="2" fill="#D5C8B2" stroke="#1C1B19" stroke-width="1.4" />
        <line x1="62" y1="208" x2="58" y2="278" stroke="#1C1B19" stroke-width="2" />
        <line x1="178" y1="208" x2="182" y2="278" stroke="#1C1B19" stroke-width="2" />
        <line x1="58" y1="234" x2="182" y2="234" stroke="#8C7355" stroke-width="1" />
      `;
    case 'chair':
      return `
        <line x1="74" y1="126" x2="74" y2="202" stroke="#8C7355" stroke-width="2.2" />
        <rect x="74" y="198" width="88" height="8" rx="1.5" fill="#D5C8B2" stroke="#1C1B19" stroke-width="1.4" />
        <line x1="80" y1="206" x2="78" y2="278" stroke="#1C1B19" stroke-width="1.8" />
        <line x1="154" y1="206" x2="156" y2="278" stroke="#1C1B19" stroke-width="1.8" />
      `;
    case 'phone':
      return `
        <rect x="${rwx - 7}" y="${rwy - 16}" width="13" height="22" rx="2" fill="#1C1B19" stroke="#FAF8F4" stroke-width="0.9" />
        <rect x="${rwx - 5}" y="${rwy - 13}" width="9" height="15" rx="1" fill="#E8E1D3" />
      `;
    case 'sunglasses':
      return `
        <g transform="translate(${rwx - 10}, ${rwy - 6})">
          <rect x="0" y="0" width="9" height="6" rx="2" fill="#1C1B19" />
          <rect x="12" y="0" width="9" height="6" rx="2" fill="#1C1B19" />
          <line x1="9" y1="2" x2="12" y2="2" stroke="#1C1B19" stroke-width="1.3" />
        </g>
      `;
    case 'handbag':
      return `
        <path d="M ${lwx - 10} ${lwy + 6} Q ${lwx} ${lwy - 8} ${lwx + 10} ${lwy + 6}" fill="none" stroke="#1C1B19" stroke-width="1.5" />
        <rect x="${lwx - 14}" y="${lwy + 6}" width="28" height="24" rx="2" fill="#8C7355" stroke="#1C1B19" stroke-width="1.4" />
        <line x1="${lwx - 14}" y1="${lwy + 14}" x2="${lwx + 14}" y2="${lwy + 14}" stroke="#FAF8F4" stroke-width="0.9" />
      `;
    case 'hat':
      return `
        <ellipse cx="${hx}" cy="${hy - 12}" rx="24" ry="5" fill="#C5B393" stroke="#1C1B19" stroke-width="1.3" />
        <path d="M ${hx - 12} ${hy - 13} Q ${hx} ${hy - 28} ${hx + 12} ${hy - 13}" fill="#D8CCB7" stroke="#1C1B19" stroke-width="1.3" />
      `;
    case 'mirror':
      return `
        <rect x="158" y="42" width="44" height="232" rx="22" fill="#EAE2D3" opacity="0.48" stroke="#8C7355" stroke-width="1.4" />
        <line x1="168" y1="74" x2="192" y2="54" stroke="#FAF8F4" stroke-width="1.4" />
        <line x1="170" y1="84" x2="194" y2="64" stroke="#FAF8F4" stroke-width="0.9" />
      `;
    case 'steps':
      return `
        <path d="M 38 278 L 38 254 L 84 254 L 84 230 L 146 230 L 146 278 Z" fill="#EAE2D3" stroke="#8C7355" stroke-width="1.2" />
      `;
    case 'column':
      return `
        <rect x="44" y="28" width="24" height="252" fill="#E6DFD2" stroke="#8C7355" stroke-width="1.2" />
        <line x1="52" y1="28" x2="52" y2="280" stroke="#C5B393" stroke-width="0.8" />
        <line x1="60" y1="28" x2="60" y2="280" stroke="#C5B393" stroke-width="0.8" />
      `;
    case 'coat':
      return `
        <path d="M ${rwx - 6} ${rwy} Q ${rwx + 18} ${rwy + 30} ${rwx + 10} ${rwy + 88} L ${rwx - 16} ${rwy + 82} Z" fill="#C5B393" opacity="0.7" stroke="#1C1B19" stroke-width="1.2" />
      `;
    case 'coffee':
      return `
        <rect x="${lwx - 5}" y="${lwy - 10}" width="11" height="14" rx="1.5" fill="#FAF8F4" stroke="#1C1B19" stroke-width="1.3" />
        <line x1="${lwx - 6}" y1="${lwy - 10}" x2="${lwx + 6}" y2="${lwy - 10}" stroke="#1C1B19" stroke-width="2" />
      `;
    case 'magazine':
      return `
        <polygon points="${lwx - 12},${lwy - 8} ${lwx + 12},${lwy - 12} ${lwx + 14},${lwy + 14} ${lwx - 10},${lwy + 18}" fill="#FAF8F4" stroke="#1C1B19" stroke-width="1.3" />
        <line x1="${lwx - 7}" y1="${lwy}" x2="${lwx + 8}" y2="${lwy - 3}" stroke="#8C7355" stroke-width="1" />
      `;
    case 'umbrella':
      return `
        <line x1="${rwx}" y1="${rwy - 56}" x2="${rwx}" y2="${rwy + 18}" stroke="#1C1B19" stroke-width="1.5" />
        <path d="M ${rwx - 44} ${rwy - 48} Q ${rwx} ${rwy - 84} ${rwx + 44} ${rwy - 48} Z" fill="#C5B393" opacity="0.75" stroke="#1C1B19" stroke-width="1.3" />
      `;
    case 'scarf':
      return `
        <path d="M ${hx - 12} ${hy + 18} Q ${hx} ${hy + 26} ${hx + 14} ${hy + 18} Q ${hx + 28} ${hy + 44} ${hx + 34} ${hy + 82}" fill="none" stroke="#8C7355" stroke-width="6" stroke-linecap="round" opacity="0.65" />
      `;
    case 'camera':
      return `
        <rect x="${rwx - 12}" y="${rwy - 8}" width="22" height="14" rx="2" fill="#1C1B19" />
        <circle cx="${rwx - 1}" cy="${rwy - 1}" r="4.5" fill="#FAF8F4" stroke="#8C7355" stroke-width="1.2" />
      `;
    case 'railing':
      return `
        <line x1="34" y1="162" x2="206" y2="162" stroke="#8C7355" stroke-width="2.4" />
        <line x1="56" y1="162" x2="56" y2="280" stroke="#C5B393" stroke-width="1.4" />
        <line x1="184" y1="162" x2="184" y2="280" stroke="#C5B393" stroke-width="1.4" />
      `;
    default:
      if (rhx > 0 && rhy > 0) return '';
      return '';
  }
}

function renderGazeCue(joints: PoseJoints): string {
  const [hx, hy] = joints.head;
  switch (joints.gaze) {
    case 'left':
      return `<circle cx="${hx - 4}" cy="${hy - 1}" r="1.4" fill="#141413" /><line x1="${hx - 10}" y1="${hy - 1}" x2="${hx - 20}" y2="${hy - 1}" stroke="#8C7355" stroke-width="0.9" stroke-dasharray="2 2" />`;
    case 'right':
      return `<circle cx="${hx + 4}" cy="${hy - 1}" r="1.4" fill="#141413" /><line x1="${hx + 10}" y1="${hy - 1}" x2="${hx + 20}" y2="${hy - 1}" stroke="#8C7355" stroke-width="0.9" stroke-dasharray="2 2" />`;
    case 'up':
      return `<circle cx="${hx}" cy="${hy - 4}" r="1.3" fill="#141413" /><line x1="${hx}" y1="${hy - 16}" x2="${hx}" y2="${hy - 26}" stroke="#8C7355" stroke-width="0.9" stroke-dasharray="2 2" />`;
    case 'down':
      return `<circle cx="${hx}" cy="${hy + 4}" r="1.3" fill="#141413" />`;
    case 'away':
      return `<path d="M ${hx - 5} ${hy - 2} Q ${hx} ${hy + 2} ${hx + 5} ${hy - 2}" fill="none" stroke="#8C7355" stroke-width="1" />`;
    default:
      return `<circle cx="${hx - 3.2}" cy="${hy - 1}" r="1.15" fill="#141413" /><circle cx="${hx + 3.2}" cy="${hy - 1}" r="1.15" fill="#141413" />`;
  }
}

function renderFramingReticle(framing: PoseJoints['framing']): string {
  if (framing === 'close') {
    return `
      <rect x="44" y="28" width="152" height="152" fill="none" stroke="#8C7355" stroke-width="0.9" stroke-dasharray="4 3" opacity="0.8" />
    `;
  }
  if (framing === 'medium') {
    return `
      <rect x="38" y="26" width="164" height="186" fill="none" stroke="#8C7355" stroke-width="0.9" stroke-dasharray="4 3" opacity="0.75" />
    `;
  }
  if (framing === 'three-quarter') {
    return `
      <rect x="34" y="24" width="172" height="218" fill="none" stroke="#8C7355" stroke-width="0.9" stroke-dasharray="4 3" opacity="0.7" />
    `;
  }
  return '';
}

export function generatePoseReferenceSvg(
  id: number,
  title: string,
  category: PoseCategory,
  joints: PoseJoints
): string {
  const [hx, hy] = joints.head;
  const [lsx, lsy, rsx, rsy] = joints.shoulders;
  const [lex, ley, rex, rey] = joints.elbows;
  const [lwx, lwy, rwx, rwy] = joints.wrists;
  const [wx, wy] = joints.waist;
  const [lhx, lhy, rhx, rhy] = joints.hips;
  const [lkx, lky, rkx, rky] = joints.knees;
  const [lax, lay, rax, ray] = joints.ankles;

  const neckX = (lsx + rsx) / 2;
  const neckY = (lsy + rsy) / 2 - 4;
  const paddedId = String(id).padStart(2, '0');
  const headTilt = joints.headTilt ?? 0;

  // Garment drape fill path based on silhouette
  const coatExtend = joints.silhouette === 'gown' ? 46 : joints.silhouette === 'coat' || joints.silhouette === 'trench' ? 32 : 12;
  const hemLeftX = joints.silhouette === 'gown' ? Math.min(lhx, lax) - 10 : lhx - 7;
  const hemRightX = joints.silhouette === 'gown' ? Math.max(rhx, rax) + 10 : rhx + 7;
  const hemY = Math.min(276, Math.max(lhy, rhy) + coatExtend);

  const torsoDrape =
    joints.silhouette === 'gown' || joints.silhouette === 'coat' || joints.silhouette === 'trench'
      ? `<path d="M ${lsx} ${lsy} L ${rsx} ${rsy} L ${wx + 9} ${wy} L ${hemRightX} ${hemY} Q ${(hemLeftX + hemRightX) / 2} ${hemY + 5} ${hemLeftX} ${hemY} L ${wx - 9} ${wy} Z" fill="#DFD4C0" opacity="0.82" stroke="#1C1B19" stroke-width="1.35" stroke-linejoin="round" />`
      : `<path d="M ${lsx} ${lsy} L ${rsx} ${rsy} L ${wx + 9} ${wy} L ${rhx} ${rhy} L ${lhx} ${lhy} L ${wx - 9} ${wy} Z" fill="#DFD4C0" opacity="0.85" stroke="#1C1B19" stroke-width="1.35" stroke-linejoin="round" />`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 320" width="240" height="320">
  <defs>
    <linearGradient id="paper-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FAF7F1" />
      <stop offset="100%" stop-color="#F1EAE0" />
    </linearGradient>
  </defs>
  <rect width="240" height="320" fill="url(#paper-${id})" />
  <rect x="8" y="8" width="224" height="304" fill="none" stroke="#DFD6C7" stroke-width="1" />

  <!-- Studio Floor / Horizon -->
  <line x1="24" y1="278" x2="216" y2="278" stroke="#D2C7B4" stroke-width="1" />
  <ellipse cx="${(lax + rax) / 2}" cy="280" rx="28" ry="4.5" fill="#D5C8B2" opacity="0.6" />

  <!-- Architectural / Styling Prop -->
  ${renderProp(joints)}

  <!-- Framing Guide -->
  ${renderFramingReticle(joints.framing)}

  <!-- Lower Body / Legs -->
  <g stroke="#1C1B19" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M ${lhx} ${lhy} L ${lkx} ${lky} L ${lax} ${lay}" />
    <path d="M ${rhx} ${rhy} L ${rkx} ${rky} L ${rax} ${ray}" />
    <!-- Editorial Footwear Strokes -->
    <line x1="${lax}" y1="${lay}" x2="${lax - 7}" y2="${lay + 3}" stroke-width="2.4" />
    <line x1="${rax}" y1="${ray}" x2="${rax + 7}" y2="${ray + 3}" stroke-width="2.4" />
  </g>

  <!-- Tailored Torso / Garment Silhouette -->
  ${torsoDrape}
  <line x1="${wx - 8}" y1="${wy}" x2="${wx + 8}" y2="${wy}" stroke="#8C7355" stroke-width="1" />

  <!-- Neck & Collar -->
  <line x1="${neckX}" y1="${neckY + 5}" x2="${hx}" y2="${hy + 11}" stroke="#1C1B19" stroke-width="2.8" stroke-linecap="round" />

  <!-- Arms & Hands -->
  <g stroke="#1C1B19" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M ${lsx} ${lsy} L ${lex} ${ley} L ${lwx} ${lwy}" />
    <path d="M ${rsx} ${rsy} L ${rex} ${rey} L ${rwx} ${rwy}" />
  </g>
  <circle cx="${lwx}" cy="${lwy}" r="2.2" fill="#1C1B19" />
  <circle cx="${rwx}" cy="${rwy}" r="2.2" fill="#1C1B19" />

  <!-- Head & Editorial Gaze -->
  <g transform="rotate(${headTilt}, ${hx}, ${hy})">
    <ellipse cx="${hx}" cy="${hy}" rx="10.5" ry="13.5" fill="#F8F4EC" stroke="#1C1B19" stroke-width="1.8" />
    <path d="M ${hx - 10} ${hy - 3} Q ${hx} ${hy - 18} ${hx + 10} ${hy - 3}" fill="#1C1B19" />
    ${renderGazeCue(joints)}
  </g>

  <!-- Editorial Plate Caption -->
  <text x="18" y="25" font-family="Georgia, serif" font-size="11" font-weight="600" fill="#141413" letter-spacing="0.06em">№ ${paddedId}</text>
  <text x="222" y="25" text-anchor="end" font-family="sans-serif" font-size="7.5" fill="#767067" letter-spacing="0.06em">${escapeXml(CATEGORY_SHORT_RU[category])}</text>
  <text x="18" y="301" font-family="Georgia, serif" font-size="9.2" fill="#4A4742">${escapeXml(title.slice(0, 30))}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
