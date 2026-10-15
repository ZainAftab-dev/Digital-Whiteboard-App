"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

interface TextInputProps {
  x: number
  y: number
  fontSize: number
  color: string
  onSubmit: (text: string) => void
  onCancel: () => void
}

export function WhiteboardTextInput({ x, y, fontSize, color, onSubmit, onCancel }: TextInputProps) {
  const [text, setText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSubmit(text)
    else if (e.key === "Escape") onCancel()
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onSubmit(text)}
      aria-label="Text"
      className="absolute rounded-md border-2 border-dashed border-accent bg-transparent px-1 outline-none"
      style={{ left: x / dpr, top: y / dpr - fontSize, fontSize: `${fontSize}px`, color, minWidth: "180px", fontFamily: '"Manrope Variable", system-ui, sans-serif' }}
      placeholder="Type, then press Enter"
    />
  )
}
