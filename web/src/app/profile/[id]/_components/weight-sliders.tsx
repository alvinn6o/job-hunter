"use client";

interface ScoringWeights {
  companyTier: number;
  location: number;
  titleMatch: number;
  skills: number;
  sponsorship: number;
  recency: number;
  culture: number;
  quality: number;
}

interface WeightSlidersProps {
  weights: ScoringWeights;
  onWeightsChange: (weights: ScoringWeights) => void;
}

const WEIGHT_LABELS: Record<
  keyof ScoringWeights,
  { label: string; desc: string; icon: string }
> = {
  companyTier: {
    label: "Company Tier",
    desc: "Big Tech, AU Notable, Top Tech companies",
    icon: "M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3",
  },
  location: {
    label: "Location",
    desc: "Adelaide, Sydney, Melbourne, Remote",
    icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z",
  },
  titleMatch: {
    label: "Title Match",
    desc: "Graduate, Full Stack, Frontend, SWE roles",
    icon: "M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2ZM6 12h4M14 12h4",
  },
  skills: {
    label: "Skills Match",
    desc: "React, TypeScript, Python, and your other skills",
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  },
  sponsorship: {
    label: "Visa Sponsorship",
    desc: "Sponsorship & visa signals in job descriptions",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
  },
  recency: {
    label: "Recency",
    desc: "Newer postings score higher",
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm1 3H11v6l5.25 3.15.75-1.23-4.5-2.67V7Z",
  },
  culture: {
    label: "Culture Signals",
    desc: "Remote-first, equity, flexible hours, learning budget",
    icon: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z",
  },
  quality: {
    label: "Job Quality",
    desc: "Salary transparency, detailed descriptions, benefits listed",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138Z",
  },
};

function getSliderBackground(value: number): string {
  const pct = (value / 2) * 100;
  return `linear-gradient(to right, #f59e0b ${pct}%, #1e293b ${pct}%)`;
}

export function WeightSliders({
  weights,
  onWeightsChange,
}: WeightSlidersProps) {
  const updateWeight = (key: keyof ScoringWeights, value: number) => {
    onWeightsChange({ ...weights, [key]: value });
  };

  const resetToDefaults = () => {
    onWeightsChange({
      companyTier: 1,
      location: 1,
      titleMatch: 1,
      skills: 1,
      sponsorship: 1,
      recency: 1,
      culture: 1,
      quality: 1,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div />
        <button
          type="button"
          onClick={resetToDefaults}
          className="font-sans text-xs text-navy-400 hover:text-navy-200 transition-colors"
        >
          Reset to defaults
        </button>
      </div>

      <div className="space-y-7">
        {(Object.entries(WEIGHT_LABELS) as [keyof ScoringWeights, typeof WEIGHT_LABELS[keyof ScoringWeights]][]).map(
          ([key, { label, desc, icon }]) => (
            <div key={key}>
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-navy-400 mt-0.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={icon} />
                  </svg>
                  <div>
                    <p className="font-sans text-sm font-medium text-white">
                      {label}
                    </p>
                    <p className="font-sans text-xs text-navy-400 mt-0.5">
                      {desc}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-sans text-sm font-semibold min-w-[3rem] text-right ${
                    weights[key] === 0
                      ? "text-navy-500"
                      : weights[key] > 1
                        ? "text-amber-400"
                        : "text-navy-200"
                  }`}
                >
                  {weights[key].toFixed(1)}x
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={weights[key]}
                onChange={(e) =>
                  updateWeight(key, parseFloat(e.target.value))
                }
                style={{ background: getSliderBackground(weights[key]) }}
                className="
                  w-full h-1.5 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-amber-500
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(245,158,11,0.3)]
                  [&::-webkit-slider-thumb]:hover:bg-amber-400
                  [&::-webkit-slider-thumb]:transition-colors
                "
              />

              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-navy-600">Off</span>
                <span className="text-[10px] text-navy-600">Default</span>
                <span className="text-[10px] text-navy-600">2x</span>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
