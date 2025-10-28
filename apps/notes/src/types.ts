import { createPatch } from 'diff';

export type Note = {
  id: string;
  title: string;
  initialVersion: string;
  patches: Patch[];
};

export type Patch = {
  id: string;
  date: string;
  patch: ReturnType<typeof createPatch>;
};
