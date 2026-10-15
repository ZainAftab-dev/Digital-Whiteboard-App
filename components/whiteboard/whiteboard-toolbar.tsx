"use client"

import type { ReactNode } from "react"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Pencil,
  Square,
  Circle,
  Minus,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Grid3X3,
  Sun,
  Moon,
  MousePointer2,
  MoveRight,
  Highlighter,
  StickyNote,
  ZoomIn,
  ZoomOut,
  X,
  Plus,
  PaintBucket,
} from "lucide-react"
import type { Tool } from "@/lib/whiteboard-types"
import { INK } from "@/lib/whiteboard-types"

const PRESET_COLORS = [
  { value: INK, name: "Ink" },
  { value: "#e5484d", name: "Red" },
  { value: "#f76b15", name: "Orange" },
  { value: "#e2a400", name: "Yellow" },
  { value: "#30a46c", name: "Green" },
  { value: "#0d9488", name: "Teal" },
  { value: "#2d4fe0", name: "Blue" },
  { value: "#8e4ec6", name: "Purple" },
]

const STROKES = [
  { value: 2, name: "Thin" },
  { value: 4, name: "Medium" },
  { value: 8, name: "Bold" },
  { value: 14, name: "Extra bold" },
]

type ToolDef = { id: Tool; label: string; key: string; icon: ReactNode }

const TOOL_GROUPS: ToolDef[][] = [
  [{ id: "select", label: "Select", key: "V", icon: <MousePointer2 /> }],
  [
    { id: "pen", label: "Pen", key: "P", icon: <Pencil /> },
    { id: "highlighter", label: "Highlighter", key: "H", icon: <Highlighter /> },
  ],
  [
    { id: "rectangle", label: "Rectangle", key: "R", icon: <Square /> },
    { id: "circle", label: "Circle", key: "C", icon: <Circle /> },
    { id: "line", label: "Line", key: "L", icon: <Minus /> },
    { id: "arrow", label: "Arrow", key: "A", icon: <MoveRight /> },
  ],
  [
    { id: "text", label: "Text", key: "T", icon: <Type /> },
    { id: "sticky", label: "Sticky note", key: "S", icon: <StickyNote /> },
  ],
  [{ id: "eraser", label: "Eraser", key: "E", icon: <Eraser /> }],
]

interface ToolbarProps {
  tool: Tool
  setTool: (tool: Tool) => void
  color: string
  setColor: (color: string) => void
  strokeWidth: number
  setStrokeWidth: (width: number) => void
  fontSize: number
  setFontSize: (size: number) => void
  opacity: number
  setOpacity: (opacity: number) => void
  fillShapes: boolean
  setFillShapes: (fill: boolean) => void
  showGrid: boolean
  setShowGrid: (show: boolean) => void
  isDarkMode: boolean
  setIsDarkMode: (dark: boolean) => void
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  onExport: () => void
  onDelete: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  canUndo: boolean
  canRedo: boolean
  canDelete: boolean
  zoomLevel: number
  elementCount: number
}

const panel = "rounded-2xl border border-line bg-chrome/95 shadow-[0_1px_2px_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.18)] backdrop-blur"

export function WhiteboardToolbar(props: ToolbarProps) {
  const {
    tool,
    setTool,
    color,
    setColor,
    strokeWidth,
    setStrokeWidth,
    fontSize,
    setFontSize,
    opacity,
    setOpacity,
    fillShapes,
    setFillShapes,
    showGrid,
    setShowGrid,
    isDarkMode,
    setIsDarkMode,
    onUndo,
    onRedo,
    onClear,
    onExport,
    onDelete,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    canUndo,
    canRedo,
    canDelete,
    zoomLevel,
    elementCount,
  } = props

  const isShape = tool === "rectangle" || tool === "circle"
  const showStyle = tool !== "select" && tool !== "eraser" && tool !== "sticky"

  return (
    <TooltipProvider delayDuration={250}>
      {/* Top-left: name + save state */}
      <div className={`${panel} pointer-events-auto absolute left-3 top-3 hidden items-center gap-3 py-2 pl-2 pr-4 md:flex`}>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-white">
          <Pencil className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden="true" />
        </span>
        <div className="leading-tight">
          <h1 className="font-display text-lg font-semibold tracking-tight text-ink">Whiteboard</h1>
          <p className="text-xs font-medium text-graphite">
            {elementCount === 0 ? "Empty board" : `${elementCount} item${elementCount === 1 ? "" : "s"} · saved in this browser`}
          </p>
        </div>
      </div>

      {/* Left: tool rail */}
      <nav
        aria-label="Drawing tools"
        className={`${panel} pointer-events-auto absolute left-3 top-1/2 flex -translate-y-1/2 flex-col gap-1 p-1.5`}
      >
        {TOOL_GROUPS.map((group, gi) => (
          <div key={gi} className={`flex flex-col gap-1 ${gi > 0 ? "border-t border-line pt-1" : ""}`}>
            {group.map((t) => (
              <IconButton
                key={t.id}
                label={t.label}
                shortcut={t.key}
                active={tool === t.id}
                onClick={() => setTool(t.id)}
                side="right"
              >
                {t.icon}
              </IconButton>
            ))}
          </div>
        ))}
      </nav>

      {/* Top-right: history, view and file actions */}
      <div className={`${panel} pointer-events-auto absolute right-3 top-3 flex max-w-[calc(100vw-1.5rem)] items-center gap-1 overflow-x-auto p-1.5`}>
        <IconButton label="Undo" shortcut="Ctrl Z" onClick={onUndo} disabled={!canUndo}>
          <Undo2 />
        </IconButton>
        <IconButton label="Redo" shortcut="Ctrl Y" onClick={onRedo} disabled={!canRedo}>
          <Redo2 />
        </IconButton>
        <Divider />
        <IconButton label={showGrid ? "Hide grid" : "Show grid"} active={showGrid} onClick={() => setShowGrid(!showGrid)}>
          <Grid3X3 />
        </IconButton>
        <IconButton label={isDarkMode ? "Light board" : "Dark board"} onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? <Sun /> : <Moon />}
        </IconButton>
        <Divider />
        <IconButton label="Delete selected" shortcut="Del" onClick={onDelete} disabled={!canDelete}>
          <X />
        </IconButton>
        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  aria-label="Clear board"
                  disabled={elementCount === 0}
                  className="grid h-10 w-10 place-items-center rounded-xl text-graphite transition-colors hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-35 [&_svg]:h-5 [&_svg]:w-5"
                >
                  <Trash2 />
                </button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Clear board</TooltipContent>
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear the whole board?</AlertDialogTitle>
              <AlertDialogDescription>
                All {elementCount} items will be removed. You can still bring them back with Undo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep drawing</AlertDialogCancel>
              <AlertDialogAction onClick={onClear} className="bg-danger text-white hover:bg-danger/90">
                Clear board
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <button
          type="button"
          onClick={onExport}
          className="ml-1 flex h-10 shrink-0 items-center gap-2 rounded-xl bg-accent px-3 sm:px-4 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Export PNG</span>
        </button>
      </div>

      {/* Bottom-centre: style bar for the current tool */}
      {showStyle && (
        <div
          role="toolbar"
          aria-label="Style"
          className={`${panel} pointer-events-auto absolute bottom-3 left-1/2 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-2 overflow-x-auto p-1.5`}
        >
          <div className="flex items-center gap-1" role="radiogroup" aria-label="Colour">
            {PRESET_COLORS.map((c) => {
              const active = color.toLowerCase() === c.value.toLowerCase()
              return (
                <button
                  key={c.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => setColor(c.value)}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-transform hover:scale-110 ${
                    active ? "ring-2 ring-accent ring-offset-2 ring-offset-chrome" : ""
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full border border-black/10 ${c.value === INK ? "bg-ink" : ""}`}
                    style={c.value === INK ? undefined : { backgroundColor: c.value }}
                  />
                </button>
              )
            })}
            <label
              className="relative grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-graphite hover:bg-hover"
              title="Custom colour"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Custom colour</span>
              <input
                type="color"
                value={color === INK ? "#1d2125" : color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          </div>

          <Divider />

          {tool === "text" ? (
            <div className="flex items-center gap-3 px-2">
              <span className="text-sm font-semibold text-graphite">Size</span>
              <Slider
                aria-label="Font size"
                className="w-32"
                value={[fontSize]}
                onValueChange={([v]) => setFontSize(v)}
                min={8}
                max={72}
                step={1}
              />
              <span className="w-10 text-right text-sm font-semibold tabular-nums text-ink">{fontSize}px</span>
            </div>
          ) : (
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Stroke width">
              {STROKES.map((s) => {
                const active = strokeWidth === s.value
                return (
                  <button
                    key={s.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={s.name}
                    title={`${s.name} (${s.value}px)`}
                    onClick={() => setStrokeWidth(s.value)}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors ${
                      active ? "bg-accent-soft text-accent" : "text-graphite hover:bg-hover"
                    }`}
                  >
                    <span className="block rounded-full bg-current" style={{ width: 22, height: Math.max(2, s.value / 1.6) }} />
                  </button>
                )
              })}
            </div>
          )}

          {isShape && (
            <>
              <Divider />
              <IconButton
                label={fillShapes ? "Outline only" : "Fill shape"}
                active={fillShapes}
                onClick={() => setFillShapes(!fillShapes)}
              >
                <PaintBucket />
              </IconButton>
            </>
          )}

          <Divider />

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="h-9 shrink-0 rounded-xl px-3 text-sm font-semibold tabular-nums text-ink hover:bg-hover"
                aria-label={`Opacity ${opacity}%`}
              >
                {opacity}%
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-60 rounded-2xl p-4">
              <p className="mb-3 text-sm font-semibold">Opacity · {opacity}%</p>
              <Slider value={[opacity]} onValueChange={([v]) => setOpacity(v)} min={10} max={100} step={5} />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Bottom-right: zoom */}
      <div className={`${panel} pointer-events-auto absolute bottom-3 right-3 hidden items-center gap-0.5 p-1.5 sm:flex`}>
        <IconButton label="Zoom out" shortcut="−" onClick={onZoomOut}>
          <ZoomOut />
        </IconButton>
        <button
          type="button"
          onClick={onResetZoom}
          title="Reset zoom (0)"
          className="h-10 w-14 rounded-xl text-sm font-semibold tabular-nums text-ink hover:bg-hover"
        >
          {Math.round(zoomLevel * 100)}%
        </button>
        <IconButton label="Zoom in" shortcut="+" onClick={onZoomIn}>
          <ZoomIn />
        </IconButton>
      </div>
    </TooltipProvider>
  )
}

function Divider() {
  return <span aria-hidden="true" className="mx-0.5 h-6 w-px shrink-0 bg-line" />
}

interface IconButtonProps {
  label: string
  shortcut?: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
  side?: "top" | "right" | "bottom" | "left"
}

function IconButton({ label, shortcut, active, disabled, onClick, children, side = "bottom" }: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-pressed={active}
          onClick={onClick}
          disabled={disabled}
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors disabled:pointer-events-none disabled:opacity-35 [&_svg]:h-5 [&_svg]:w-5 ${
            active ? "bg-accent text-white" : "text-graphite hover:bg-hover hover:text-ink"
          }`}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="flex items-center gap-2">
        {label}
        {shortcut && <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-sans text-[11px] font-semibold">{shortcut}</kbd>}
      </TooltipContent>
    </Tooltip>
  )
}
