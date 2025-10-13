/**
 * Undo/Redo Service
 * Exact methods extracted from ScanProcessor prototype for undo/redo functionality
 * 
 * Simple state management using complete document snapshots for reliable rollback capabilities.
 * Maintains stacks of previous states (undo) and future states (redo) with memory management.
 */
import { eventBus } from '/utils/EventBus.js';

export default class UndoRedo {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.setupKeyboardShortcuts();
    }

    /**
     * Save current document state to undo stack (exact copy from line 3463)
     * Call this BEFORE making any modifications to enable undo functionality.
     * 
     * @description Captures complete document state as JSON snapshot and manages stack size.
     * Clears redo stack when new action is performed (standard undo behavior).
     */
    saveState() {
        // Phase 2 Complete: EventBus-only approach
        eventBus.emit('state:request-current', {
            requestId: 'save-state-' + Date.now(),
            callback: (currentState) => {
                if (currentState) {
                    const stateCopy = JSON.parse(JSON.stringify(currentState));
                    this.undoStack.push(stateCopy);
                    this.redoStack = []; // Clear redo stack on new action
                    if (this.undoStack.length > 10) this.undoStack.shift(); // Limit stack size
                    this.updateUndoRedoButtons();
                }
            }
        });
    }

    /**
     * Undo the last document modification (exact copy from line 3480)
     * Restores the previous state from undo stack and updates UI.
     * 
     * @description Moves current state to redo stack, restores previous state from undo stack,
     * and refreshes the entire UI to reflect the restored state.
     */
    undo() {
        if (this.undoStack.length > 0) {
            // Phase 2 Complete: EventBus-only approach
            eventBus.emit('state:request-current', {
                requestId: 'undo-' + Date.now(),
                callback: (currentState) => {
                    if (currentState) {
                        // Save current to redo stack
                        this.redoStack.push(JSON.parse(JSON.stringify(currentState)));
                        
                        // Restore previous state
                        const previousState = this.undoStack.pop();
                        eventBus.emit('state:restore', { data: previousState });
                        
                        // Refresh the UI
                        eventBus.emit('ui:render-cards');
                        this.updateUndoRedoButtons();
                    }
                }
            });
        }
    }

    /**
     * Redo the last undone modification (exact copy from line 3502)
     * Restores the next state from redo stack and updates UI.
     * 
     * @description Moves current state to undo stack, restores next state from redo stack,
     * and refreshes the entire UI to reflect the restored state.
     */
    redo() {
        if (this.redoStack.length > 0) {
            // Phase 2 Complete: EventBus-only approach
            eventBus.emit('state:request-current', {
                requestId: 'redo-' + Date.now(),
                callback: (currentState) => {
                    if (currentState) {
                        // Save current to undo stack
                        this.undoStack.push(JSON.parse(JSON.stringify(currentState)));
                        
                        // Restore next state
                        const nextState = this.redoStack.pop();
                        eventBus.emit('state:restore', { data: nextState });
                        
                        // Refresh the UI
                        eventBus.emit('ui:render-cards');
                        this.updateUndoRedoButtons();
                    }
                }
            });
        }
    }

    /**
     * Update visual state of undo/redo buttons (exact copy from line 3523)
     * 
     * @description Updates button styling, tooltips, and disabled states to reflect
     * current undo/redo capabilities. Provides visual feedback to users.
     */
    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) {
            const canUndo = this.undoStack.length > 0;
            undoBtn.disabled = !canUndo;
            undoBtn.style.opacity = canUndo ? '1' : '0.5';
            undoBtn.style.cursor = canUndo ? 'pointer' : 'not-allowed';
            undoBtn.title = canUndo ? 'Undo last change' : 'Nothing to undo';
        }
        
        if (redoBtn) {
            const canRedo = this.redoStack.length > 0;
            redoBtn.disabled = !canRedo;
            redoBtn.style.opacity = canRedo ? '1' : '0.5';
            redoBtn.style.cursor = canRedo ? 'pointer' : 'not-allowed';
            redoBtn.title = canRedo ? 'Redo last undone change' : 'Nothing to redo';
        }
    }

    /**
     * Revert document to original AI-extracted state (exact copy from line 3551)
     * Restores the initial data from when document was first processed.
     * 
     * @description Compares current data with preserved original data and reverts if different.
     * Provides visual feedback to user. Original data survives save/load cycles via backend storage.
     */
    revertToOriginal() {
        // Phase 2 Complete: EventBus-only approach
        eventBus.emit('state:request-original', {
            requestId: 'revert-' + Date.now(),
            callback: (originalData) => {
                if (originalData) {
                    eventBus.emit('state:request-current', {
                        requestId: 'revert-current-' + Date.now(),
                        callback: (currentData) => {
                            if (currentData && JSON.stringify(originalData) !== JSON.stringify(currentData)) {
                                // Save current state before reverting
                                this.saveState();
                                
                                // Revert to original data
                                eventBus.emit('state:update', { data: originalData });
                                eventBus.emit('ui:render-cards');
                                this.updateUndoRedoButtons();
                                
                                // Show feedback
                                eventBus.emit('ui:show-revert-feedback', { success: true });
                                console.log('Reverted to original AI-extracted data');
                            } else {
                                // Already original
                                eventBus.emit('ui:show-revert-feedback', { success: false });
                            }
                        }
                    });
                }
            }
        });
    }

    /**
     * Initialize undo/redo stacks
     */
    initialize() {
        this.undoStack = [];
        this.redoStack = [];
    }

    /**
     * Get undo stack length
     */
    getUndoStackLength() {
        return this.undoStack.length;
    }

    /**
     * Get redo stack length
     */
    getRedoStackLength() {
        return this.redoStack.length;
    }

    /**
     * Clear all stacks
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.updateUndoRedoButtons();
    }

    /**
     * Setup keyboard shortcuts for undo/redo
     * Shared functionality for all pages using this service
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.undo();
                } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    this.redo();
                }
            }
        });
    }
}