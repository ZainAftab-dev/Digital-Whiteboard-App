"use client"

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react"
import { WhiteboardToolbar } from "./whiteboard/whiteboard-toolbar"
import { WhiteboardCanvas } from "./whiteboard/whiteboard-canvas"
import { WhiteboardTextInput } from "./whiteboard/whiteboard-text-input"
import { StickyNoteInput } from "./whiteboard/sticky-note-input"
import type { Tool, DrawElement, Point, HistoryState, ViewportState } from "@/lib/whiteboard-types"
import { INK } from "@/lib/whiteboard-types"
import { MousePointerClick } from "lucide-react"

const generateId = () => Math.random().toString(36).substring(2, 9)

export function Whiteboard() {
  const [tool, setTool] = useState<Tool>("pen")
  const [color, setColor] = useState(INK)
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [fontSize, setFontSize] = useState(16)
  const [showGrid, setShowGrid] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [opacity, setOpacity] = useState(100)
  const [fillShapes, setFillShapes] = useState(false)

  const [elements, setElements] = useState<DrawElement[]>([])
  const [history, setHistory] = useState<HistoryState[]>([{ elements: [] }])
  const [historyIndex, setHistoryIndex] = useState(0)

  const [textInput, setTextInput] = useState<{ x: number; y: number } | null>(null)
  const [stickyInput, setStickyInput] = useState<{ x: number; y: number } | null>(null)
  const [previewElement, setPreviewElement] = useState<DrawElement | null>(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const currentPointsRef = useRef<Point[]>([])

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 })

  const [viewport, setViewport] = useState<ViewportState>({ scale: 1, offsetX: 0, offsetY: 0 })

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  const saveToHistory = useCallback(
    (newElements: DrawElement[]) => {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push({ elements: newElements })
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setElements(history[newIndex].elements)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setElements(history[newIndex].elements)
    }
  }, [history, historyIndex])

  const clearCanvas = useCallback(() => {
    setElements([])
    saveToHistory([])
    setSelectedElementId(null)
  }, [saveToHistory])

  const deleteSelected = useCallback(() => {
    if (selectedElementId) {
      const newElements = elements.filter((el) => el.id !== selectedElementId)
      setElements(newElements)
      saveToHistory(newElements)
      setSelectedElementId(null)
    }
  }, [selectedElementId, elements, saveToHistory])

  const zoomIn = useCallback(() => {
    setViewport((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.2, 5) }))
  }, [])

  const zoomOut = useCallback(() => {
    setViewport((prev) => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.2) }))
  }, [])

  const resetZoom = useCallback(() => {
    setViewport({ scale: 1, offsetX: 0, offsetY: 0 })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault()
        redo()
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId) {
        e.preventDefault()
        deleteSelected()
      }
      if (!e.ctrlKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "v":
            setTool("select")
            break
          case "p":
            setTool("pen")
            break
          case "r":
            setTool("rectangle")
            break
          case "c":
            setTool("circle")
            break
          case "l":
            setTool("line")
            break
          case "a":
            setTool("arrow")
            break
          case "t":
            setTool("text")
            break
          case "e":
            setTool("eraser")
            break
          case "h":
            setTool("highlighter")
            break
          case "s":
            setTool("sticky")
            break
          case "=":
          case "+":
            zoomIn()
            break
          case "-":
            zoomOut()
            break
          case "0":
            resetZoom()
            break
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, deleteSelected, selectedElementId, zoomIn, zoomOut, resetZoom])

  useEffect(() => {
    const saved = localStorage.getItem("whiteboard-data")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.elements && Array.isArray(parsed.elements)) {
          setElements(parsed.elements)
          setHistory([{ elements: parsed.elements }])
        }
      } catch {
        // Invalid data, ignore
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("whiteboard-data", JSON.stringify({ elements }))
  }, [elements])

  const findElementAtPoint = useCallback(
    (point: Point): DrawElement | null => {
      // Search in reverse to get top-most element first
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i]
        if (el.type === "pen" || el.type === "highlighter") {
          for (const p of el.points) {
            if (Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)) < 10) {
              return el
            }
          }
        } else if (el.type === "rectangle" || el.type === "sticky") {
          if (point.x >= el.x && point.x <= el.x + el.width && point.y >= el.y && point.y <= el.y + el.height) {
            return el
          }
        } else if (el.type === "circle") {
          const dist = Math.sqrt(Math.pow(point.x - el.centerX, 2) + Math.pow(point.y - el.centerY, 2))
          if (dist <= el.radius + 5) {
            return el
          }
        } else if (el.type === "line" || el.type === "arrow") {
          const A = point.x - el.startX
          const B = point.y - el.startY
          const C = el.endX - el.startX
          const D = el.endY - el.startY
          const dot = A * C + B * D
          const lenSq = C * C + D * D
          const param = lenSq !== 0 ? dot / lenSq : -1
          const xx = param < 0 ? el.startX : param > 1 ? el.endX : el.startX + param * C
          const yy = param < 0 ? el.startY : param > 1 ? el.endY : el.startY + param * D
          const dist = Math.sqrt(Math.pow(point.x - xx, 2) + Math.pow(point.y - yy, 2))
          if (dist < 10) {
            return el
          }
        } else if (el.type === "text") {
          if (
            point.x >= el.x - 10 &&
            point.x <= el.x + el.text.length * el.fontSize * 0.6 &&
            point.y >= el.y - el.fontSize &&
            point.y <= el.y + 10
          ) {
            return el
          }
        }
      }
      return null
    },
    [elements],
  )

  const handleDrawStart = useCallback(
    (point: Point) => {
      if (tool === "select") {
        const element = findElementAtPoint(point)
        if (element) {
          setSelectedElementId(element.id)
          setIsDragging(true)
          // Calculate offset based on element type
          if (element.type === "rectangle" || element.type === "sticky") {
            setDragOffset({ x: point.x - element.x, y: point.y - element.y })
          } else if (element.type === "circle") {
            setDragOffset({ x: point.x - element.centerX, y: point.y - element.centerY })
          } else if (element.type === "line" || element.type === "arrow") {
            setDragOffset({ x: point.x - element.startX, y: point.y - element.startY })
          } else if (element.type === "text") {
            setDragOffset({ x: point.x - element.x, y: point.y - element.y })
          } else if (element.type === "pen" || element.type === "highlighter") {
            const minX = Math.min(...element.points.map((p) => p.x))
            const minY = Math.min(...element.points.map((p) => p.y))
            setDragOffset({ x: point.x - minX, y: point.y - minY })
          }
        } else {
          setSelectedElementId(null)
        }
        return
      }

      if (tool === "text") {
        setTextInput(point)
        return
      }

      if (tool === "sticky") {
        setStickyInput(point)
        return
      }

      setIsDrawing(true)
      setStartPoint(point)
      if (tool === "pen" || tool === "eraser" || tool === "highlighter") {
        currentPointsRef.current = [point]
      }
    },
    [tool, findElementAtPoint],
  )

  const handleDrawMove = useCallback(
    (point: Point) => {
      if (tool === "select" && isDragging && selectedElementId) {
        setElements((prev) =>
          prev.map((el) => {
            if (el.id !== selectedElementId) return el
            if (el.type === "rectangle") {
              return { ...el, x: point.x - dragOffset.x, y: point.y - dragOffset.y }
            } else if (el.type === "sticky") {
              return { ...el, x: point.x - dragOffset.x, y: point.y - dragOffset.y }
            } else if (el.type === "circle") {
              return { ...el, centerX: point.x - dragOffset.x, centerY: point.y - dragOffset.y }
            } else if (el.type === "line") {
              const dx = el.endX - el.startX
              const dy = el.endY - el.startY
              return {
                ...el,
                startX: point.x - dragOffset.x,
                startY: point.y - dragOffset.y,
                endX: point.x - dragOffset.x + dx,
                endY: point.y - dragOffset.y + dy,
              }
            } else if (el.type === "arrow") {
              const dx = el.endX - el.startX
              const dy = el.endY - el.startY
              return {
                ...el,
                startX: point.x - dragOffset.x,
                startY: point.y - dragOffset.y,
                endX: point.x - dragOffset.x + dx,
                endY: point.y - dragOffset.y + dy,
              }
            } else if (el.type === "text") {
              return { ...el, x: point.x - dragOffset.x, y: point.y - dragOffset.y }
            } else if (el.type === "pen" || el.type === "highlighter") {
              const minX = Math.min(...el.points.map((p) => p.x))
              const minY = Math.min(...el.points.map((p) => p.y))
              const dx = point.x - dragOffset.x - minX
              const dy = point.y - dragOffset.y - minY
              return { ...el, points: el.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) }
            }
            return el
          }),
        )
        return
      }

      if (!isDrawing || !startPoint) return

      if (tool === "pen") {
        currentPointsRef.current = [...currentPointsRef.current, point]
        setPreviewElement({
          id: "preview",
          type: "pen",
          points: currentPointsRef.current,
          color,
          strokeWidth,
          opacity: opacity / 100,
        })
      } else if (tool === "highlighter") {
        currentPointsRef.current = [...currentPointsRef.current, point]
        setPreviewElement({
          id: "preview",
          type: "highlighter",
          points: currentPointsRef.current,
          color,
          strokeWidth: 20,
          opacity: 0.4,
        })
      } else if (tool === "eraser") {
        const eraserRadius = strokeWidth * 2
        setElements((prev) =>
          prev.filter((el) => {
            if (el.type === "pen" || el.type === "highlighter") {
              return !el.points.some(
                (p) => Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)) < eraserRadius,
              )
            }
            if (el.type === "rectangle" || el.type === "sticky") {
              return !(point.x >= el.x && point.x <= el.x + el.width && point.y >= el.y && point.y <= el.y + el.height)
            }
            if (el.type === "circle") {
              const dist = Math.sqrt(Math.pow(point.x - el.centerX, 2) + Math.pow(point.y - el.centerY, 2))
              return dist > el.radius + eraserRadius
            }
            if (el.type === "line" || el.type === "arrow") {
              const A = point.x - el.startX
              const B = point.y - el.startY
              const C = el.endX - el.startX
              const D = el.endY - el.startY
              const dot = A * C + B * D
              const lenSq = C * C + D * D
              const param = lenSq !== 0 ? dot / lenSq : -1
              const xx = param < 0 ? el.startX : param > 1 ? el.endX : el.startX + param * C
              const yy = param < 0 ? el.startY : param > 1 ? el.endY : el.startY + param * D
              const dist = Math.sqrt(Math.pow(point.x - xx, 2) + Math.pow(point.y - yy, 2))
              return dist > eraserRadius
            }
            if (el.type === "text") {
              return !(
                point.x >= el.x - 10 &&
                point.x <= el.x + el.text.length * el.fontSize * 0.6 &&
                point.y >= el.y - el.fontSize &&
                point.y <= el.y + 10
              )
            }
            return true
          }),
        )
      } else if (tool === "rectangle") {
        setPreviewElement({
          id: "preview",
          type: "rectangle",
          x: Math.min(startPoint.x, point.x),
          y: Math.min(startPoint.y, point.y),
          width: Math.abs(point.x - startPoint.x),
          height: Math.abs(point.y - startPoint.y),
          color,
          strokeWidth,
          opacity: opacity / 100,
          fill: fillShapes,
        })
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(point.x - startPoint.x, 2) + Math.pow(point.y - startPoint.y, 2))
        setPreviewElement({
          id: "preview",
          type: "circle",
          centerX: startPoint.x,
          centerY: startPoint.y,
          radius,
          color,
          strokeWidth,
          opacity: opacity / 100,
          fill: fillShapes,
        })
      } else if (tool === "line") {
        setPreviewElement({
          id: "preview",
          type: "line",
          startX: startPoint.x,
          startY: startPoint.y,
          endX: point.x,
          endY: point.y,
          color,
          strokeWidth,
          opacity: opacity / 100,
        })
      } else if (tool === "arrow") {
        setPreviewElement({
          id: "preview",
          type: "arrow",
          startX: startPoint.x,
          startY: startPoint.y,
          endX: point.x,
          endY: point.y,
          color,
          strokeWidth,
          opacity: opacity / 100,
        })
      }
    },
    [isDrawing, startPoint, tool, color, strokeWidth, opacity, fillShapes, isDragging, selectedElementId, dragOffset],
  )

  const handleDrawEnd = useCallback(() => {
    if (tool === "select" && isDragging) {
      setIsDragging(false)
      saveToHistory(elements)
      return
    }

    if (!isDrawing) return
    setIsDrawing(false)
    setPreviewElement(null)

    const points = currentPointsRef.current

    if (tool === "pen" && points.length > 0) {
      const newElement: DrawElement = {
        id: generateId(),
        type: "pen",
        points: points,
        color,
        strokeWidth,
        opacity: opacity / 100,
      }
      const newElements = [...elements, newElement]
      setElements(newElements)
      saveToHistory(newElements)
    } else if (tool === "highlighter" && points.length > 0) {
      const newElement: DrawElement = {
        id: generateId(),
        type: "highlighter",
        points: points,
        color,
        strokeWidth: 20,
        opacity: 0.4,
      }
      const newElements = [...elements, newElement]
      setElements(newElements)
      saveToHistory(newElements)
    } else if (tool === "eraser") {
      saveToHistory(elements)
    } else if (previewElement && previewElement.type !== "pen" && previewElement.type !== "highlighter") {
      const newElement = { ...previewElement, id: generateId() }
      const newElements = [...elements, newElement]
      setElements(newElements)
      saveToHistory(newElements)
    }

    currentPointsRef.current = []
    setStartPoint(null)
  }, [isDrawing, tool, color, strokeWidth, elements, previewElement, saveToHistory, opacity, isDragging])

  const handleTextSubmit = useCallback(
    (text: string) => {
      if (textInput && text.trim()) {
        const newElement: DrawElement = {
          id: generateId(),
          type: "text",
          x: textInput.x,
          y: textInput.y,
          text: text.trim(),
          fontSize,
          color,
          strokeWidth: 1,
          opacity: opacity / 100,
        }
        const newElements = [...elements, newElement]
        setElements(newElements)
        saveToHistory(newElements)
      }
      setTextInput(null)
    },
    [textInput, fontSize, color, elements, saveToHistory, opacity],
  )

  const handleStickySubmit = useCallback(
    (text: string, bgColor: string) => {
      if (stickyInput) {
        const newElement: DrawElement = {
          id: generateId(),
          type: "sticky",
          x: stickyInput.x,
          y: stickyInput.y,
          width: 200,
          height: 150,
          text: text.trim(),
          color: "#000000",
          backgroundColor: bgColor,
          strokeWidth: 1,
          opacity: 1,
        }
        const newElements = [...elements, newElement]
        setElements(newElements)
        saveToHistory(newElements)
      }
      setStickyInput(null)
    },
    [stickyInput, elements, saveToHistory],
  )

  const exportCanvas = useCallback(() => {
    const canvas = document.querySelector("canvas")
    if (canvas) {
      const link = document.createElement("a")
      link.download = "whiteboard.png"
      link.href = canvas.toDataURL("image/png")
      link.click()
    }
  }, [])

  const getCursorStyle = () => {
    switch (tool) {
      case "select":
        return selectedElementId ? "move" : "default"
      case "pen":
      case "rectangle":
      case "circle":
      case "line":
      case "arrow":
      case "highlighter":
        return "crosshair"
      case "eraser":
        return "cell"
      case "text":
      case "sticky":
        return "text"
      default:
        return "default"
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-board">
      <div className="absolute inset-0" style={{ cursor: getCursorStyle() }}>
        <WhiteboardCanvas
          elements={elements}
          previewElement={previewElement}
          showGrid={showGrid}
          isDarkMode={isDarkMode}
          viewport={viewport}
          selectedElementId={selectedElementId}
          onDrawStart={handleDrawStart}
          onDrawMove={handleDrawMove}
          onDrawEnd={handleDrawEnd}
        />
        {textInput && (
          <WhiteboardTextInput
            x={textInput.x}
            y={textInput.y}
            fontSize={fontSize}
            color={color === INK && isDarkMode ? "#eceef0" : color}
            onSubmit={handleTextSubmit}
            onCancel={() => setTextInput(null)}
          />
        )}
        {stickyInput && (
          <StickyNoteInput
            x={stickyInput.x}
            y={stickyInput.y}
            onSubmit={handleStickySubmit}
            onCancel={() => setStickyInput(null)}
          />
        )}
      </div>

      {elements.length === 0 && !isDrawing && !textInput && !stickyInput && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center pl-20 pr-6 md:px-6">
          <div className="max-w-sm text-center">
            <MousePointerClick className="mx-auto h-8 w-8 text-graphite/70" aria-hidden="true" />
            <p className="mt-3 font-display text-2xl font-semibold text-ink">Start sketching</p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-graphite">
              Pick a tool on the left, or press <Key>P</Key> for the pen, <Key>R</Key> for a rectangle and{" "}
              <Key>S</Key> for a sticky note.
            </p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0">
        <WhiteboardToolbar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          fontSize={fontSize}
          setFontSize={setFontSize}
          opacity={opacity}
          setOpacity={setOpacity}
          fillShapes={fillShapes}
          setFillShapes={setFillShapes}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onUndo={undo}
          onRedo={redo}
          onClear={clearCanvas}
          onExport={exportCanvas}
          onDelete={deleteSelected}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetZoom={resetZoom}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          canDelete={!!selectedElementId}
          zoomLevel={viewport.scale}
          elementCount={elements.length}
        />
      </div>
    </div>
  )
}

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-md border border-line bg-chrome px-1.5 py-0.5 font-sans text-xs font-bold text-ink">{children}</kbd>
  )
}
