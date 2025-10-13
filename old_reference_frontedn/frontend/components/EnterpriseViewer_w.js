/**
 * Enterprise Viewer Service
 * Exact methods extracted from ScanProcessor for image zoom/pan functionality and advanced viewer controls
 */
export default class EnterpriseViewer {
    constructor() {
        this.viewerState = null;
    }

    /**
     * Initialize enterprise viewer (exact copy from line 2564)
     */
    initializeEnterpriseViewer() {
        this.viewerState = {
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
            isDragging: false,
            lastX: 0,
            lastY: 0
        };

        const viewer = document.getElementById('enterprise-viewer');
        const container = document.getElementById('viewer-container');
        const image = document.getElementById('document-image');
        const zoomLevel = document.getElementById('zoom-level');

        if (!viewer || !container || !image) return;

        // Zoom controls
        document.getElementById('zoom-in')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('fit-width')?.addEventListener('click', () => this.fitToWidth());
        document.getElementById('fit-height')?.addEventListener('click', () => this.fitToHeight());
        document.getElementById('reset-zoom')?.addEventListener('click', () => this.resetZoom());

        // Disable mouse wheel zoom - let normal scrolling work
        // viewer.addEventListener('wheel', (e) => {
        //     e.preventDefault();
        //     const delta = e.deltaY > 0 ? -0.1 : 0.1;
        //     this.zoom(this.viewerState.zoom + delta);
        // });

        // Pan functionality
        viewer.addEventListener('mousedown', (e) => {
            if (e.target === image) {
                this.viewerState.isDragging = true;
                this.viewerState.lastX = e.clientX;
                this.viewerState.lastY = e.clientY;
                viewer.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.viewerState.isDragging) {
                const deltaX = e.clientX - this.viewerState.lastX;
                const deltaY = e.clientY - this.viewerState.lastY;
                
                this.viewerState.offsetX += deltaX;
                this.viewerState.offsetY += deltaY;
                
                this.updateImageTransform();
                
                this.viewerState.lastX = e.clientX;
                this.viewerState.lastY = e.clientY;
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.viewerState.isDragging) {
                this.viewerState.isDragging = false;
                viewer.style.cursor = 'grab';
            }
        });

        // Set initial cursor
        image.style.cursor = 'grab';
        
        // Initialize with fit-to-width
        image.onload = () => {
            setTimeout(() => this.fitToWidth(), 100);
        };
    }

    /**
     * Zoom in (exact copy from line 2637)
     */
    zoomIn() {
        this.zoom(this.viewerState.zoom * 1.2);
    }

    /**
     * Zoom out (exact copy from line 2641)
     */
    zoomOut() {
        this.zoom(this.viewerState.zoom / 1.2);
    }

    /**
     * Zoom to specific level (exact copy from line 2645)
     */
    zoom(newZoom) {
        this.viewerState.zoom = Math.max(0.1, Math.min(5, newZoom));
        this.updateImageTransform();
        this.updateZoomDisplay();
    }

    /**
     * Fit to width (exact copy from line 2651)
     */
    fitToWidth() {
        const viewer = document.getElementById('enterprise-viewer');
        const image = document.getElementById('document-image');
        if (!viewer || !image) return;

        const viewerWidth = viewer.clientWidth - 40; // Account for padding
        const imageWidth = image.naturalWidth;
        const scale = viewerWidth / imageWidth;
        
        this.viewerState.zoom = scale;
        this.viewerState.offsetX = 0;
        this.viewerState.offsetY = 0;
        this.updateImageTransform();
        this.updateZoomDisplay();
    }

    /**
     * Fit to height (exact copy from line 2667)
     */
    fitToHeight() {
        const viewer = document.getElementById('enterprise-viewer');
        const image = document.getElementById('document-image');
        if (!viewer || !image) return;

        const viewerHeight = viewer.clientHeight - 40; // Account for padding
        const imageHeight = image.naturalHeight;
        const scale = viewerHeight / imageHeight;
        
        this.viewerState.zoom = scale;
        this.viewerState.offsetX = 0;
        this.viewerState.offsetY = 0;
        this.updateImageTransform();
        this.updateZoomDisplay();
    }

    /**
     * Reset zoom (exact copy from line 2683)
     */
    resetZoom() {
        this.viewerState.zoom = 1;
        this.viewerState.offsetX = 0;
        this.viewerState.offsetY = 0;
        this.updateImageTransform();
        this.updateZoomDisplay();
    }

    /**
     * Update image transform (exact copy from line 2691)
     */
    updateImageTransform() {
        const image = document.getElementById('document-image');
        if (!image) return;

        image.style.transform = `scale(${this.viewerState.zoom}) translate(${this.viewerState.offsetX / this.viewerState.zoom}px, ${this.viewerState.offsetY / this.viewerState.zoom}px)`;
    }

    /**
     * Update zoom display (exact copy from line 2698)
     */
    updateZoomDisplay() {
        const zoomLevel = document.getElementById('zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(this.viewerState.zoom * 100)}%`;
        }
    }

    /**
     * Initialize draggable separator (exact copy from line 2713)
     */
    initializeDraggableSeparator() {
        const separator = document.getElementById('review-separator');
        const leftPanel = document.getElementById('review-left');
        const rightPanel = document.getElementById('review-right');
        const reviewContent = separator?.parentElement;

        if (!separator || !leftPanel || !rightPanel || !reviewContent) {
            return; // Elements not found, skip initialization
        }

        let isDragging = false;
        let startX = 0;
        let startLeftWidth = 0;

        separator.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startLeftWidth = leftPanel.offsetWidth;
            
            separator.classList.add('dragging');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const containerWidth = reviewContent.offsetWidth - 4; // Subtract separator width
            const deltaX = e.clientX - startX;
            const newLeftWidth = startLeftWidth + deltaX;
            
            // Calculate percentages with constraints
            const leftPercent = Math.max(20, Math.min(80, (newLeftWidth / containerWidth) * 100));
            const rightPercent = 100 - leftPercent;
            
            // Update panel widths
            leftPanel.style.width = `${leftPercent}%`;
            rightPanel.style.width = `${rightPercent}%`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                separator.classList.remove('dragging');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }

    /**
     * Toggle mobile mode (exact copy from line 2771)
     */
    toggleMobileMode() {
        const reviewContent = document.querySelector('.review-content');
        const leftPanel = document.getElementById('review-left');
        const rightPanel = document.getElementById('review-right');
        const separator = document.getElementById('review-separator');
        const toggleBtn = document.getElementById('mobile-mode-toggle');

        if (!reviewContent || !leftPanel || !rightPanel) return;

        const isMobileMode = reviewContent.classList.contains('mobile-mode');

        if (isMobileMode) {
            // Switch back to desktop mode
            reviewContent.classList.remove('mobile-mode');
            leftPanel.style.width = '50%';
            rightPanel.style.width = '50%';
            if (separator) separator.style.display = 'block';
            if (toggleBtn) toggleBtn.innerHTML = '<i data-lucide="smartphone" class="btn-icon"></i>Mobile';
        } else {
            // Switch to mobile mode (stacked layout)
            reviewContent.classList.add('mobile-mode');
            leftPanel.style.width = '100%';
            rightPanel.style.width = '100%';
            if (separator) separator.style.display = 'none';
            if (toggleBtn) toggleBtn.innerHTML = '<i data-lucide="monitor" class="btn-icon"></i>Desktop';
        }

        // Update icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Get current viewer state
     */
    getViewerState() {
        return this.viewerState;
    }

    /**
     * Reset viewer state
     */
    resetViewerState() {
        if (this.viewerState) {
            this.viewerState = {
                zoom: 1,
                offsetX: 0,
                offsetY: 0,
                isDragging: false,
                lastX: 0,
                lastY: 0
            };
        }
    }

    /**
     * Cleanup viewer state and events
     */
    cleanup() {
        this.viewerState = null;
        // Note: Event listeners are attached to DOM elements and will be cleaned up when elements are removed
    }
}