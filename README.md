# TypeScript Project

A modern TypeScript project with Node.js.

## Features

- TypeScript with strict type checking
- Source maps for debugging
- Hot reloading with nodemon
- Build process with output to `dist/` directory
- Comprehensive Git ignore rules

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd fp-oneoff
```

2. Install dependencies:
```bash
npm install
```

### Development

Run the development server with hot reloading:
```bash
npm run dev
```

### Building

Compile TypeScript to JavaScript:
```bash
npm run build
```

### Running

Run the compiled JavaScript:
```bash
npm start
```

## Project Structure

```
fp-oneoff/
├── src/           # TypeScript source files
│   └── index.ts   # Main entry point
├── dist/          # Compiled JavaScript (generated)
├── node_modules/  # Dependencies (generated)
├── package.json   # Project configuration
├── tsconfig.json  # TypeScript configuration
├── .gitignore     # Git ignore rules
└── README.md      # This file
```

## Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled JavaScript
- `npm run clean` - Clean build artifacts

## TypeScript Configuration

The project uses strict TypeScript settings with:
- ES2020 target
- CommonJS modules
- Source maps enabled
- Declaration files generated
- Strict type checking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

ISC
