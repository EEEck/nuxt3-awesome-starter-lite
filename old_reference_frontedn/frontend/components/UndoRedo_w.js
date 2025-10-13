/**
 * Undo/Redo Service - Scan Processor Implementation
 * Uses the shared UndoRedo component to avoid code duplication
 * 
 * Simple state management using complete document snapshots for reliable rollback capabilities.
 * Maintains stacks of previous states (undo) and future states (redo) with memory management.
 */
import UndoRedo from '/components/UndoRedo.js';

// Export the shared UndoRedo class for scan processor compatibility
export default UndoRedo;