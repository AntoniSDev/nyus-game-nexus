import { useId } from "react";

/** Original vector familiar: a little moon cat, drawn for Nyu's sanctuary. */
export function FamiliarMark() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M13 31 10 10 27 22M37 22 54 10 51 32"
        fill="#9ee4dc"
        stroke="#64cfc7"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="m14 15 10 10-8 3m34-13-10 10 8 3" fill="#f6a5c8" />
      <ellipse cx="32" cy="36" rx="24" ry="20" fill="#c8f2ea" />
      <path
        d="M20 34q4-5 8 0m8 0q4-5 8 0"
        stroke="#314455"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="m29 41 3 3 3-3"
        stroke="#314455"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="18" cy="40" rx="5" ry="2.5" fill="#f6a5c8" />
      <ellipse cx="46" cy="40" rx="5" ry="2.5" fill="#f6a5c8" />
      <path d="m32 18 2-4 2 4-2 4z" fill="#f5f3ff" />
    </svg>
  );
}

export function SanctuaryArt() {
  const id = useId();
  return (
    <svg
      className="sanctuary-art"
      viewBox="0 0 480 390"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${id}-aura`}>
          <stop stopColor="#a78bfa" stopOpacity=".32" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id={`${id}-portal`}
          x1="130"
          y1="55"
          x2="350"
          y2="340"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#39c5bb" stopOpacity=".18" />
          <stop offset=".6" stopColor="#a78bfa" stopOpacity=".1" />
          <stop offset="1" stopColor="#f6a5c8" stopOpacity=".18" />
        </linearGradient>
        <linearGradient
          id={`${id}-rim`}
          x1="140"
          y1="80"
          x2="350"
          y2="300"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#73ded3" />
          <stop offset=".5" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#f6a5c8" />
        </linearGradient>
        <linearGradient
          id={`${id}-cat`}
          x1="196"
          y1="155"
          x2="290"
          y2="282"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d3fff3" />
          <stop offset="1" stopColor="#8acfc8" />
        </linearGradient>
        <linearGradient
          id={`${id}-cloud`}
          x1="100"
          y1="302"
          x2="375"
          y2="350"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#99ded4" />
          <stop offset="1" stopColor="#e2b9e3" />
        </linearGradient>
      </defs>
      <ellipse cx="249" cy="196" rx="216" ry="187" fill={`url(#${id}-aura)`} />
      <ellipse
        cx="248"
        cy="331"
        rx="145"
        ry="22"
        fill="#a78bfa"
        fillOpacity=".08"
      />
      <path
        d="M143 323V160a105 105 0 0 1 210 0v163Z"
        fill={`url(#${id}-portal)`}
        stroke={`url(#${id}-rim)`}
        strokeWidth="1.6"
      />
      <path
        d="M156 319V161a92 92 0 0 1 184 0v158"
        stroke="#e9d8ff"
        strokeOpacity=".2"
      />
      <path
        d="M132 318V158a116 116 0 0 1 232 0v160"
        stroke="#f6a5c8"
        strokeOpacity=".15"
        strokeDasharray="3 8"
      />
      <path
        d="M154 159a94 94 0 0 1 27-67m145 0a94 94 0 0 1 17 27"
        stroke="#c9ffef"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M234 105a31 31 0 0 0 40-39 32 32 0 1 1-40 39Z" fill="#f5d6e7" />
      <path
        d="M190 283 247 172l66 111"
        stroke="#e7d6ff"
        strokeOpacity=".18"
        strokeDasharray="3 6"
      />
      <circle cx="248" cy="226" r="77" stroke="#a78bfa" strokeOpacity=".18" />
      <path
        d="M131 327c-13-3-21-10-19-18 2-10 14-13 26-9 3-17 25-24 40-12 7-21 30-25 45-12 15-14 35-10 41 5 17-20 39-17 46 3 20-8 36 3 35 17 25-5 41 17 19 26Z"
        fill={`url(#${id}-cloud)`}
        fillOpacity=".8"
      />
      <path d="M136 329q112 30 226-1" stroke="#f5d6e7" strokeOpacity=".55" />
      <g className="familiar-float">
        <path
          d="M299 263c41 11 43-41 17-40-16 1-12 19-2 17"
          stroke="#9fdfd4"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <ellipse cx="249" cy="259" rx="50" ry="41" fill={`url(#${id}-cat)`} />
        <path
          d="m202 197-8-59q0-7 7-2l38 29m23 0 39-32q7-5 7 3l-8 63"
          fill={`url(#${id}-cat)`}
          stroke="#83d6cc"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="m203 148 4 35 21-12m68-25-22 25 18 12" fill="#f2b4cf" />
        <path
          d="M198 203c0-38 24-49 53-49 30 0 54 13 54 49 0 31-24 51-54 51s-53-20-53-51Z"
          fill={`url(#${id}-cat)`}
        />
        <path
          d="M220 198q8-9 16 0m29 0q8-9 16 0"
          stroke="#314455"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="m247 211 4 3 4-3m-4 3v4m-7 0q7 7 14 0"
          stroke="#314455"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse
          cx="216"
          cy="211"
          rx="9"
          ry="4.5"
          fill="#efa4c4"
          fillOpacity=".75"
        />
        <ellipse
          cx="284"
          cy="211"
          rx="9"
          ry="4.5"
          fill="#efa4c4"
          fillOpacity=".75"
        />
        <path d="m249 168 3-7 3 7-3 7Z" fill="#fff9ec" />
        <path
          d="M237 251c-21-18-27 8-9 8l12-3m15-5c21-18 27 8 9 8l-12-3"
          fill="#f6a5c8"
          stroke="#dc8eb4"
          strokeWidth="1.2"
        />
        <circle cx="247" cy="255" r="5" fill="#ffe4ee" />
        <path d="m239 260-8 15 11-3 3-13m8 1 9 14-12-3-2-12" fill="#f6a5c8" />
        <path
          d="M224 274c-5-4-17 1-17 11s11 10 19 5m47-16c5-4 17 1 17 11s-11 10-19 5"
          fill="#c0eee4"
        />
        <path
          d="M224 282c3-9 10-15 18-11h16c8-4 15 2 18 11l3 11c1 8-8 13-14 6l-7-7h-16l-7 7c-6 7-15 2-14-6Z"
          fill="#393753"
          stroke="#dfb9e1"
          strokeWidth="1.5"
        />
        <path
          d="M233 280v9m-4-4h8"
          stroke="#91e2d4"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="265" cy="281" r="2" fill="#f6a5c8" />
        <circle cx="269" cy="286" r="2" fill="#a78bfa" />
      </g>
      <g stroke="#f6a5c8" strokeOpacity=".5" strokeWidth="1">
        <path d="m106 165 9-40 35-12m218 121 39-12 18 28" />
        <circle cx="106" cy="165" r="3" fill="#f6a5c8" />
        <circle cx="115" cy="125" r="3" fill="#f6a5c8" />
        <circle cx="150" cy="113" r="3" fill="#f6a5c8" />
        <circle cx="407" cy="222" r="3" fill="#f6a5c8" />
      </g>
      <g fill="#e7c6ed">
        <path d="m99 226 4-12 4 12 12 4-12 4-4 12-4-12-12-4Z" />
        <path d="m381 122 3-10 3 10 10 3-10 3-3 10-3-10-10-3Z" />
        <path d="m330 47 2-7 2 7 7 2-7 2-2 7-2-7-7-2Z" />
      </g>
      <path
        d="M367 277c-13-14-26 3 0 18 26-15 13-32 0-18Z"
        fill="#f6a5c8"
        fillOpacity=".75"
      />
      <g fill="#baf2e6">
        <circle cx="179" cy="57" r="2" />
        <circle cx="94" cy="279" r="2" />
        <circle cx="395" cy="177" r="2" />
        <circle cx="314" cy="112" r="1.5" />
        <circle cx="191" cy="234" r="1.5" />
        <path d="m160 264 2-6 2 6 6 2-6 2-2 6-2-6-6-2Z" />
      </g>
      <path
        d="M111 310q-24-16-29-49m28 30q-21 0-22-14m17 7q5-17-2-26M374 319q28-16 35-48m-27 30q19 1 24-10m-15-1q-4-15 5-26"
        stroke="#81cfc5"
        strokeOpacity=".55"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
