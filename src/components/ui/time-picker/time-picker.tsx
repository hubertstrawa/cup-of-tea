'use client'

import * as React from 'react'
import { TimePickerInput } from './time-picker-input'
import { TimePeriodSelect } from './period-select'
import { Period } from './time-picker-utils'

interface TimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  defaultPeriod?: Period | 'AM'
  /** when true, use 24-hour inputs (no AM/PM) */
  format24?: boolean
}

export function TimePicker({
  date,
  setDate,
  defaultPeriod,
  format24,
}: TimePickerProps) {
  const [period, setPeriod] = React.useState<Period>(defaultPeriod ?? 'AM')

  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)
  const periodRef = React.useRef<HTMLButtonElement>(null)

  return (
    <div className='flex items-center gap-2'>
      {/* hours input: 12-hour or 24-hour depending on format24 prop */}
      <div className='grid gap-1 text-center'>
        <TimePickerInput
          picker={format24 ? 'hours' : '12hours'}
          period={period}
          date={date}
          setDate={setDate}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className='grid gap-1 text-center'>
        <TimePickerInput
          picker='minutes'
          id={'minutes12'}
          date={date}
          setDate={setDate}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
        />
      </div>
      {/* Period select only shown for 12-hour mode */}
      {!format24 && (
        <div className='grid gap-1 text-center'>
          <TimePeriodSelect
            period={period}
            setPeriod={setPeriod}
            date={date}
            setDate={setDate}
            ref={periodRef}
          />
        </div>
      )}
    </div>
  )
}
