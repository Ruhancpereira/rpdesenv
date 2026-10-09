export default function Constellation() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-40"
      viewBox="0 0 1440 900"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="#9ec0ee" strokeOpacity="0.35" strokeWidth="1">
        <path d="M80 140 L210 90 L320 180 L250 280 L120 240 Z" />
        <path d="M1100 80 L1240 150 L1320 90 L1380 210 L1200 250 L1120 180 Z" />
        <path d="M90 700 L220 640 L300 760 L160 820 Z" />
        <path d="M1180 680 L1320 620 L1400 740 L1260 800 Z" />
        <path d="M210 90 L1100 80" strokeDasharray="2 10" strokeOpacity="0.2" />
        <path d="M300 760 L1180 680" strokeDasharray="2 12" strokeOpacity="0.16" />
      </g>
      {[
        [80, 140],
        [210, 90],
        [320, 180],
        [250, 280],
        [120, 240],
        [1100, 80],
        [1240, 150],
        [1320, 90],
        [1380, 210],
        [1200, 250],
        [90, 700],
        [220, 640],
        [300, 760],
        [1180, 680],
        [1320, 620],
        [1400, 740],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" fill="#e7f0ff" fillOpacity="0.8" />
      ))}
    </svg>
  );
}
