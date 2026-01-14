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

export function TextInput({ x, y, fontSize, color, onSubmit, onCancel }: TextInputProps) {
  const [text, setText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit(text)
    } else if (e.key === "Escape") {
      onCancel()
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onSubmit(text)}
      className="absolute bg-transparent border-2 border-primary outline-none px-1"
      style={{
        left: x / dpr,
        top: y / dpr - fontSize,
        fontSize: `${fontSize}px`,
        color: color,
        minWidth: "100px",
      }}
      placeholder="Type here..."
    />
  )
}
