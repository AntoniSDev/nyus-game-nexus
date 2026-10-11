import { useId } from "react";

export function FamiliarMark() {
  return <img src="/nyu-emblem.svg" alt="" aria-hidden="true" />;
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
      <image
        className="familiar-float"
        href="/nyu-mascot.png"
        x="82"
        y="22"
        width="338"
        height="338"
        preserveAspectRatio="xMidYMid meet"
      />
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
