"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineApplicationDockerfileFactory = exports.DEFAULT_ENTRY_FILE = exports.DEFAULT_IMAGE = void 0;
exports.DEFAULT_IMAGE = 'node:24.18.0-bookworm-slim';
exports.DEFAULT_ENTRY_FILE = 'dist/main.js';
class InlineApplicationDockerfileFactory {
    static create(options) {
        options.image ??= exports.DEFAULT_IMAGE;
        let entryFile;
        if (options.entryFile) {
            entryFile = options.entryFile.replace(/\\/g, '/');
        }
        else {
            entryFile = exports.DEFAULT_ENTRY_FILE;
        }
        const platform = options.cpuArchitecture === 'arm64' ? 'linux/arm64' : 'linux/amd64';
        return `FROM --platform=${platform} ${options.image}
WORKDIR /usr/src/app
COPY package*.json ./
RUN set -eux; \
    for i in 1 2 3; do \
      apt-get update && apt-get install -y --no-install-recommends curl && break; \
      echo "apt-get attempt $i failed (possibly a stale package index), retrying..." >&2; \
      rm -rf /var/lib/apt/lists/*; \
      sleep 5; \
    done; \
    command -v curl; \
    rm -rf /var/lib/apt/lists/*
RUN npm install --no-audit --legacy-peer-deps
COPY . .
RUN npm run build ${options.applicationName || ''}
RUN if [ ! -f "${entryFile}.js" ]; then \
      echo "ERROR: File '${entryFile}.js' not found." >&2; \
      echo "Please ensure the entry file exists or adjust the path according to your 'nest-cli.json' configuration." >&2; \
      echo "Expected default entry files are:" >&2; \
      echo "  - dist/main.js" >&2; \
      echo "  - dist/apps/<name>/main.js" >&2; \
      echo "If you are using a custom entry file, use the '--entry-file' flag to specify it, or use a custom 'Dockerfile' (--dockerfile flag)." >&2; \
      exit 1; \
    fi
CMD [ "node", "${entryFile}" ]`;
    }
}
exports.InlineApplicationDockerfileFactory = InlineApplicationDockerfileFactory;
