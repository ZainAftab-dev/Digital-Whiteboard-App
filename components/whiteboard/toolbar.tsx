"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  Palette,
} from "lucide-react"
import type { Tool } from "@/lib/whiteboard-types"

const PRESET_COLORS = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
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
  showGrid: boolean
  setShowGrid: (show: boolean) => void
  isDarkMode: boolean
  setIsDarkMode: (dark: boolean) => void
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  onExport: () => void
  canUndo: boolean
  canRedo: boolean
}

export function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  fontSize,
  setFontSize,
  showGrid,
  setShowGrid,
  isDarkMode,
  setIsDarkMode,
  onUndo,
  onRedo,
  onClear,
  onExport,
  canUndo,
  canRedo,
}: ToolbarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex items-center gap-1 p-2 border-b border-border bg-card flex-wrap">
        <div className="flex items-center gap-2 px-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Pencil className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground hidden sm:inline">Whiteboard</span>
        </div>

        <Separator orientation="vertical" className="h-8 mx-2 hidden sm:block" />

        <div className="flex items-center gap-1">
          <ToolButton
            icon={<Pencil className="w-4 h-4" />}
            label="Pen"
            isActive={tool === "pen"}
            onClick={() => setTool("pen")}
          />
          <ToolButton
            icon={<Square className="w-4 h-4" />}
            label="Rectangle"
            isActive={tool === "rectangle"}
            onClick={() => setTool("rectangle")}
          />
          <ToolButton
            icon={<Circle className="w-4 h-4" />}
            label="Circle"
            isActive={tool === "circle"}
            onClick={() => setTool("circle")}
          />
          <ToolButton
            icon={<Minus className="w-4 h-4" />}
            label="Line"
            isActive={tool === "line"}
            onClick={() => setTool("line")}
          />
          <ToolButton
            icon={<Type className="w-4 h-4" />}
            label="Text"
            isActive={tool === "text"}
            onClick={() => setTool("text")}
          />
          <ToolButton
            icon={<Eraser className="w-4 h-4" />}
            label="Eraser"
            isActive={tool === "eraser"}
            onClick={() => setTool("eraser")}
          />
        </div>

        <Separator orientation="vertical" className="h-8 mx-2 hidden sm:block" />

        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative bg-transparent">
                  <Palette className="w-4 h-4" />
                  <div
                    className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-border"
                    style={{ backgroundColor: color }}
                  />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Color</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      color === presetColor ? "border-primary scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => setColor(presetColor)}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Custom:</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-8 rounded cursor-pointer"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-14 text-xs bg-transparent">
                  {strokeWidth}px
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Stroke Width</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-48 p-3" align="start">
            <div className="space-y-2">
              <label className="text-sm font-medium">Stroke Width: {strokeWidth}px</label>
              <Slider
                value={[strokeWidth]}
                onValueChange={([value]) => setStrokeWidth(value)}
                min={1}
                max={20}
                step={1}
              />
            </div>
          </PopoverContent>
        </Popover>

        {tool === "text" && (
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-16 text-xs bg-transparent">
                    {fontSize}pt
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Font Size</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-48 p-3" align="start">
              <div className="space-y-2">
                <label className="text-sm font-medium">Font Size: {fontSize}pt</label>
                <Slider value={[fontSize]} onValueChange={([value]) => setFontSize(value)} min={8} max={72} step={1} />
              </div>
            </PopoverContent>
          </Popover>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <ToolButton
            icon={<Grid3X3 className="w-4 h-4" />}
            label="Toggle Grid"
            isActive={showGrid}
            onClick={() => setShowGrid(!showGrid)}
          />
          <ToolButton
            icon={isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            label="Toggle Theme"
            isActive={false}
            onClick={() => setIsDarkMode(!isDarkMode)}
          />

          <Separator orientation="vertical" className="h-8 mx-2 hidden sm:block" />

          <ToolButton
            icon={<Undo2 className="w-4 h-4" />}
            label="Undo (Ctrl+Z)"
            isActive={false}
            onClick={onUndo}
            disabled={!canUndo}
          />
          <ToolButton
            icon={<Redo2 className="w-4 h-4" />}
            label="Redo (Ctrl+Y)"
            isActive={false}
            onClick={onRedo}
            disabled={!canRedo}
          />

          <Separator orientation="vertical" className="h-8 mx-2 hidden sm:block" />

          <ToolButton
            icon={<Trash2 className="w-4 h-4" />}
            label="Clear Canvas"
            isActive={false}
            onClick={onClear}
            variant="destructive"
          />
          <ToolButton icon={<Download className="w-4 h-4" />} label="Export PNG" isActive={false} onClick={onExport} />
        </div>
      </div>
    </TooltipProvider>
  )
}

interface ToolButtonProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
  disabled?: boolean
  variant?: "default" | "destructive"
}

function ToolButton({ icon, label, isActive, onClick, disabled, variant }: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "default" : variant === "destructive" ? "destructive" : "ghost"}
          size="icon"
          onClick={onClick}
          disabled={disabled}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
