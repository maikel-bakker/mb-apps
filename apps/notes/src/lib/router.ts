export const routes = {
  notes: '/notes',
  note: (id: string) => `/note/${id}`,
};

export function navigateTo(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function getNoteId() {
  // search for notes in window.location
  const pathParts = window.location.pathname.split('/');
  const notesPath = pathParts.findIndex((part) => part === 'notes');
  if (notesPath === -1) return undefined;

  return pathParts[notesPath + 1] || undefined;
}
