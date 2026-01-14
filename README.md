# Digital Whiteboard App

A feature-rich digital whiteboard application built with Next.js, React, and HTML Canvas API. Create drawings, diagrams, flowcharts, and annotations with an intuitive interface.

## Author

**Zain Aftab**

## Features

### Drawing Tools
- **Pen** - Smooth freehand drawing with quadratic curve interpolation
- **Highlighter** - Semi-transparent wide strokes for marking up content
- **Shapes** - Rectangle, Circle, Line, and Arrow tools
- **Text** - Click to place text with customizable font size
- **Sticky Notes** - Colorful notes with 6 color options and text wrapping
- **Eraser** - Remove specific elements without clearing the canvas

### Selection & Editing
- **Selection Tool** - Click to select individual elements
- **Move Elements** - Drag selected elements to reposition
- **Delete Elements** - Remove selected elements with Delete/Backspace key

### Canvas Controls
- **Color Picker** - Choose from presets or use custom colors
- **Stroke Width** - Adjustable from 1-50px
- **Opacity** - Control transparency from 10-100%
- **Fill Mode** - Toggle solid fill for shapes
- **Zoom** - Zoom in/out with smooth scaling (10%-300%)

### History & Export
- **Undo/Redo** - Unlimited history with Ctrl+Z / Ctrl+Y
- **PNG Export** - Save your canvas as an image
- **Auto-Save** - Drawings persist to localStorage automatically

### Display Options
- **Grid Toggle** - Show/hide background grid
- **Dark/Light Mode** - Switch between themes

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| V | Selection Tool |
| P | Pen Tool |
| H | Highlighter |
| R | Rectangle |
| C | Circle |
| L | Line |
| A | Arrow |
| T | Text |
| S | Sticky Note |
| E | Eraser |
| + | Zoom In |
| - | Zoom Out |
| 0 | Reset Zoom |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Delete | Remove Selected |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS v4
- **Canvas:** HTML5 Canvas API
- **State Management:** React useState/useRef
- **Persistence:** localStorage

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## License

MIT
