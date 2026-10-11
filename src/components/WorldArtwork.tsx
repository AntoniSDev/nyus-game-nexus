import { useId } from "react";
import { GenreMotif } from "./GenreMotif";

export function worldTheme(category: string) {
  const name = category.toLocaleLowerCase();
  if (/survie/.test(name)) return 0;
  if (/usine|automatisation/.test(name)) return 1;
  if (/farm|build/.test(name)) return 2;
  if (/exploration|colonie/.test(name)) return 3;
  if (/fps/.test(name)) return 4;
  if (/chill|détente/.test(name)) return 5;
  if (/jrpg|aventure/.test(name)) return 6;
  if (/souls|action-rpg/.test(name)) return 7;
  return [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 8;
}
export const worldCaptions = [
  "Sous les étoiles",
  "Tout se met en mouvement",
  "Éclats de puissance",
  "Au-delà de l’horizon",
  "L’étincelle de l’aventure",
  "Une parenthèse douce",
  "L’appel du voyage",
  "Entre ombre et braise",
];
const palettes = [
  ["#182e38", "#294c50", "#84d5b7"],
  ["#332a46", "#514165", "#e7b1db"],
  ["#292444", "#453468", "#bca3f5"],
  ["#1b3242", "#335c69", "#91d5db"],
  ["#352637", "#613b52", "#eea7b7"],
  ["#2d2b48", "#5a496b", "#efbfdc"],
  ["#282640", "#544165", "#ddc2f5"],
  ["#2d293e", "#504058", "#f0bed1"],
];

/** Decorative genre landscapes, never presented as actual game covers. */
export function WorldArtwork({ theme }: { theme: number }) {
  const id = useId();
  const [sky, hill, light] = palettes[theme];
  return (
    <svg
      className="world-artwork"
      viewBox="0 0 360 240"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1">
          <stop stopColor={sky} />
          <stop offset="1" stopColor={hill} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop stopColor={light} stopOpacity=".22" />
          <stop offset="1" stopColor={light} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path fill={`url(#${id}-sky)`} d="M0 0h360v240H0z" />
      <ellipse cx="190" cy="103" rx="133" ry="106" fill={`url(#${id}-glow)`} />
      <circle cx="181" cy="104" r="71" stroke={light} strokeOpacity=".15" />
      <circle
        cx="181"
        cy="104"
        r="80"
        stroke={light}
        strokeOpacity=".1"
        strokeDasharray="2 8"
      />
      <g fill={light}>
        {[
          [40, 60],
          [74, 102],
          [123, 38],
          [278, 56],
          [311, 109],
          [250, 31],
          [102, 137],
          [234, 74],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 3 === 0 ? 1.8 : 1}
            opacity=".65"
          />
        ))}
      </g>
      <path
        d="m278 93 3-9 3 9 9 3-9 3-3 9-3-9-9-3Z"
        fill={light}
        opacity=".8"
      />
      <path d="M0 173q43-28 93 0t90 1 90-1 87-5v72H0Z" fill={hill} />
      <path d="M0 210q69-32 155-8t205-15v53H0Z" fill={sky} opacity=".65" />
      <GenreMotif theme={theme} sky={sky} hill={hill} light={light} />
      <path
        d="M14 31v-16h16m300 0h16v16M14 210v16h16m300 0h16v-16"
        stroke={light}
        strokeOpacity=".25"
      />
    </svg>
  );
}
