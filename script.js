let state = {
    leftPlate: [],
    rightPlate: [],
    xValue: 1,
    yValue: 1
};

function adjustVariable(variable, delta) {
    const inputElement = document.getElementById(`${variable}-value`);
    const currentValue = parseInt(inputElement.value);
    const newValue = currentValue + delta;
    
    // Animate the value change
    inputElement.style.transition = 'all 0.2s';
    inputElement.style.transform = delta > 0 ? 'translateY(-2px)' : 'translateY(2px)';
    
    setTimeout(() => {
        inputElement.style.transform = 'translateY(0)';
    }, 200);
    
    inputElement.value = newValue;
    state[`${variable}Value`] = newValue;
    updateBalance();
}

function calculatePlateValue(plate) {
    return plate.reduce((sum, item) => {
        if (item === 'x') return sum + state.xValue;
        if (item === '-x') return sum - state.xValue;
        if (item === 'y') return sum + state.yValue;
        if (item === '-y') return sum - state.yValue;
        if (item === '1') return sum + 1;
        if (item === '-1') return sum - 1;
        return sum;
    }, 0);
}

function updateBalance() {
    const leftValue = calculatePlateValue(state.leftPlate);
    const rightValue = calculatePlateValue(state.rightPlate);
    
    // Update equation display with animation
    const leftDisplay = document.getElementById('leftSide');
    const rightDisplay = document.getElementById('rightSide');
    
    leftDisplay.style.transition = 'all 0.3s';
    rightDisplay.style.transition = 'all 0.3s';
    
    leftDisplay.textContent = leftValue;
    rightDisplay.textContent = rightValue;
    
    // Calculate and apply balance beam rotation
    const beam = document.querySelector('.scale-beam');
    const difference = leftValue - rightValue;
    const maxRotation = 10;
    const rotation = Math.min(Math.max(difference * 2, -maxRotation), maxRotation);
    
    beam.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    
    // Update plates position based on rotation
    const leftPlate = document.querySelector('.left-plate');
    const rightPlate = document.querySelector('.right-plate');
    
    leftPlate.style.transform = `translateY(calc(-50% - ${Math.abs(rotation) * 2}px))`;
    rightPlate.style.transform = `translateY(calc(-50% + ${Math.abs(rotation) * 2}px))`;
}

function createTileElement(value, inPlate = false) {
    const tileElement = document.createElement('div');
    const baseClass = value.replace('-', 'neg-');
    tileElement.className = `tile ${baseClass}-tile`;
    tileElement.textContent = value;
    
    if (inPlate) {
        tileElement.style.transform = 'scale(0.8)';
        tileElement.addEventListener('click', () => {
            tileElement.style.transform = 'scale(0.6)';
            tileElement.style.opacity = '0';
            
            setTimeout(() => {
                const plate = tileElement.parentElement;
                const isLeftPlate = plate.classList.contains('left-plate');
                
                if (isLeftPlate) {
                    state.leftPlate = state.leftPlate.filter(item => item !== value);
                } else {
                    state.rightPlate = state.rightPlate.filter(item => item !== value);
                }
                
                plate.removeChild(tileElement);
                updateBalance();
            }, 200);
        });
    }
    
    return tileElement;
}

function initDragAndDrop() {
    const tiles = document.querySelectorAll('.tile');
    const plates = document.querySelectorAll('.plate');

    tiles.forEach(tile => {
        tile.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', tile.dataset.value);
            tile.style.opacity = '0.5';
        });
        
        tile.addEventListener('dragend', () => {
            tile.style.opacity = '1';
        });
    });

    plates.forEach(plate => {
        plate.addEventListener('dragover', (e) => {
            e.preventDefault();
            plate.style.borderColor = '#4CAF50';
        });
        
        plate.addEventListener('dragleave', () => {
            plate.style.borderColor = '#ddd';
        });

        plate.addEventListener('drop', (e) => {
            e.preventDefault();
            plate.style.borderColor = '#ddd';
            
            const value = e.dataTransfer.getData('text/plain');
            const isLeftPlate = plate.classList.contains('left-plate');
            
            if (isLeftPlate) {
                state.leftPlate.push(value);
            } else {
                state.rightPlate.push(value);
            }

            const tileElement = createTileElement(value, true);
            tileElement.style.transform = 'scale(0)';
            plate.appendChild(tileElement);
            
            // Animate tile appearance
            requestAnimationFrame(() => {
                tileElement.style.transition = 'transform 0.3s ease';
                tileElement.style.transform = 'scale(0.8)';
            });
            
            updateBalance();
        });
    });
}

// Initialize snapshots functionality
document.querySelector('.snapshot-btn').addEventListener('click', () => {
    // Add visual feedback
    const btn = document.querySelector('.snapshot-btn');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 200);
});

document.addEventListener('DOMContentLoaded', () => {
    initDragAndDrop();
    updateBalance();
    
    // Lock screen orientation to landscape using multiple methods
    function lockOrientation() {
        try {
            // Method 1: Screen Orientation API
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(function(error) {
                    console.log("Screen orientation lock failed: ", error);
                    // Fallback to other methods
                    tryFallbackMethods();
                });
            } else {
                // Try fallback methods if Screen Orientation API is not available
                tryFallbackMethods();
            }
        } catch (e) {
            console.log("Orientation lock error:", e);
            tryFallbackMethods();
        }
    }

    function tryFallbackMethods() {
        // Method 2: Deprecated orientation API
        if (screen.lockOrientation) {
            screen.lockOrientation('landscape');
        } else if (screen.mozLockOrientation) {
            screen.mozLockOrientation('landscape');
        } else if (screen.msLockOrientation) {
            screen.msLockOrientation('landscape');
        }

        // Method 3: Force orientation through viewport
        let viewport = document.querySelector("meta[name=viewport]");
        if (viewport) {
            viewport.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, orientation=landscape";
        }
    }

    // Try to lock orientation immediately
    lockOrientation();

    // Try to lock orientation when device orientation changes
    window.addEventListener('orientationchange', function() {
        setTimeout(lockOrientation, 200);
        
        // Force re-layout after orientation change
        setTimeout(() => {
            window.scrollTo(0, 0);
            document.body.style.height = window.innerHeight + 'px';
        }, 300);
    });

    // Force landscape on resize
    window.addEventListener('resize', function() {
        setTimeout(lockOrientation, 200);
        
        // Update layout on resize
        document.body.style.height = window.innerHeight + 'px';
    });

    // Prevent scrolling on mobile devices
    document.body.addEventListener('touchmove', function(e) {
        if (e.target.tagName !== 'INPUT') {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Add input event listeners for direct value entry
    ['x-value', 'y-value'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('change', () => {
            const variable = id.split('-')[0];
            state[`${variable}Value`] = parseInt(input.value);
            updateBalance();
        });
    });
});