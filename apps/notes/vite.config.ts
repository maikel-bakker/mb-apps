import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      components: path.resolve(__dirname, 'src/components'),
      utils: path.resolve(__dirname, 'src/utils'),
      lib: path.resolve(__dirname, 'src/lib'),
      styles: path.resolve(__dirname, 'src/styles'),
      stores: path.resolve(__dirname, 'src/stores'),
    },
  },
});
