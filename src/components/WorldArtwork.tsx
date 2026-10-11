import { useId } from "react";

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
  "Un peu d’alchimie",
  "Éclats de puissance",
  "Au-delà de l’horizon",
  "L’étincelle de l’aventure",
  "Une parenthèse douce",
  "Il était un monde",
  "La voie des étoiles",
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
      {theme === 0 && (
        <g>
          <path d="M211 49a24 24 0 0 0 27 28 26 26 0 1 1-27-28Z" fill={light} />
          {[58, 91, 277, 305].map((x, i) => (
            <g key={x} transform={`translate(${x} ${125 + (i % 2) * 20})`}>
              <path
                d="m0-45-20 33h10l-18 28h56L10-12h10Z"
                fill={sky}
                stroke={light}
                strokeOpacity=".15"
              />
              <path d="M0 16v15" stroke={light} strokeOpacity=".3" />
            </g>
          ))}
          <path
            d="m144 166 38-31 38 31v31h-76Z"
            fill={sky}
            stroke={light}
            strokeOpacity=".5"
          />
          <path d="m137 169 45-40 45 40" stroke={light} strokeWidth="2" />
          <path d="M170 167h23v17h-23z" fill={light} opacity=".7" />
          <path d="M155 162v29m52-29v29" stroke={light} strokeOpacity=".2" />
        </g>
      )}
      {theme === 1 && (
        <g>
          <path
            d="M151 81h57m-46 0v31l-30 56q-7 15 10 18h72q17-3 10-18l-29-56V81"
            stroke={light}
            strokeWidth="2"
          />
          <path
            d="m151 141-15 28q-5 9 7 12h70q12-3 7-12l-14-28q-26 12-55 0Z"
            fill={light}
            opacity=".45"
          />
          <circle cx="168" cy="162" r="4" fill={light} />
          <circle cx="191" cy="151" r="2" fill={light} />
          <path
            d="m236 110 15-25 15 25-15 25Zm-128 26 9-17 9 17-9 17Z"
            fill={light}
            opacity=".7"
          />
          <path
            d="M151 197h63m-47-130 6-9m19 9-4-9"
            stroke={light}
            strokeOpacity=".5"
            strokeLinecap="round"
          />
        </g>
      )}
      {theme === 2 && (
        <g>
          <path
            d="m179 63 26 38-26 57-26-57Z"
            fill={light}
            fillOpacity=".35"
            stroke={light}
          />
          <path d="m179 63 1 95m-27-57h52" stroke={light} strokeOpacity=".6" />
          <path
            d="m116 149 14-26 14 26-14 39Zm110 0 17-33 17 33-17 43Z"
            fill={light}
            fillOpacity=".4"
            stroke={light}
            strokeOpacity=".6"
          />
          <ellipse
            cx="181"
            cy="187"
            rx="67"
            ry="15"
            stroke={light}
            strokeOpacity=".45"
          />
          <path
            d="M154 187h52m-41-16 14 32 16-32"
            stroke={light}
            strokeOpacity=".4"
          />
          <path d="m107 75 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z" fill={light} />
        </g>
      )}
      {theme === 3 && (
        <g>
          <circle cx="234" cy="68" r="20" fill={light} opacity=".75" />
          <path
            d="m102 155 79-28 76 28-72 57Z"
            fill={sky}
            stroke={light}
            strokeOpacity=".4"
          />
          <path
            d="m102 155 80 18 75-18-76-28Z"
            fill={hill}
            stroke={light}
            strokeOpacity=".5"
          />
          <path
            d="M137 154v-32l20-15 20 15v39m18-5v-23l17-12 17 12v20"
            fill={sky}
            stroke={light}
            strokeOpacity=".7"
          />
          <path d="M150 135h11v12h-11Zm54 0h9v9h-9Z" fill={light} />
          <path
            d="m126 150-6-26m-7 8 7-11 8 11"
            stroke={light}
            strokeOpacity=".6"
          />
          <path d="M181 181v20m-8-13v9" stroke={light} strokeOpacity=".3" />
        </g>
      )}
      {theme === 4 && (
        <g>
          <path
            d="M134 179V112a46 46 0 0 1 92 0v67Z"
            fill={sky}
            stroke={light}
            strokeWidth="2"
          />
          <path
            d="M144 177v-65a36 36 0 0 1 72 0v65"
            stroke={light}
            strokeOpacity=".35"
          />
          <path d="m185 87-22 44h19l-6 35 29-49h-21Z" fill={light} />
          <path
            d="m110 175 18-30m112 30-11-27m-87 38-20 20m96-20 20 20"
            stroke={light}
            strokeOpacity=".4"
          />
          <circle cx="182" cy="120" r="69" stroke={light} strokeOpacity=".15" />
        </g>
      )}
      {theme === 5 && (
        <g>
          <path
            d="M169 66a43 43 0 0 0 49 55 45 45 0 1 1-49-55Z"
            fill={light}
            opacity=".7"
          />
          <path d="m168 142-3-21 17 11 18-11-3 23" fill={sky} stroke={light} />
          <ellipse
            cx="182"
            cy="151"
            rx="23"
            ry="18"
            fill={sky}
            stroke={light}
          />
          <path
            d="M172 146q4-4 8 0m7 0q4-4 8 0m-15 8 3 3 3-3"
            stroke={light}
            strokeLinecap="round"
          />
          <path
            d="M153 174q27 15 59-2m-60 10q29 11 60 0"
            stroke={light}
            strokeOpacity=".4"
          />
          <path
            d="M239 94c-10-12-22 2 0 15 22-13 10-27 0-15Z"
            fill={light}
            opacity=".75"
          />
        </g>
      )}
      {theme === 6 && (
        <g>
          <path
            d="M120 133q28-12 60 3 32-15 60-3v51q-29-11-60 3-32-14-60-3Z"
            fill={sky}
            stroke={light}
            strokeWidth="1.5"
          />
          <path
            d="M180 136v51m-48-40q21-4 36 3m-36 10q21-4 36 3m24-13q19-7 35-3m-35 16q19-7 35-3"
            stroke={light}
            strokeOpacity=".5"
          />
          <path d="M190 63a24 24 0 0 0 31 29 26 26 0 1 1-31-29Z" fill={light} />
          <path d="m149 92 3-9 3 9 9 3-9 3-3 9-3-9-9-3Z" fill={light} />
          <path d="M150 201h63" stroke={light} strokeOpacity=".4" />
        </g>
      )}
      {theme === 7 && (
        <g>
          <circle cx="180" cy="92" r="33" fill={light} opacity=".6" />
          <path
            d="M127 92q51 16 106 0m-103 10h100m-86-5v93m73-93v93m-82-66h91"
            stroke={sky}
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M145 169h71m-78 10h85m-93 11h101m-110 12h117"
            stroke={light}
            strokeOpacity=".4"
          />
          <path
            d="m81 101 6-8 6 8-6 7m166 35 6-8 6 8-6 7m-23-72 4-6 5 6-5 5"
            fill={light}
            opacity=".8"
          />
        </g>
      )}
      <path
        d="M14 31v-16h16m300 0h16v16M14 210v16h16m300 0h16v-16"
        stroke={light}
        strokeOpacity=".25"
      />
    </svg>
  );
}
