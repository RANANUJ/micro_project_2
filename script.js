// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeSidebar = document.getElementById('closeSidebar');
const header = document.querySelector('.header');
const internshipBanner = document.getElementById('internshipBanner');

// State Management
let isSidebarOpen = false;
let lastScrollY = window.scrollY;
let isScrolling = false;

// Theme Management
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');

// Initialize theme
document.documentElement.setAttribute('data-theme', currentTheme);

// Performance optimizations
const performance = {
    mark: (name) => window.performance?.mark?.(name),
    measure: (name, start, end) => window.performance?.measure?.(name, start, end),
    getEntriesByType: (type) => window.performance?.getEntriesByType?.(type) || [],
};

// Use requestAnimationFrame for smooth animations
const raf = window.requestAnimationFrame || (cb => setTimeout(cb, 16));

// Optimize scroll handling with Intersection Observer
const scrollObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                if (target.id === 'internshipBanner') {
                    raf(() => {
                        target.classList.add('visible');
                    });
                }
            } else {
                const target = entry.target;
                if (target.id === 'internshipBanner') {
                    raf(() => {
                        target.classList.remove('visible');
                    });
                }
            }
        });
    },
    {
        threshold: 0.1,
        rootMargin: '50px'
    }
);

// Optimize image loading
const imageObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    },
    {
        rootMargin: '50px',
        threshold: 0.1
    }
);

// Optimize DOM queries
const elements = {
    menuToggle: document.getElementById('menuToggle'),
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    closeSidebar: document.getElementById('closeSidebar'),
    header: document.querySelector('.header'),
    internshipBanner: document.getElementById('internshipBanner'),
    images: document.querySelectorAll('img[data-src]'),
    links: document.querySelectorAll('a[href^="#"]')
};

// State management with weak references
const state = new WeakMap();
const setState = (element, newState) => {
    const currentState = state.get(element) || {};
    state.set(element, { ...currentState, ...newState });
};

// Optimize sidebar handling
const sidebarState = {
    isOpen: false,
    toggle() {
        this.isOpen = !this.isOpen;
        raf(() => {
            elements.sidebar.classList.toggle('active', this.isOpen);
            elements.sidebarOverlay.classList.toggle('active', this.isOpen);
            document.body.style.overflow = this.isOpen ? 'hidden' : '';
        });
    }
};

// Event delegation for better performance
document.addEventListener('click', (e) => {
    const target = e.target;

    // Handle menu toggle
    if (target.matches('#menuToggle, #menuToggle *')) {
        e.preventDefault();
        sidebarState.toggle();
    }

    // Handle sidebar close
    if (target.matches('#closeSidebar, #closeSidebar *, .sidebar-overlay')) {
        e.preventDefault();
        sidebarState.toggle();
    }

    // Handle smooth scroll
    if (target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = target.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            if (sidebarState.isOpen) {
                sidebarState.toggle();
            }

            const headerHeight = elements.header.offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            raf(() => {
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            });
        }
    }
});

// Optimize scroll handling
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
    }

    scrollTimeout = raf(() => {
        const currentScrollY = window.scrollY;

        // Update header
        elements.header.classList.toggle('scrolled', currentScrollY > 50);

        // Update banner visibility
        if (currentScrollY > 300) {
            elements.internshipBanner.classList.add('visible');
        } else {
            elements.internshipBanner.classList.remove('visible');
        }
    });
}, { passive: true });

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    performance.mark('init-start');

    // Observe images
    elements.images.forEach(img => imageObserver.observe(img));

    // Observe internship banner
    scrollObserver.observe(elements.internshipBanner);

    // Add active class to current navigation item
    const currentPath = window.location.hash || '#home';
    document.querySelectorAll('.desktop-nav a, .sidebar-menu a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Initialize accessibility
    enhanceAccessibility();

    performance.mark('init-end');
    performance.measure('initialization', 'init-start', 'init-end');
});

// Optimize accessibility
function enhanceAccessibility() {
    // Add aria-expanded to menu toggle
    elements.menuToggle.setAttribute('aria-expanded', 'false');

    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebarState.isOpen) {
            sidebarState.toggle();
        }
    });
}

// Error handling with performance monitoring
window.addEventListener('error', (e) => {
    console.error('Error:', e.error);
    performance.mark('error');
    // Add error reporting logic here
}, { passive: true });

// Cleanup on page unload
window.addEventListener('unload', () => {
    // Clear observers
    imageObserver.disconnect();
    scrollObserver.disconnect();

    // Clear timeouts
    if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
    }

    // Clear state
    state = new WeakMap();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sidebarState,
        enhanceAccessibility,
        performance
    };
} 