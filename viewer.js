// viewer.js
// This script provides Zoom, Pan, and Image Modal functionality for the SLD

(function() {
    // --- 1. Inject CSS for Modal ---
    if (!document.getElementById('sld-viewer-style')) {
        const style = document.createElement('style');
        style.id = 'sld-viewer-style';
        style.innerHTML = `
            .image-modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100vw; height: 100vh; background-color: rgba(0,0,0,0.8); align-items: center; justify-content: center; overflow: hidden; }
            .image-modal-content { max-width: 90%; max-height: 90%; transform-origin: center center; cursor: grab; object-fit: contain; }
            .image-modal-close { position: absolute; top: 20px; right: 35px; color: #f1f1f1; font-size: 40px; font-weight: bold; cursor: pointer; user-select: none; z-index: 1001; }
            .image-modal-close:hover, .image-modal-close:focus { color: #bbb; text-decoration: none; cursor: pointer; }
            .text-clickable { cursor: pointer; transition: all 0.2s; }
            .text-clickable:hover { filter: drop-shadow(0px 0px 5px rgba(0,0,255,0.8)); opacity: 0.7; }
        `;
        document.head.appendChild(style);
    }

    // --- 2. Inject Modal HTML ---
    if (!document.getElementById('imageModal')) {
        const modalHtml = `
            <div id="imageModal" class="image-modal">
                <span class="image-modal-close">&times;</span>
                <img class="image-modal-content" id="modalImage" alt="Image not found">
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // --- 3. Zoom, Pan & Modal Logic ---
    const canvasArt = document.querySelector('.canvas-art');
    if (!canvasArt) return;

    let scale = 1;
    let panning = false;
    let pointX = 0;
    let pointY = 0;
    let startX = 0;
    let startY = 0;

    function setTransform() {
        canvasArt.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
        canvasArt.style.transformOrigin = 'center center';
    }

    // Mouse Wheel Zoom (Canvas)
    document.body.addEventListener('wheel', (e) => {
        // Only zoom canvas if modal is not open
        if (document.getElementById('imageModal').style.display === 'flex') return;
        
        e.preventDefault();
        const xs = (e.clientX - pointX) / scale;
        const ys = (e.clientY - pointY) / scale;
        const delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
        if (delta > 0) {
            scale *= 1.1;
        } else {
            scale /= 1.1;
        }
        pointX = e.clientX - xs * scale;
        pointY = e.clientY - ys * scale;
        setTransform();
    }, { passive: false });

    // Mouse Drag Pan (Canvas)
    document.body.addEventListener('mousedown', (e) => {
        if (e.target.closest('.image-modal') || e.target.closest('.text-clickable')) return;
        e.preventDefault();
        startX = e.clientX - pointX;
        startY = e.clientY - pointY;
        panning = true;
        document.body.style.cursor = 'grabbing';
    });

    document.body.addEventListener('mousemove', (e) => {
        if (!panning) return;
        e.preventDefault();
        pointX = e.clientX - startX;
        pointY = e.clientY - startY;
        setTransform();
    });

    document.body.addEventListener('mouseup', () => {
        panning = false;
        document.body.style.cursor = 'default';
    });

    document.body.addEventListener('mouseleave', () => {
        panning = false;
        document.body.style.cursor = 'default';
    });

    // --- 4. Modal Logic ---
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.image-modal-close');

    let modalScale = 1;
    let modalPanning = false;
    let modalPointX = 0;
    let modalPointY = 0;
    let modalStartX = 0;
    let modalStartY = 0;

    function setModalTransform() {
        modalImg.style.transform = `translate(${modalPointX}px, ${modalPointY}px) scale(${modalScale})`;
    }

    function resetModal() {
        modal.style.display = 'none';
        modalImg.src = '';
        modalScale = 1;
        modalPointX = 0;
        modalPointY = 0;
        setModalTransform();
    }

    closeBtn.onclick = resetModal;

    let isDraggingModal = false;

    modal.addEventListener('mousedown', (e) => {
        isDraggingModal = false;
        if (e.target === closeBtn) return;
        e.preventDefault();
        e.stopPropagation();
        modalStartX = e.clientX - modalPointX;
        modalStartY = e.clientY - modalPointY;
        modalPanning = true;
        modalImg.style.cursor = 'grabbing';
    });

    modal.addEventListener('mousemove', (e) => {
        if (!modalPanning) return;
        isDraggingModal = true;
        e.preventDefault();
        e.stopPropagation();
        modalPointX = e.clientX - modalStartX;
        modalPointY = e.clientY - modalStartY;
        setModalTransform();
    });

    modal.addEventListener('mouseup', (e) => {
        modalPanning = false;
        modalImg.style.cursor = 'grab';
    });

    modal.addEventListener('mouseleave', () => {
        modalPanning = false;
        modalImg.style.cursor = 'grab';
    });

    modal.addEventListener('click', (e) => {
        if (isDraggingModal) return; // Ignore click if we were dragging
        if (e.target === modal) {
            resetModal();
        }
    });

    modal.addEventListener('wheel', (e) => {
        if (modal.style.display !== 'flex') return;
        e.preventDefault();
        e.stopPropagation();
        const xs = (e.clientX - modalPointX) / modalScale;
        const ys = (e.clientY - modalPointY) / modalScale;
        const delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
        if (delta > 0) {
            modalScale *= 1.1;
        } else {
            modalScale /= 1.1;
        }
        modalPointX = e.clientX - xs * modalScale;
        modalPointY = e.clientY - ys * modalScale;
        setModalTransform();
    }, { passive: false });

    // --- 5. Add Click logic to all text elements in canvas-art ---
    const textElements = Array.from(canvasArt.querySelectorAll('div')).filter(div => {
        return !div.querySelector('svg') && div.textContent.trim().length > 0;
    });

    textElements.forEach(el => {
        el.classList.add('text-clickable');
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            let textName = el.textContent.replace(/\n/g, ' ').trim().replace(/\s+/g, ' ');
            textName = textName.trim();
            if (!textName) return;

            // Try common extensions dynamically in the parent SLD/images folder or current images folder
            const imgPaths = [
                `../SLD/images/${textName}.jpg`,
                `../SLD/images/${textName}.png`,
                `../SLD/images/${textName}.jpeg`,
                `images/${textName}.jpg`,
                `images/${textName}.png`,
                `images/${textName}.jpeg`
            ];
            
            let currentPathIndex = 0;

            modal.style.display = 'flex';
            modalImg.src = imgPaths[currentPathIndex];

            modalImg.onerror = function() {
                currentPathIndex++;
                if (currentPathIndex < imgPaths.length) {
                    modalImg.src = imgPaths[currentPathIndex];
                } else {
                    // All failed
                    console.log("Image not found for:", textName);
                    // Provide a nice fallback or simply do nothing
                }
            };
        });
    });
})();
