import './style.css';
import Sortable from 'sortablejs';

// Re-expose Sortable to window if needed by legacy scripts, 
// though we should ideally refactor them to import it.
window.Sortable = Sortable;

// Import legacy modules
// Note: We'll need to update these files to use export/import
import { App } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
