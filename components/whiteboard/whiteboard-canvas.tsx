"use client"

import type React from "react"
import { useRef, useEffect, useCallback } from "react"
import type { DrawElement, Point, ViewportState } from "@/lib/whiteboard-types"

interface CanvasProps {
  elements: DrawElement[]
  previewElement: DrawElement | null
  showGrid: boolean
  isDarkMode: boolean
  viewport: ViewportState
  selectedElementId: string | null
  onDrawStart: (point: Point) => void
  onDrawMove: (point: Point) => void
  onDrawEnd: () => void
}

export function WhiteboardCanvas({
  elements,
  previewElement,
  showGrid,
  isDarkMode,
  viewport,
  selectedElementId,
  onDrawStart,
  onDrawMove,
  onDrawEnd,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const getPoint = useCallback(
    (e: React.MouseEvent | React.TouchEvent): Point => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      let clientX: number, clientY: number
      if ("touches" in e) {
        if (e.touches.length === 0) return { x: 0, y: 0 }
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }
      // Convert screen coordinates to canvas coordinates
      const x = ((clientX - rect.left) * dpr) / viewport.scale
      const y = ((clientY - rect.top) * dpr) / viewport.scale
      return { x, y }
    },
    [viewport.scale],
  )

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const gridSize = 20 * (window.devicePixelRatio || 1)
      ctx.strokeStyle = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
      ctx.lineWidth = 1
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    },
    [isDarkMode],
  )

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: DrawElement, isSelected = false) => {
    const dpr = window.devicePixelRatio || 1
    ctx.strokeStyle = element.color
    ctx.fillStyle = element.color
    ctx.lineWidth = element.strokeWidth * dpr
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.globalAlpha = element.opacity ?? 1

    switch (element.type) {
      case "pen":
        if (element.points.length < 2) {
          if (element.points.length === 1) {
            ctx.beginPath()
            ctx.arc(element.points[0].x, element.points[0].y, (element.strokeWidth * dpr) / 2, 0, Math.PI * 2)
            ctx.fill()
          }
          return
        }
        ctx.beginPath()
        ctx.moveTo(element.points[0].x, element.points[0].y)
        for (let i = 1; i < element.points.length - 1; i++) {
          const xc = (element.points[i].x + element.points[i + 1].x) / 2
          const yc = (element.points[i].y + element.points[i + 1].y) / 2
          ctx.quadraticCurveTo(element.points[i].x, element.points[i].y, xc, yc)
        }
        const lastPoint = element.points[element.points.length - 1]
        ctx.lineTo(lastPoint.x, lastPoint.y)
        ctx.stroke()
        break
      case "highlighter":
        if (element.points.length < 2) {
          if (element.points.length === 1) {
            ctx.beginPath()
            ctx.arc(element.points[0].x, element.points[0].y, 10 * dpr, 0, Math.PI * 2)
            ctx.globalAlpha = 0.4
            ctx.fill()
          }
          return
        }
        ctx.lineWidth = 20 * dpr
        ctx.globalAlpha = 0.4
        ctx.beginPath()
        ctx.moveTo(element.points[0].x, element.points[0].y)
        for (let i = 1; i < element.points.length - 1; i++) {
          const xc = (element.points[i].x + element.points[i + 1].x) / 2
          const yc = (element.points[i].y + element.points[i + 1].y) / 2
          ctx.quadraticCurveTo(element.points[i].x, element.points[i].y, xc, yc)
        }
        const lastHighlighterPoint = element.points[element.points.length - 1]
        ctx.lineTo(lastHighlighterPoint.x, lastHighlighterPoint.y)
        ctx.stroke()
        break
      case "rectangle":
        ctx.beginPath()
        ctx.rect(element.x, element.y, element.width, element.height)
        if (element.fill) {
          ctx.fill()
        }
        ctx.stroke()
        break
      case "circle":
        ctx.beginPath()
        ctx.arc(element.centerX, element.centerY, element.radius, 0, Math.PI * 2)
        if (element.fill) {
          ctx.fill()
        }
        ctx.stroke()
        break
      case "line":
        ctx.beginPath()
        ctx.moveTo(element.startX, element.startY)
        ctx.lineTo(element.endX, element.endY)
        ctx.stroke()
        break
      case "arrow":
        ctx.beginPath()
        ctx.moveTo(element.startX, element.startY)
        ctx.lineTo(element.endX, element.endY)
        ctx.stroke()
        // Draw arrowhead
        const angle = Math.atan2(element.endY - element.startY, element.endX - element.startX)
        const headLength = 15 * dpr
        ctx.beginPath()
        ctx.moveTo(element.endX, element.endY)
        ctx.lineTo(
          element.endX - headLength * Math.cos(angle - Math.PI / 6),
          element.endY - headLength * Math.sin(angle - Math.PI / 6),
        )
        ctx.moveTo(element.endX, element.endY)
        ctx.lineTo(
          element.endX - headLength * Math.cos(angle + Math.PI / 6),
          element.endY - headLength * Math.sin(angle + Math.PI / 6),
        )
        ctx.stroke()
        break
      case "text":
        ctx.font = `${element.fontSize * dpr}px Geist, sans-serif`
        ctx.fillText(element.text, element.x, element.y)
        break
      case "sticky":
        ctx.globalAlpha = 1
        ctx.fillStyle = element.backgroundColor
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
        ctx.shadowBlur = 10 * dpr
        ctx.shadowOffsetX = 2 * dpr
        ctx.shadowOffsetY = 4 * dpr
        ctx.fillRect(element.x, element.y, element.width, element.height)
        ctx.shadowColor = "transparent"
        ctx.fillStyle = "#000000"
        ctx.font = `${14 * dpr}px Geist, sans-serif`
        // Word wrap text in sticky note
        const words = element.text.split(" ")
        let line = ""
        let y = element.y + 25 * dpr
        const maxWidth = element.width - 20
        for (const word of words) {
          const testLine = line + word + " "
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && line !== "") {
            ctx.fillText(line, element.x + 10, y)
            line = word + " "
            y += 18 * dpr
          } else {
            line = testLine
          }
        }
        ctx.fillText(line, element.x + 10, y)
        break
    }

    ctx.globalAlpha = 1

    if (isSelected) {
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2 * dpr
      ctx.setLineDash([5 * dpr, 5 * dpr])

      if (element.type === "rectangle" || element.type === "sticky") {
        ctx.strokeRect(element.x - 5, element.y - 5, element.width + 10, element.height + 10)
      } else if (element.type === "circle") {
        ctx.beginPath()
        ctx.arc(element.centerX, element.centerY, element.radius + 5, 0, Math.PI * 2)
        ctx.stroke()
      } else if (element.type === "pen" || element.type === "highlighter") {
        if (element.points.length > 0) {
          const minX = Math.min(...element.points.map((p) => p.x)) - 5
          const minY = Math.min(...element.points.map((p) => p.y)) - 5
          const maxX = Math.max(...element.points.map((p) => p.x)) + 5
          const maxY = Math.max(...element.points.map((p) => p.y)) + 5
          ctx.strokeRect(minX, minY, maxX - minX, maxY - minY)
        }
      } else if (element.type === "line" || element.type === "arrow") {
        const minX = Math.min(element.startX, element.endX) - 5
        const minY = Math.min(element.startY, element.endY) - 5
        const maxX = Math.max(element.startX, element.endX) + 5
        const maxY = Math.max(element.startY, element.endY) + 5
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY)
      } else if (element.type === "text") {
        const textWidth = element.text.length * element.fontSize * 0.6
        ctx.strokeRect(element.x - 5, element.y - element.fontSize - 5, textWidth + 10, element.fontSize + 15)
      }

      ctx.setLineDash([])
    }
  }, [])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.fillStyle = isDarkMode ? "#1a1a1a" : "#fafafa"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (showGrid) drawGrid(ctx, canvas.width, canvas.height)

    ctx.save()
    ctx.scale(viewport.scale, viewport.scale)

    elements.forEach((element) => drawElement(ctx, element, element.id === selectedElementId))
    if (previewElement) {
      ctx.globalAlpha = 0.7
      drawElement(ctx, previewElement)
      ctx.globalAlpha = 1
    }

    ctx.restore()
  }, [elements, previewElement, showGrid, isDarkMode, drawGrid, drawElement, viewport, selectedElementId])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      render()
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [render])

  useEffect(() => {
    render()
  }, [render])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    onDrawStart(getPoint(e))
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    onDrawMove(getPoint(e))
  }
  const handleMouseUp = () => {
    onDrawEnd()
  }
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    onDrawStart(getPoint(e))
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    onDrawMove(getPoint(e))
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    onDrawEnd()
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="touch-none"
      />
    </div>
  )
}
