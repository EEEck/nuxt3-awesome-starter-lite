/**
 * EventBus - Lightweight pub/sub system for modular architecture
 * 
 * Replaces context parameter passing and direct method calls with event-driven communication.
 * Supports namespaced events, memory management, and debug logging.
 */
export default class EventBus {
    constructor() {
        this.events = new Map();
        this.debugMode = false; // Set to true for event flow debugging
        this.maxListenersPerEvent = 100; // Prevent memory leaks
    }

    /**
     * Subscribe to an event
     * @param {string} eventName - Namespaced event (e.g., 'file:selected', 'ui:render')
     * @param {Function} callback - Function to call when event is emitted
     * @param {Object} options - { once: boolean } for one-time subscriptions
     */
    on(eventName, callback, options = {}) {
        if (typeof callback !== 'function') {
            throw new Error(`EventBus.on(): callback must be a function for event '${eventName}'`);
        }

        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }

        const listeners = this.events.get(eventName);
        
        // Prevent memory leaks
        if (listeners.length >= this.maxListenersPerEvent) {
            console.warn(`EventBus: Maximum listeners (${this.maxListenersPerEvent}) reached for event '${eventName}'`);
            return;
        }

        const listener = {
            callback,
            once: options.once || false,
            id: Math.random().toString(36).substring(2, 9) // Unique ID for removal
        };

        listeners.push(listener);

        if (this.debugMode) {
            console.log(`📡 EventBus: Subscribed to '${eventName}' (${listeners.length} total listeners)`);
        }

        // Return unsubscribe function
        return () => this.off(eventName, listener.id);
    }

    /**
     * Subscribe to an event once (auto-removes after first trigger)
     * @param {string} eventName - Event name
     * @param {Function} callback - Callback function
     */
    once(eventName, callback) {
        return this.on(eventName, callback, { once: true });
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Event name
     * @param {string|Function} callbackOrId - Callback function or listener ID
     */
    off(eventName, callbackOrId) {
        if (!this.events.has(eventName)) return;

        const listeners = this.events.get(eventName);
        const index = listeners.findIndex(listener => 
            listener.callback === callbackOrId || listener.id === callbackOrId
        );

        if (index !== -1) {
            listeners.splice(index, 1);
            
            if (this.debugMode) {
                console.log(`📡 EventBus: Unsubscribed from '${eventName}' (${listeners.length} remaining)`);
            }

            // Clean up empty event arrays
            if (listeners.length === 0) {
                this.events.delete(eventName);
            }
        }
    }

    /**
     * Emit an event to all subscribers
     * @param {string} eventName - Event name
     * @param {*} data - Data to pass to event handlers
     * @param {Object} options - { async: boolean } for async/sync emission
     */
    emit(eventName, data = null, options = {}) {
        if (!this.events.has(eventName)) {
            if (this.debugMode) {
                console.log(`📡 EventBus: No listeners for '${eventName}'`);
            }
            return;
        }

        const listeners = this.events.get(eventName).slice(); // Copy to avoid modification during iteration
        
        if (this.debugMode) {
            console.log(`📡 EventBus: Emitting '${eventName}' to ${listeners.length} listeners`, data);
        }

        const promises = [];

        for (const listener of listeners) {
            try {
                if (options.async) {
                    // Async emission - don't block
                    promises.push(Promise.resolve(listener.callback(data, eventName)));
                } else {
                    // Sync emission
                    listener.callback(data, eventName);
                }

                // Remove one-time listeners
                if (listener.once) {
                    this.off(eventName, listener.id);
                }
            } catch (error) {
                console.error(`EventBus: Error in listener for '${eventName}':`, error);
                console.error('Listener callback:', listener.callback);
                
                // Continue processing other listeners even if one fails
            }
        }

        // Return promise for async emissions
        if (options.async && promises.length > 0) {
            return Promise.allSettled(promises);
        }
    }

    /**
     * Remove all listeners for an event or all events
     * @param {string} eventName - Optional: specific event to clear
     */
    clear(eventName = null) {
        if (eventName) {
            this.events.delete(eventName);
            if (this.debugMode) {
                console.log(`📡 EventBus: Cleared all listeners for '${eventName}'`);
            }
        } else {
            const totalEvents = this.events.size;
            this.events.clear();
            if (this.debugMode) {
                console.log(`📡 EventBus: Cleared all listeners (${totalEvents} events)`);
            }
        }
    }

    /**
     * Get debug information about current subscriptions
     */
    getDebugInfo() {
        const debug = {
            totalEvents: this.events.size,
            totalListeners: 0,
            events: {}
        };

        for (const [eventName, listeners] of this.events) {
            debug.events[eventName] = listeners.length;
            debug.totalListeners += listeners.length;
        }

        return debug;
    }

    /**
     * Enable/disable debug logging
     * @param {boolean} enabled - Enable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`📡 EventBus: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Wait for a specific event to be emitted
     * @param {string} eventName - Event to wait for
     * @param {number} timeout - Optional timeout in milliseconds
     * @returns {Promise} Promise that resolves with event data
     */
    waitFor(eventName, timeout = null) {
        return new Promise((resolve, reject) => {
            let timeoutId = null;
            
            const unsubscribe = this.once(eventName, (data) => {
                if (timeoutId) clearTimeout(timeoutId);
                resolve(data);
            });

            if (timeout) {
                timeoutId = setTimeout(() => {
                    unsubscribe();
                    reject(new Error(`EventBus: Timeout waiting for event '${eventName}' (${timeout}ms)`));
                }, timeout);
            }
        });
    }
}

// Export singleton instance for global use
export const eventBus = new EventBus();

// Enable debug mode in development
if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    eventBus.setDebugMode(true);
}