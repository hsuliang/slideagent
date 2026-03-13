import './style.css';
import Sortable from 'sortablejs';
import jsyaml from 'js-yaml';

// Re-expose libraries to window for legacy modules
window.Sortable = Sortable;
window.jsyaml = jsyaml;

// Import legacy modules
// Note: We'll need to update these files to use export/import
import { App } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
