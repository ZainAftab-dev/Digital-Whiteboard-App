"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

const STICKY_COLORS = [
  { value: "#ffe58a", name: "Yellow" },
  { value: "#ffc2b0", name: "Peach" },
  { value: "#b8ecc8", name: "Mint" },
  { value: "#bcd7ff", name: "Sky" },
  { value: "#dcc8ff", name: "Lilac" },
  { value: "#ffd0e6", name: "Pink" },
]

interface StickyNoteInputProps {
  x: number
  y: number
  onSubmit: (text: string, color: string) => void
  onCancel: () => void
}

export function StickyNoteInput({ x, y, onSubmit, onCancel }: StickyNoteInputProps) {
  const [text, setText] = useState("")
  const [selectedColor, setSelectedColor] = useState(STICKY_COLORS[0].value)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    onSubmit(text, selectedColor)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel()
    }
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit()
    }
  }

  return (
    <div
      className="absolute z-50 w-72 overflow-hidden rounded-xl shadow-[0_2px_4px_rgb(0_0_0/0.08),0_14px_30px_-12px_rgb(0_0_0/0.35)]"
      style={{
        left: x / (window.devicePixelRatio || 1),
        top: y / (window.devicePixelRatio || 1),
        backgroundColor: selectedColor,
      }}
      role="dialog"
      aria-label="New sticky note"
    >
      <div className="p-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Note text"
          placeholder="Write a note…"
          className="h-24 w-full resize-none bg-transparent text-[15px] font-medium leading-snug text-[#1d2125] outline-none focus-visible:outline-none placeholder:text-[#1d2125]/45"
        />
        <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Note colour">
          {STICKY_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={selectedColor === c.value}
              aria-label={c.name}
              className={`h-6 w-6 rounded-full border border-black/15 transition-transform hover:scale-110 ${
                selectedColor === c.value ? "ring-2 ring-[#1d2125] ring-offset-1" : ""
              }`}
              style={{ backgroundColor: c.value }}
              onClick={() => setSelectedColor(c.value)}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 bg-black/5 px-3 py-2">
        <span className="text-xs font-semibold whitespace-nowrap text-[#1d2125]/60">Ctrl+Enter</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onCancel}
            className="h-8 rounded-lg px-3 text-sm font-semibold text-[#1d2125] hover:bg-black/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-8 rounded-lg bg-[#1d2125] px-3 text-sm font-semibold text-white hover:bg-[#1d2125]/85"
          >
            Add note
          </button>
        </div>
      </div>
    </div>
  )
}
