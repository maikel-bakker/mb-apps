import { describe, it, expect } from 'vitest';
import VersionControl from './version-control';

describe('VersionControl', () => {
  it('should commit a patch', () => {
    const versionControl = new VersionControl('Hello World');
    const version1 = 'Hello Brave New World';
    versionControl.commitPatch(version1);

    expect(versionControl.current).toBe(version1);
    expect(versionControl.allPatches.length).toBe(1);

    const version2 = 'Hello Brave New World, this is Maikel';
    versionControl.commitPatch(version2);

    expect(versionControl.current).toBe(version2);
    expect(versionControl.allPatches.length).toBe(2);

    const version3 = 'Hello Brave New World, this is Maikel. Welcome!';
    versionControl.commitPatch(version3);

    expect(versionControl.current).toBe(version3);
    expect(versionControl.allPatches.length).toBe(3);
  });

  it('should construct latest version from patches', () => {
    const patches = [
      {
        id: '1',
        date: '2024-06-01T12:00:00Z',
        patch:
          'Index: StringPatch\n===================================================================\n--- StringPatch\n+++ StringPatch\n@@ -1,1 +1,1 @@\n-Hello World\n\\ No newline at end of file\n+Hello Brave New World\n\\ No newline at end of file\n',
      },
      {
        id: '2',
        date: '2024-06-02T12:00:00Z',
        patch:
          'Index: StringPatch\n===================================================================\n--- StringPatch\n+++ StringPatch\n@@ -1,1 +1,1 @@\n-Hello Brave New World\n\\ No newline at end of file\n+Hello Brave New World, this is Maikel\n\\ No newline at end of file\n',
      },
      {
        id: '3',
        date: '2024-06-03T12:00:00Z',
        patch:
          'Index: StringPatch\n===================================================================\n--- StringPatch\n+++ StringPatch\n@@ -1,1 +1,1 @@\n-Hello Brave New World, this is Maikel\n\\ No newline at end of file\n+Hello Brave New World, this is Maikel. Welcome!\n\\ No newline at end of file\n',
      },
    ];

    const versionControl = new VersionControl('Hello World', patches);

    expect(versionControl.current).toBe(
      'Hello Brave New World, this is Maikel. Welcome!',
    );
  });

  it('should get a version from a patch id', () => {
    const patches = [
      {
        id: '1',
        date: '2024-06-01T12:00:00Z',
        patch:
          'Index: StringPatch\n===================================================================\n--- StringPatch\n+++ StringPatch\n@@ -1,1 +1,1 @@\n-Hello World\n\\ No newline at end of file\n+Hello Brave New World\n\\ No newline at end of file\n',
      },
      {
        id: '2',
        date: '2024-06-02T12:00:00Z',
        patch:
          'Index: StringPatch\n===================================================================\n--- StringPatch\n+++ StringPatch\n@@ -1,1 +1,1 @@\n-Hello Brave New World\n\\ No newline at end of file\n+Hello Brave New World, this is Maikel\n\\ No newline at end of file\n',
      },
      {
        id: '3',
        date: '2024-06-03T12:00:00Z',
        patch:
          'Index: StringPatch\n===================================================================\n--- StringPatch\n+++ StringPatch\n@@ -1,1 +1,1 @@\n-Hello Brave New World, this is Maikel\n\\ No newline at end of file\n+Hello Brave New World, this is Maikel. Welcome!\n\\ No newline at end of file\n',
      },
    ];

    const versionControl = new VersionControl('Hello World', patches);

    const versionAfterPatch1 = versionControl.getVersion('1');
    expect(versionAfterPatch1).toBe('Hello Brave New World');

    const versionAfterPatch2 = versionControl.getVersion('2');
    expect(versionAfterPatch2).toBe('Hello Brave New World, this is Maikel');

    const versionAfterPatch3 = versionControl.getVersion('3');
    expect(versionAfterPatch3).toBe(
      'Hello Brave New World, this is Maikel. Welcome!',
    );
  });
});
