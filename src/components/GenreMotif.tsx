/** Genre symbols only: independent of game titles, covers and roster contents. */
export function GenreMotif({
  theme,
  sky,
  hill,
  light,
}: {
  theme: number;
  sky: string;
  hill: string;
  light: string;
}) {
  return (
    <g className="genre-motif">
      {theme === 0 && (
        <g>
          <path d="M211 49a24 24 0 0 0 27 28 26 26 0 1 1-27-28Z" fill={light} />
          {[58, 91, 277, 305].map((x, i) => (
            <g key={x} transform={`translate(${x} ${125 + (i % 2) * 20})`}>
              <path
                d="m0-45-20 33h10l-18 28h56L10-12h10Z"
                fill={sky}
                stroke={light}
                strokeOpacity=".2"
              />
              <path d="M0 16v15" stroke={light} strokeOpacity=".3" />
            </g>
          ))}
          <path
            d="m144 166 38-31 38 31v31h-76Z"
            fill={sky}
            stroke={light}
            strokeOpacity=".6"
          />
          <path d="m137 169 45-40 45 40" stroke={light} strokeWidth="2" />
          <path d="M170 167h23v17h-23z" fill={light} opacity=".7" />
          <path d="m119 192 7-12 7 12q-7 9-14 0Z" fill={light} opacity=".8" />
          <path d="m114 199 24 0" stroke={light} strokeOpacity=".5" />
        </g>
      )}
      {theme === 1 && (
        <g stroke={light} strokeWidth="1.5" strokeLinejoin="round">
          <rect x="114" y="143" width="132" height="24" rx="12" fill={sky} />
          {[126, 146, 166, 186, 206, 226, 236].map((x) => (
            <circle key={x} cx={x} cy="155" r="4" opacity=".65" />
          ))}
          <rect x="137" y="92" width="75" height="50" rx="8" fill={hill} />
          <path d="M150 103h19v14h-19zM184 105h13m-13 8h8m-34 30v-11m39 11v-11M122 143v-38q0-20 15-20m75 28h19v30" />
          <path d="m159 131 8 0m-3-3 3 3-3 3" strokeLinecap="round" />
          <g transform="translate(181 70)">
            <circle r="16" fill={sky} />
            <circle r="7" />
            <path
              d="M0-20v5M0 15v5m-20-20h5m30 0h5m-34-14 4 4m20 20 4 4m0-28-4 4m-20 20-4 4"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
          <path d="M114 185h132m-119-14v14m105-14v14" opacity=".4" />
          <path d="m220 90 7-4 7 4-7 4Z" fill={light} fillOpacity=".5" />
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
          <path
            d="m139 136 28-17m27 0 39 17m-89 42h81"
            stroke={light}
            strokeOpacity=".65"
            strokeDasharray="3 4"
          />
          <ellipse
            cx="181"
            cy="187"
            rx="67"
            ry="15"
            stroke={light}
            strokeOpacity=".45"
          />
          <path d="m165 171 14 32 16-32" stroke={light} strokeOpacity=".4" />
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
          <path
            d="M104 89q22-17 47-12m-7-4 7 4-5 6"
            stroke={light}
            strokeOpacity=".5"
            strokeDasharray="3 4"
          />
        </g>
      )}
      {theme === 4 && (
        <g stroke={light}>
          <circle cx="180" cy="117" r="46" strokeWidth="1.5" />
          <circle cx="180" cy="117" r="29" strokeOpacity=".5" />
          <path
            d="M180 62v19m0 72v19m-55-55h19m72 0h19"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="m185 88-24 38h19l-5 25 28-39h-20Z"
            fill={light}
            stroke="none"
          />
          <path
            d="m112 89 25 0m-32 57h22m93-70h23m-18 79h24"
            strokeOpacity=".6"
            strokeLinecap="round"
          />
          <path d="m122 175 25-12m66 9 20 10" strokeOpacity=".35" />
        </g>
      )}
      {theme === 5 && (
        <g>
          <path
            d="M169 66a43 43 0 0 0 49 55 45 45 0 1 1-49-55Z"
            fill={light}
            opacity=".7"
          />
          <path
            d="M132 168c-9-5-7-18 5-19 1-15 24-21 34-8 10-12 29-6 31 7 22-3 33 16 14 23Z"
            fill={light}
            fillOpacity=".25"
            stroke={light}
            strokeOpacity=".55"
          />
          <path
            d="m226 180 0-25m0 11q-19 0-15-12 13-1 15 12m0-7q16-1 13-13-12-1-13 13M121 187h113"
            stroke={light}
            strokeOpacity=".6"
            strokeLinecap="round"
          />
          <path
            d="M241 96c-10-12-22 2 0 15 22-13 10-27 0-15Z"
            fill={light}
            opacity=".75"
          />
        </g>
      )}
      {theme === 6 && (
        <g>
          <path
            d="M151 155V98a30 30 0 0 1 60 0v57"
            stroke={light}
            strokeWidth="2"
          />
          <path
            d="M158 155V98a23 23 0 0 1 46 0v57"
            stroke={light}
            strokeOpacity=".4"
          />
          <path
            d="m136 116 0 39m-5-38h10m80 0h10m-5 0v38"
            stroke={light}
            strokeOpacity=".45"
            strokeWidth="3"
          />
          <path
            d="M117 203q37-22 63-23t9-20"
            stroke={light}
            strokeOpacity=".75"
            strokeWidth="2"
          />
          <path
            d="M135 206q37-17 56-18t5-26"
            stroke={light}
            strokeOpacity=".3"
          />
          <path d="m179 100 3-12 3 12 12 3-12 3-3 12-3-12-12-3Z" fill={light} />
          <path d="M153 161h60m-53 7h45" stroke={light} strokeOpacity=".4" />
        </g>
      )}
      {theme === 7 && (
        <g>
          <path
            d="M137 167v-54a43 43 0 0 1 86 0v54"
            stroke={light}
            strokeOpacity=".5"
            strokeWidth="2"
          />
          <path
            d="M146 167v-54a34 34 0 0 1 68 0v54"
            stroke={light}
            strokeOpacity=".2"
          />
          <path
            d="m179 84-7 11 4 54 4 14 4-14 4-54Z"
            fill={light}
            fillOpacity=".75"
          />
          <path
            d="M165 151h31m-15 4v23m-7 0h14"
            stroke={light}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <ellipse
            cx="181"
            cy="187"
            rx="43"
            ry="10"
            stroke={light}
            strokeOpacity=".4"
          />
          <path
            d="m143 173 4-10 5 10-5 5m65-21 3-7 4 7-4 4m-18 36 3-6 3 6-3 3"
            fill={light}
            opacity=".8"
          />
          <circle cx="158" cy="135" r="1.5" fill={light} />
          <circle cx="203" cy="125" r="1.5" fill={light} />
        </g>
      )}
    </g>
  );
}
