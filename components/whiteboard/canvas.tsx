"use client"

import type React from "react"
import { useRef, useEffect, useCallback } from "react"
import type { DrawElement, Point } from "@/lib/whiteboard-types"

interface CanvasProps {
  elements: DrawElement[]
  previewElement: DrawElement | null
  showGrid: boolean
  isDarkMode: boolean
  onDrawStart: (point: Point) => void
  onDrawMove: (point: Point) => void
  onDrawEnd: () => void
}

export function Canvas({
  elements,
  previewElement,
  showGrid,
  isDarkMode,
  onDrawStart,
  onDrawMove,
  onDrawEnd,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const getPoint = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    let clientX: number, clientY: number
    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: (clientX - rect.left) * dpr,
      y: (clientY - rect.top) * dpr,
    }
  }, [])

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

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: DrawElement) => {
    ctx.strokeStyle = element.color
    ctx.fillStyle = element.color
    ctx.lineWidth = element.strokeWidth * (window.devicePixelRatio || 1)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    switch (element.type) {
      case "pen":
        if (element.points.length < 2) return
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

      case "rectangle":
        ctx.beginPath()
        ctx.rect(element.x, element.y, element.width, element.height)
        ctx.stroke()
        break

      case "circle":
        ctx.beginPath()
        ctx.arc(element.centerX, element.centerY, element.radius, 0, Math.PI * 2)
        ctx.stroke()
        break

      case "line":
        ctx.beginPath()
        ctx.moveTo(element.startX, element.startY)
        ctx.lineTo(element.endX, element.endY)
        ctx.stroke()
        break

      case "text":
        const dpr = window.devicePixelRatio || 1
        ctx.font = `${element.fontSize * dpr}px Geist, sans-serif`
        ctx.fillText(element.text, element.x, element.y)
        break
    }
  }, [])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.fillStyle = isDarkMode ? "#1a1a1a" : "#fafafa"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height)
    }

    elements.forEach((element) => drawElement(ctx, element))

    if (previewElement) {
      ctx.globalAlpha = 0.7
      drawElement(ctx, previewElement)
      ctx.globalAlpha = 1
    }
  }, [elements, previewElement, showGrid, isDarkMode, drawGrid, drawElement])

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

  const handleTouchEnd = () => {
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
