# OMR Calibration Tool

A professional-grade, visual calibration tool for Optical Mark Recognition (OMR) sheets. Built with React, TypeScript, and Konva, this tool allows users to map physical bubbles on an OMR sheet image to digital configurations with pixel precision.

## ✨ Features

- 🖼️ **Visual Workbench**: Upload OMR sheet images and interact directly with them using a canvas-based editor.
- 📐 **Precision Calibration**: 
  - **Origin Setting**: Define the starting point of any question block.
  - **Gap Detection**: Visually set horizontal/vertical gaps between bubbles and labels.
- 🧩 **Question Types**: Supports Multiple Choice (MCQ4) and Integer-based question blocks.
- 📤 **Configuration Export**: Export your calibrated settings as a structured JSON file compatible with OMR processing engines.
- 🎨 **Modern Interface**: Clean, dark-mode UI with smooth animations and intuitive sidebar controls.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Graphics**: [Konva](https://konvajs.org/) & [react-konva](https://github.com/konvajs/react-konva)
- **Styling**: [CSS Modules / Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/omr-calibration-tool.git
   cd omr-calibration-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 📖 Usage Guide

1. **Upload**: Select an image of your OMR sheet.
2. **Add Block**: Choose a question type (MCQ4 or Integer) from the sidebar.
3. **Calibrate**:
   - Click the **top-left bubble** to set the origin.
   - Click the **next bubble** to set the gap between bubbles.
   - Click the **next label** to set the gap between question rows/columns.
4. **Export**: Once all blocks are mapped, click "Export Config" to download the `omr-config.json`.

## 📄 License

MIT © [Sebas](https://github.com/Sebas)
