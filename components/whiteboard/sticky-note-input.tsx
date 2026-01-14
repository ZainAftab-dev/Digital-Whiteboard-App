"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

const STICKY_COLORS = [
  "#fef08a", // yellow
  "#fca5a5", // red
  "#86efac", // green
  "#93c5fd", // blue
  "#c4b5fd", // purple
  "#fdba74", // orange
]

interface StickyNoteInputProps {
  x: number
  y: number
  onSubmit: (text: string, color: string) => void
  onCancel: () => void
}

export function StickyNoteInput({ x, y, onSubmit, onCancel }: StickyNoteInputProps) {
  const [text, setText] = useState("")
  const [selectedColor, setSelectedColor] = useState(STICKY_COLORS[0])
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
      className="absolute z-50 shadow-xl rounded-lg overflow-hidden"
      style={{
        left: x / (window.devicePixelRatio || 1),
        top: y / (window.devicePixelRatio || 1),
        backgroundColor: selectedColor,
      }}
    >
      <div className="p-3 w-52">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your note..."
          className="w-full h-24 bg-transparent resize-none outline-none text-sm text-gray-800 placeholder-gray-500"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1">
            {STICKY_COLORS.map((color) => (
              <button
                key={color}
                className={`w-5 h-5 rounded-full border-2 ${selectedColor === color ? "border-gray-600" : "border-transparent"}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={onCancel} className="h-7 px-2 text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              className="h-7 px-2 text-xs bg-gray-800 hover:bg-gray-700 text-white"
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
