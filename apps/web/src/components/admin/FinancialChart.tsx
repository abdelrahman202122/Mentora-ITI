


'use client'

import { useState } from 'react'

/**
 * FinancialGrowthChartSimple
 * Minimal weekly bar chart matching the reference image:
 *  - Title: "Financial Growth (7 Days)"
 *  - Revenue / Volume toggle at top-right
 *  - 7 indigo bars (Mon → Sun), rounded tops
 *  - No y-axis, no totals, no value labels on bars
 *
 * Pure SVG + Tailwind, no chart library.
 */

type Series = 'Revenue' | 'Volume'

const DATA: Record<Series, Record<string, number>> = {
  Revenue: { Mon: 4200, Tue: 5100, Wed: 4800, Thu: 7200, Fri: 6100, Sat: 5500, Sun: 8900 },
  Volume:  { Mon: 120,  Tue: 165,  Wed: 140,  Thu: 220,  Fri: 195,  Sat: 175,  Sun: 260  },
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export default function FinancialGrowthChartSimple() {
  const [series, setSeries] = useState<Series>('Revenue')

  const values = DATA[series]
  const max = Math.max(...DAYS.map((d) => values[d]))

  // Chart geometry
  const width = 480
  const height = 200
  const padX = 12
  const padTop = 16
  const padBottom = 28
  const innerW = width - padX * 2
  const innerH = height - padTop - padBottom
  const slot = innerW / DAYS.length
  const barWidth = slot * 0.7 // bars ~40% of slot, rest is gap

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-5">
      {/* Header row: title + toggle */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Financial Growth (7 Days)
        </h3>

        <div className="inline-flex gap-2">
          {(['Revenue', 'Volume'] as Series[]).map((s) => {
            const active = s === series
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSeries(s)}
                className={[
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                ].join(' ')}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chart */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {DAYS.map((day, i) => {
          const v = values[day]
          const h = Math.max((v / max) * innerH, 2)
          const slotX = padX + i * slot
          const x = slotX + (slot - barWidth) / 2
          const y = padTop + (innerH - h)

          return (
            <g key={day}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={4}
                ry={4}
                fill="#4F46E5"
              />
              <text
                x={slotX + slot / 2}
                y={height - 8}
                textAnchor="middle"
                className="fill-gray-400 text-[10px]"
              >
                {day}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}