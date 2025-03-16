# Pautakan 2025

### Quickstart

1. Install packages with `npm install`.
2. Start the development environment with `npm run dev`.
3. To package the app, run `npm run build`.

This project uses Electron, React, TailwindCSS, and SQLite3.

### Guide

The backend of this application can be found in the `electron` folder. This is home to the main process, where operations such as database initialization and interprocess communication is defined. Everything else is part of the renderer process, or the frontend. Frontend files can be found in the `src` folder.

### Existing Issues

- [x] The control window's HTML isn't rendered in the packaged version of the app.
- [x] Fonts don't render in the packaged version of the app.
- [x] The DS-Digital font isn't rendering in any version.
