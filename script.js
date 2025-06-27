document.addEventListener('DOMContentLoaded', () => {
    // --- Existing Features ---

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            // Get header height and new top-info-bar height for accurate scroll offset
            const headerOffset = document.querySelector('.header').offsetHeight;
            const topInfoBarOffset = document.querySelector('.top-info-bar').offsetHeight;
            const totalOffset = headerOffset + topInfoBarOffset;

            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - totalOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            const menuToggle = document.querySelector('.menu-toggle');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = ''; // Re-enable scrolling
            }
        });
    });

    // Add a class to header on scroll for subtle change
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            // Prevent scrolling when mobile menu is open
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Scroll-triggered animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        observer.observe(el);
    });

    // Optional: Simple Parallax Effect for Hero Visual
    const heroVisual = document.querySelector('.hero-visual-image');
    if (heroVisual) {
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            // Adjust multiplier for effect strength; smaller number means less movement
            heroVisual.style.transform = `translateY(${scrollY * 0.1}px)`;
        });
    }


    // --- NEW FEATURE: Real-time Clock, Date, and Dotted Animation ---

    const displayTime = document.getElementById('display-time');
    const displayDate = document.getElementById('display-date');
    const dottedAnimationArea = document.getElementById('dotted-animation-area');

    function updateDateTime() {
        const now = new Date();

        // Format Time (HH:MM:SS)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        displayTime.textContent = `${hours}:${minutes}:${seconds}`;

        // Format Date (e.g., "Mon, Jan 01")
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        displayDate.textContent = now.toLocaleDateString('en-US', options);
    }

    // Call updateDateTime immediately and then every second
    updateDateTime();
    setInterval(updateDateTime, 1000); // Update every 1000ms (1 second)


    // --- NEW: Dotted Animation Logic ---

    // Define grid dimensions (must match CSS variables for consistent display)
    const GRID_ROWS = 5;
    const GRID_COLS = 5;
    let pixels = []; // Array to store references to the pixel DOM elements

    /**
     * Dynamically creates the pixel grid within the animation area.
     * Each pixel is a <div> with class 'pixel'.
     */
    function createPixelGrid() {
        if (!dottedAnimationArea) return;

        dottedAnimationArea.innerHTML = ''; // Clear any existing content
        pixels = []; // Reset pixels array

        for (let i = 0; i < GRID_ROWS; i++) {
            for (let j = 0; j < GRID_COLS; j++) {
                const pixel = document.createElement('div');
                pixel.className = 'pixel';
                // Store pixel reference for easy access later (pixels[row * GRID_COLS + col])
                pixels.push(pixel);
                dottedAnimationArea.appendChild(pixel);
            }
        }
    }

    /**
     * Defines a set of simple pixel shapes.
     * Each shape is a 2D array, where 1 means the pixel is active (on).
     * The dimensions of these arrays must match GRID_ROWS x GRID_COLS.
     */
    const pixelShapes = [
        // Shape 1: Solid Square
        [
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1]
        ],
        // Shape 2: Cross/Plus
        [
            [0,0,1,0,0],
            [0,0,1,0,0],
            [1,1,1,1,1],
            [0,0,1,0,0],
            [0,0,1,0,0]
        ],
        // Shape 3: Letter 'G' (Abstracted)
        [
            [0,1,1,1,0],
            [1,0,0,0,1],
            [1,0,1,1,1],
            [1,0,0,0,1],
            [0,1,1,1,0]
        ],
        // Shape 4: Diagonal Line
        [
            [1,0,0,0,0],
            [0,1,0,0,0],
            [0,0,1,0,0],
            [0,0,0,1,0],
            [0,0,0,0,1]
        ],
        // Shape 5: Empty/Off (blink effect)
        [
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0]
        ]
    ];

    let currentShapeIndex = 0; // Tracks which shape is currently displayed

    /**
     * Draws a given pixel shape onto the grid by toggling 'active' class on pixels.
     * @param {Array<Array<number>>} shape The 2D array representing the pixel shape.
     */
    function drawShape(shape) {
        if (pixels.length === 0) return;

        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                const pixelIndex = r * GRID_COLS + c;
                if (shape[r] && shape[r][c] === 1) {
                    pixels[pixelIndex].classList.add('active');
                } else {
                    pixels[pixelIndex].classList.remove('active');
                }
            }
        }
    }

    /**
     * Animates the shapes by cycling through pixelShapes array.
     */
    function animateDottedDisplay() {
        if (pixelShapes.length === 0) return;

        drawShape(pixelShapes[currentShapeIndex]);
        currentShapeIndex = (currentShapeIndex + 1) % pixelShapes.length; // Move to next shape
    }

    // Initialize the pixel grid
    if (dottedAnimationArea && window.innerWidth > 480) { // Only create grid if screen is large enough
        createPixelGrid();
        // Start the dotted animation, update every 500ms (adjust for speed)
        setInterval(animateDottedDisplay, 500);
    }
});