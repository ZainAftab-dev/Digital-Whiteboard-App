/** Default pen colour. Drawn as near-black on the light board and near-white on the dark board. */
export const INK = "#1d2125"
export const INK_ON_DARK = "#eceef0"

export type Tool =
  | "select"
  | "pen"
  | "rectangle"
  | "circle"
  | "line"
  | "arrow"
  | "text"
  | "eraser"
  | "highlighter"
  | "sticky"

export interface Point {
  x: number
  y: number
}

export interface BaseElement {
  id: string
  type: string
  color: string
  strokeWidth: number
  opacity?: number
}

export interface PenElement extends BaseElement {
  type: "pen"
  points: Point[]
}

export interface RectangleElement extends BaseElement {
  type: "rectangle"
  x: number
  y: number
  width: number
  height: number
  fill?: boolean
}

export interface CircleElement extends BaseElement {
  type: "circle"
  centerX: number
  centerY: number
  radius: number
  fill?: boolean
}

export interface LineElement extends BaseElement {
  type: "line"
  startX: number
  startY: number
  endX: number
  endY: number
}

export interface ArrowElement extends BaseElement {
  type: "arrow"
  startX: number
  startY: number
  endX: number
  endY: number
}

export interface TextElement extends BaseElement {
  type: "text"
  x: number
  y: number
  text: string
  fontSize: number
}

export interface HighlighterElement extends BaseElement {
  type: "highlighter"
  points: Point[]
}

export interface StickyElement extends BaseElement {
  type: "sticky"
  x: number
  y: number
  width: number
  height: number
  text: string
  backgroundColor: string
}

export type DrawElement =
  | PenElement
  | RectangleElement
  | CircleElement
  | LineElement
  | ArrowElement
  | TextElement
  | HighlighterElement
  | StickyElement

export interface HistoryState {
  elements: DrawElement[]
}

export interface ViewportState {
  scale: number
  offsetX: number
  offsetY: number
}
