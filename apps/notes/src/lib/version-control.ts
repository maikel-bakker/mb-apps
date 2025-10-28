import { createPatch, applyPatch } from 'diff';
import type { Patch } from '../types';

export default class VersionControl {
  private initialVersion: string;
  private currentVersion: string;
  private patches: Patch[];

  constructor(initialVersion: string, patches: Patch[] = []) {
    this.initialVersion = initialVersion;
    this.currentVersion = initialVersion;
    this.patches = patches;

    this.constructLatestVersion();
  }

  get initial() {
    return this.initialVersion;
  }

  get current() {
    return this.currentVersion;
  }

  get allPatches() {
    return this.patches;
  }

  public commitPatch(newContent: string): string {
    const patch = this.createPatch(newContent);
    const patchId = crypto.randomUUID();
    this.patches.push({
      id: patchId,
      date: new Date().toISOString(),
      patch,
    });
    this.currentVersion = newContent;
    return patchId;
  }

  public getCurrentVersion(): string {
    return this.currentVersion;
  }

  public getVersion(patchId: Patch['id']) {
    let version = this.initialVersion;
    for (const { id, patch } of this.patches) {
      const result = applyPatch(version, patch);
      if (result === false) {
        throw new Error('Failed to apply patch');
      }
      version = result;
      if (id === patchId) {
        return version;
      }
    }
    throw new Error('Patch ID not found');
  }

  private createPatch(newContent: string) {
    const patch = createPatch('StringPatch', this.currentVersion, newContent);
    return patch;
  }

  private constructLatestVersion() {
    // loop through all patches and apply them to the initial version
    let version = this.initialVersion;
    for (const { patch } of this.patches) {
      const result = applyPatch(version, patch);
      if (result === false) {
        throw new Error('Failed to apply patch');
      }
      version = result;
    }

    this.currentVersion = version;

    return version;
  }
}
