# base shared config
echo {^
  "compilerOptions": {^
    "target": "ES2022",^
    "module": "ESNext",^
    "moduleResolution": "Bundler",^
    "strict": true,^
    "skipLibCheck": true,^
    "declaration": true,^
    "declarationMap": true,^
    "outDir": "dist",^
    "downlevelIteration": true,^
    "lib": ["ES2022"]^
  }^
} > tsconfig.base.json

# app/lib config
echo {^
  "extends": "./tsconfig.base.json",^
  "compilerOptions": { "types": ["node"] },^
  "include": ["src/**/*.ts","vitest.config.*"],^
  "exclude": ["**/__tests__/**","test/**","dist/**","node_modules/**"]^
} > tsconfig.src.json

# tests config
echo {^
  "extends": "./tsconfig.base.json",^
  "compilerOptions": { "types": ["vitest/globals","vitest","node"] },^
  "include": ["**/*.test.ts","test/**/*.ts","vitest.config.*"],^
  "exclude": ["dist/**","node_modules/**"]^
} > tsconfig.test.json

# slim down the root config to point to src
echo {^
  "extends": "./tsconfig.src.json"^
} > tsconfig.json
