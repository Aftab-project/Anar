/* ============================================
    ANÁR Skin Therapy - JavaScript
   Interactive Features & Form Handling
   ============================================ */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Keep layout offsets in sync with real header/nav heights.
    const syncLayoutOffsets = () => {
        const root = document.documentElement;
        const headerEl = document.querySelector('.header');
        const megaNavEl = document.querySelector('.treatment-mega-nav');

        const headerHeight = headerEl ? Math.round(headerEl.getBoundingClientRect().height) : 90;
        let megaNavHeight = 0;

        if (megaNavEl) {
            const megaNavStyles = window.getComputedStyle(megaNavEl);
            const isSticky = megaNavStyles.position === 'sticky';
            megaNavHeight = isSticky ? Math.round(megaNavEl.getBoundingClientRect().height) : 0;
        }

        root.style.setProperty('--header-height', `${headerHeight}px`);
        root.style.setProperty('--mega-nav-height', `${megaNavHeight}px`);
    };

    const parsePx = (value) => Number.parseFloat(value) || 0;

    const getGlobalStickyOffset = () => {
        const rootStyles = window.getComputedStyle(document.documentElement);
        const headerHeight = parsePx(rootStyles.getPropertyValue('--header-height'));
        const megaNavHeight = parsePx(rootStyles.getPropertyValue('--mega-nav-height'));
        const stickySubnav = document.querySelector('.sticky-subnav');
        let stickySubnavHeight = 0;

        if (stickySubnav) {
            const stickySubnavStyles = window.getComputedStyle(stickySubnav);
            if (stickySubnavStyles.position === 'sticky') {
                stickySubnavHeight = Math.round(stickySubnav.getBoundingClientRect().height);
            }
        }

        return headerHeight + megaNavHeight + stickySubnavHeight + 8;
    };

    syncLayoutOffsets();
    window.addEventListener('resize', syncLayoutOffsets);

    // ==========================================
    // INTRO ANIMATION (HOME PAGE)
    // ==========================================
    const introOverlay = document.querySelector('.intro-overlay');
    if (introOverlay) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const minimumDisplay = prefersReducedMotion ? 0 : 1300;
        const startTime = performance.now();

        const hideIntro = () => {
            if (introOverlay.classList.contains('is-hidden')) return;
            introOverlay.classList.add('is-hidden');
            setTimeout(() => introOverlay.remove(), 700);
        };

        window.addEventListener('load', () => {
            const elapsed = performance.now() - startTime;
            const delay = Math.max(0, minimumDisplay - elapsed);
            setTimeout(hideIntro, delay);
        });

        // Safety fallback in case load event is delayed
        setTimeout(hideIntro, 3200);
    }
    
    // ==========================================
    // MOBILE MENU TOGGLE
    // ==========================================
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-link');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';

            // Re-sync offsets after menu state changes.
            setTimeout(syncLayoutOffsets, 60);
        });

        // Close mobile menu when clicking on a nav link
        navLinkItems.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
                syncLayoutOffsets();
            });
        });
    }

    // ==========================================
    // TREATMENT MEGA MENU NAVIGATION
    // ==========================================
    const megaCategoryTriggers = document.querySelectorAll('.mega-category-trigger');
    const megaCategories = document.querySelectorAll('.mega-category');
    const supportsHover = () => window.matchMedia('(hover: hover)').matches && window.matchMedia('(pointer: fine)').matches;
    const isCompactNavMode = () => window.matchMedia('(max-width: 1024px)').matches || !supportsHover();
    let lastCompactNavMode = isCompactNavMode();
    const MEGA_MENU_CLOSE_DELAY_MS = 320;
    const MEGA_MENU_OPEN_DELAY_MS = 40;
    let megaMenuCloseTimer = null;
    let megaMenuOpenTimer = null;

    const clearMegaMenuTimers = () => {
        if (megaMenuCloseTimer) {
            clearTimeout(megaMenuCloseTimer);
            megaMenuCloseTimer = null;
        }
        if (megaMenuOpenTimer) {
            clearTimeout(megaMenuOpenTimer);
            megaMenuOpenTimer = null;
        }
    };

    const closeAllMegaMenus = () => {
        clearMegaMenuTimers();
        megaCategoryTriggers.forEach(trigger => {
            trigger.setAttribute('aria-expanded', 'false');
            const menuId = trigger.getAttribute('aria-controls');
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.setAttribute('aria-hidden', 'true');
            }
        });
    };

    const openMegaMenu = (trigger, menu) => {
        megaCategoryTriggers.forEach(item => {
            item.setAttribute('aria-expanded', 'false');
            const menuId = item.getAttribute('aria-controls');
            const linkedMenu = document.getElementById(menuId);
            linkedMenu?.setAttribute('aria-hidden', 'true');
        });
        trigger.setAttribute('aria-expanded', 'true');
        menu?.setAttribute('aria-hidden', 'false');
    };

    megaCategories.forEach(category => {
        const trigger = category.querySelector('.mega-category-trigger');
        if (!trigger) return;

        const menuId = trigger.getAttribute('aria-controls');
        const menu = document.getElementById(menuId);
        if (!menu) return;

        // Desktop: hover-driven menus
        if (supportsHover()) {
            category.addEventListener('mouseenter', () => {
                if (megaMenuCloseTimer) {
                    clearTimeout(megaMenuCloseTimer);
                    megaMenuCloseTimer = null;
                }

                if (megaMenuOpenTimer) {
                    clearTimeout(megaMenuOpenTimer);
                }

                megaMenuOpenTimer = setTimeout(() => {
                    openMegaMenu(trigger, menu);
                    megaMenuOpenTimer = null;
                }, MEGA_MENU_OPEN_DELAY_MS);
            });

            category.addEventListener('mouseleave', () => {
                if (megaMenuOpenTimer) {
                    clearTimeout(megaMenuOpenTimer);
                    megaMenuOpenTimer = null;
                }

                if (megaMenuCloseTimer) {
                    clearTimeout(megaMenuCloseTimer);
                }

                megaMenuCloseTimer = setTimeout(() => {
                    closeAllMegaMenus();
                }, MEGA_MENU_CLOSE_DELAY_MS);
            });

            menu.addEventListener('mouseenter', () => {
                if (megaMenuCloseTimer) {
                    clearTimeout(megaMenuCloseTimer);
                    megaMenuCloseTimer = null;
                }
            });

            menu.addEventListener('mouseleave', () => {
                if (megaMenuCloseTimer) {
                    clearTimeout(megaMenuCloseTimer);
                }

                megaMenuCloseTimer = setTimeout(() => {
                    closeAllMegaMenus();
                }, MEGA_MENU_CLOSE_DELAY_MS);
            });
        }

        // Touch / small screens: click-to-toggle accordion
        trigger.addEventListener('click', (event) => {
            const useClickMode = isCompactNavMode();
            if (!useClickMode) return;

            event.preventDefault();
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                closeAllMegaMenus();
            } else {
                openMegaMenu(trigger, menu);
            }
        });
    });

    // Close mega menu when clicking on a link
    const megaMenuLinks = document.querySelectorAll('.mega-menu a');
    megaMenuLinks.forEach(link => {
        link.addEventListener('click', () => closeAllMegaMenus());
    });

    // Close mega menu when clicking outside
    document.addEventListener('click', function(event) {
        const treatmentNav = document.querySelector('.treatment-mega-nav');
        if (treatmentNav && !treatmentNav.contains(event.target)) {
            closeAllMegaMenus();
        }
    });

    // Keep menus open during mobile scroll (iOS/Android can fire resize on address bar changes).
    // Only close when crossing interaction modes (desktop hover <-> compact click mode).
    window.addEventListener('resize', () => {
        const currentCompactNavMode = isCompactNavMode();
        if (currentCompactNavMode !== lastCompactNavMode) {
            closeAllMegaMenus();
            lastCompactNavMode = currentCompactNavMode;
        }
        syncLayoutOffsets();
    });

    // ==========================================
    // SMOOTH SCROLLING FOR NAVIGATION
    // ==========================================
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();

                const targetPosition =
                    targetElement.getBoundingClientRect().top + window.scrollY - getGlobalStickyOffset();
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // BOOK NOW BUTTON - SCROLL TO CONTACT
    // ==========================================
    const bookNowButtons = document.querySelectorAll('.book-now-btn');
    
    bookNowButtons.forEach(button => {
        button.addEventListener('click', function() {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                const targetPosition =
                    contactSection.getBoundingClientRect().top + window.scrollY - getGlobalStickyOffset();
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Focus on the name input field
                setTimeout(() => {
                    const nameInput = document.getElementById('name');
                    if (nameInput) nameInput.focus();
                }, 800);
            }
        });
    });

    // ==========================================
    // TOGGLE FEATURED CARDS (SHOW MORE)
    // ==========================================
    const toggleFeaturedBtn = document.getElementById('toggleFeaturedCards');
    
    if (toggleFeaturedBtn) {
        toggleFeaturedBtn.addEventListener('click', function() {
            const hiddenCards = document.querySelectorAll('.featured-card-hidden');
            const isExpanded = this.classList.contains('expanded');
            
            hiddenCards.forEach(card => {
                if (isExpanded) {
                    card.classList.remove('visible');
                } else {
                    card.classList.add('visible');
                }
            });
            
            this.classList.toggle('expanded');
            
            // Update button text
            const btnText = this.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = isExpanded ? 'Show More' : 'Show Less';
            }
        });
    }

    // ==========================================
    // RELATED CARDS - FULL CARD CLICK NAVIGATION
    // ==========================================
    document.querySelectorAll('.related-card').forEach(card => {
        card.addEventListener('click', function(event) {
            const clickedInteractive = event.target.closest('a, button, input, textarea, select, label');
            if (clickedInteractive) return;

            const targetLink = this.querySelector('.related-card-cta[href]');
            const href = targetLink?.getAttribute('href');
            if (!href) return;

            const target = targetLink.getAttribute('target');
            if (target === '_blank') {
                window.open(href, '_blank', 'noopener');
                return;
            }

            window.location.href = href;
        });
    });

    // ==========================================
    // NAV SEARCH WITH SUGGESTIONS - MODERN WITH IMAGES
    // ==========================================
    const searchToggle = document.querySelector('.search-toggle');
    let searchPanel = document.querySelector('.nav-search-panel');
    let searchInput = document.getElementById('nav-search-input');
    let suggestionsBox = document.getElementById('nav-search-suggestions');
    let searchBackdrop = document.querySelector('.nav-search-backdrop');
    let searchClearBtn = document.querySelector('.nav-search-clear');

    const ensureSearchUiElements = () => {
        if (!searchToggle) return;

        const navActions = searchToggle.closest('.nav-actions') || document.querySelector('.nav-actions');
        if (!navActions) return;

        if (!searchPanel) {
            searchPanel = document.createElement('div');
            searchPanel.className = 'nav-search-panel';
            searchPanel.id = 'nav-search-panel';
            searchPanel.setAttribute('aria-hidden', 'true');
            searchPanel.innerHTML = `
                <div class="search-header">
                    <div class="search-row">
                        <input type="search" id="nav-search-input" placeholder="Search treatments..." aria-label="Search">
                        <button class="nav-search-clear" aria-label="Clear search"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="nav-search-suggestions" id="nav-search-suggestions"></div>
            `;
            navActions.appendChild(searchPanel);
        }

        if (!searchBackdrop) {
            searchBackdrop = document.createElement('div');
            searchBackdrop.className = 'nav-search-backdrop';
            searchBackdrop.setAttribute('aria-hidden', 'true');
            navActions.appendChild(searchBackdrop);
        }

        searchInput = document.getElementById('nav-search-input') || searchPanel.querySelector('#nav-search-input');
        suggestionsBox = document.getElementById('nav-search-suggestions') || searchPanel.querySelector('#nav-search-suggestions');
        searchClearBtn = searchPanel.querySelector('.nav-search-clear');
        searchToggle.setAttribute('aria-controls', 'nav-search-panel');
        if (!searchToggle.hasAttribute('aria-expanded')) {
            searchToggle.setAttribute('aria-expanded', 'false');
        }
    };

    ensureSearchUiElements();
    const normalizeForSearch = (value = '') => value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s\-./]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const BOOKING_INTENT_KEYWORDS = ['book', 'booking', 'appointment', 'appointments', 'reserve', 'reservation'];
    const hasBookingIntent = (query = '') => {
        const normalizedQuery = normalizeForSearch(query);
        if (!normalizedQuery) return false;

        const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
        return tokens.some(token => {
            if (token.length < 2) return false;
            return BOOKING_INTENT_KEYWORDS.some(keyword =>
                keyword.startsWith(token) || token.startsWith(keyword)
            );
        });
    };

    // Build search dataset from treatments only
    const searchItems = [];

    const primaryBookAnchor = document.querySelector('.nav-link.book-btn')
        || document.querySelector('a.book-btn')
        || document.querySelector('a[href*="that-time.co.uk"]');
    const bookingHref = primaryBookAnchor?.getAttribute('href') || '';
    const bookingTarget = primaryBookAnchor?.getAttribute('target') || '';

    const bookingIntentItem = bookingHref
        ? {
            name: 'Book Appointment',
            href: bookingHref,
            target: bookingTarget,
            image: null,
            category: 'Quick action',
            isService: false,
            isAction: true,
            priority: 3,
            keywords: ['book', 'booking', 'appointment', 'reserve']
        }
        : null;

    const addTreatmentItem = ({ name, href, target = '', image = null, category = 'Treatments', priority = 1 }) => {
        if (!name || !href || href === '#' || href.startsWith('#')) return;
        searchItems.push({
            name: name.trim(),
            href,
            target,
            image,
            category,
            isService: true,
            isAction: false,
            keywords: [],
            priority
        });
    };

    // Featured cards on home page
    document.querySelectorAll('.featured-card').forEach(card => {
        const nameEl = card.querySelector('h3');
        const detailsLink = card.querySelector('.featured-actions a.text-link[href]');
        const imgEl = card.querySelector('.featured-image img');
        const badgeEl = card.querySelector('.featured-badge');

        if (!nameEl || !detailsLink) return;

        addTreatmentItem({
            name: nameEl.textContent,
            href: detailsLink.getAttribute('href'),
            target: detailsLink.getAttribute('target') || '',
            image: imgEl ? imgEl.getAttribute('src') : null,
            category: badgeEl ? badgeEl.textContent.trim() : 'Featured treatment',
            priority: 2
        });
    });

    // Mega-menu treatment links (works on home and treatment pages)
    document.querySelectorAll('.mega-menu .mega-menu-column a[href$=".html"]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === '#' || href.startsWith('#')) return;

        const category = link.closest('.mega-category')
            ?.querySelector('.trigger-content span')
            ?.textContent
            ?.trim() || 'Treatments';

        addTreatmentItem({
            name: link.textContent,
            href,
            target: link.getAttribute('target') || '',
            image: null,
            category,
            priority: 1
        });
    });

    // Deduplicate by href first (avoid duplicate entries from featured + mega-menu)
    const uniqueItems = [];
    const seen = new Set();
    searchItems.forEach(item => {
        const key = normalizeForSearch(item.href || `${item.name}|${item.href}`);
        if (!seen.has(key)) {
            seen.add(key);
            uniqueItems.push(item);
        }
    });

    // Sort by priority (services first)
    uniqueItems.sort((a, b) => b.priority - a.priority);

    // Precompute normalized fields for faster search
    uniqueItems.forEach(item => {
        item._nameLower = normalizeForSearch(item.name);
        item._categoryLower = normalizeForSearch(item.category || '');
        item._hrefLower = normalizeForSearch(item.href || '');
        item._keywordsLower = (item.keywords || []).map(keyword => normalizeForSearch(keyword)).join(' ');
        item._nameWords = item._nameLower.split(/\s+/).filter(Boolean);
        item._categoryWords = item._categoryLower.split(/\s+/).filter(Boolean);
        item._searchBlob = `${item._nameLower} ${item._categoryLower} ${item._keywordsLower}`.trim();
    });

    // Fuzzy search algorithm - tolerates typos, spaces, hyphens and partial matches
    const fuzzyMatch = (query, text) => {
        const q = normalizeForSearch(query);
        const t = normalizeForSearch(text);
        if (!q || !t) return 0;
        
        // Exact substring match gets highest score
        if (t.includes(q)) return 1.0;
        
        // Normalize by removing spaces and hyphens for matching
        const normalizedQ = q.replace(/[\s\-\.]/g, '');
        const normalizedT = t.replace(/[\s\-\.]/g, '');
        
        // Check normalized substring match
        if (normalizedT.includes(normalizedQ)) return 0.95;
        
        // Word-based matching: check if query words appear in text
        const queryWords = q.split(/[\s\-]+/).filter(w => w.length > 0);
        const textWords = t.split(/[\s\-]+/).filter(w => w.length > 0);
        
        let matchedWords = 0;
        for (const qWord of queryWords) {
            for (const tWord of textWords) {
                if (tWord.includes(qWord) || qWord.length > 2 && levenshteinDistance(qWord, tWord) <= 1) {
                    matchedWords++;
                    break;
                }
            }
        }
        
        const wordMatchScore = queryWords.length > 0 ? matchedWords / queryWords.length : 0;
        if (wordMatchScore >= 0.7) {
            return 0.85 * wordMatchScore;
        }
        
        // Character-level fuzzy matching with tolerance
        let queryIdx = 0;
        let matchedChars = 0;
        let skipped = 0;
        
        for (let i = 0; i < normalizedT.length && queryIdx < normalizedQ.length; i++) {
            if (normalizedT[i] === normalizedQ[queryIdx]) {
                matchedChars++;
                queryIdx++;
            } else if (skipped < 2) { // Allow skipping up to 2 characters
                skipped++;
            }
        }
        
        if (queryIdx >= normalizedQ.length * 0.7) { // At least 70% of query matched
            const score = (matchedChars / normalizedQ.length) * 0.6 + (1 - skipped / normalizedQ.length) * 0.4;
            return Math.max(0.4, Math.min(score, 0.8));
        }
        
        return 0; // No match
    };

    // Calculate Levenshtein distance between two strings
    const levenshteinDistance = (a, b) => {
        const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(0));
        
        for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= b.length; j++) {
            for (let i = 1; i <= a.length; i++) {
                const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + indicator
                );
            }
        }
        
        return matrix[b.length][a.length];
    };

    const SEARCH_DEBOUNCE_MS = 120;
    let searchDebounceTimer = null;
    let activeSuggestionIndex = -1;
    let lastRenderedItems = [];

    const renderSuggestions = (items) => {
        if (!suggestionsBox) return;
        lastRenderedItems = items;

        if (!items.length) {
            const q = (searchInput?.value || '').trim();
            suggestionsBox.innerHTML = q ? '<div class="no-results">No matches found</div>' : '';
            activeSuggestionIndex = -1;
            return;
        }

        if (activeSuggestionIndex < 0 || activeSuggestionIndex >= items.length) {
            activeSuggestionIndex = 0;
        }

        suggestionsBox.innerHTML = items.map((item, index) => `
            <button type="button" id="search-suggestion-${index}" data-index="${index}" class="suggestion-item ${item.isService ? 'is-service' : ''} ${index === activeSuggestionIndex ? 'is-active' : ''}" aria-selected="${index === activeSuggestionIndex}">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" class="suggestion-image">` : '<div class="suggestion-image-placeholder"><i class="fas fa-spa"></i></div>'}
                <div class="suggestion-content">
                    <span class="suggest-title">${item.name}</span>
                    <span class="suggest-meta">${item.category}</span>
                </div>
                <i class="fas fa-arrow-right suggestion-arrow"></i>
            </button>
        `).join('');
    };

    const navigateToItem = (item) => {
        if (!item?.href) return;
        if (item.target === '_blank') {
            window.open(item.href, '_blank', 'noopener');
            return;
        }
        window.location.href = item.href;
    };

    const setActiveSuggestion = (nextIndex) => {
        if (!suggestionsBox || !lastRenderedItems.length) {
            activeSuggestionIndex = -1;
            return;
        }

        const max = lastRenderedItems.length - 1;
        activeSuggestionIndex = Math.max(0, Math.min(nextIndex, max));

        suggestionsBox.querySelectorAll('.suggestion-item').forEach((button, index) => {
            const isActive = index === activeSuggestionIndex;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-selected', String(isActive));
            if (isActive) {
                button.scrollIntoView({ block: 'nearest' });
            }
        });
    };

    const filterSuggestions = (query) => {
        const q = normalizeForSearch(query);
        if (!q) {
            // Show suggestions only after user types
            renderSuggestions([]);
            return;
        }

        if (hasBookingIntent(q) && bookingIntentItem) {
            renderSuggestions([bookingIntentItem]);
            return;
        }
        
        const queryTokens = q.split(/\s+/).filter(Boolean);

        const scoredItems = uniqueItems
            .map(item => {
                const startsWithName = item._nameLower.startsWith(q);
                const startsWithWord = item._nameWords.some(word => word.startsWith(q));
                const includesName = item._nameLower.includes(q);

                const prefixMatches = queryTokens.filter(token => item._nameWords.some(word => word.startsWith(token))).length;
                const containsMatches = queryTokens.filter(token => item._nameLower.includes(token)).length;
                const allTokensPrefixMatch = queryTokens.length > 0 && prefixMatches === queryTokens.length;
                const allTokensContained = queryTokens.length > 0 && containsMatches === queryTokens.length;

                // Strict relevance gate:
                // 1 char: must be word-prefix
                // 2+ chars: must match all tokens by prefix OR contain full query in name
                const isRelevant = q.length === 1
                    ? startsWithWord
                    : (allTokensPrefixMatch || includesName || allTokensContained);

                if (!isRelevant) return null;

                let score = 0;
                if (startsWithName) score += 300;
                if (startsWithWord) score += 220;
                if (allTokensPrefixMatch) score += 180;
                if (includesName) score += 120;
                score += prefixMatches * 25;
                score += containsMatches * 10;
                score += Math.max(0, 30 - item._nameLower.length * 0.25);

                return { ...item, score };
            })
            .filter(Boolean)
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.name.localeCompare(b.name);
            })
            .slice(0, 8);
        
        renderSuggestions(scoredItems);
    };

    const openSearch = () => {
        if (!searchPanel) return;
        searchPanel.classList.add('open');
        searchPanel.setAttribute('aria-hidden', 'false');
        searchToggle?.setAttribute('aria-expanded', 'true');
        searchBackdrop?.classList.add('open');
        setTimeout(() => searchInput?.focus(), 50);
        filterSuggestions(searchInput?.value || '');
    };

    const closeSearch = () => {
        if (!searchPanel) return;
        searchPanel.classList.remove('open');
        searchPanel.setAttribute('aria-hidden', 'true');
        searchToggle?.setAttribute('aria-expanded', 'false');
        searchBackdrop?.classList.remove('open');
    };

    if (searchToggle && searchPanel && searchInput && suggestionsBox) {
        searchToggle.addEventListener('click', () => {
            const isOpen = searchPanel.classList.contains('open');
            if (isOpen) {
                closeSearch();
            } else {
                openSearch();
            }
        });

        searchInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (searchDebounceTimer) {
                clearTimeout(searchDebounceTimer);
            }
            searchDebounceTimer = setTimeout(() => {
                filterSuggestions(value);
            }, SEARCH_DEBOUNCE_MS);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (!searchPanel.classList.contains('open') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                openSearch();
                e.preventDefault();
                return;
            }

            if (!lastRenderedItems.length) {
                if (e.key === 'Escape') closeSearch();
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(activeSuggestionIndex + 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(activeSuggestionIndex - 1);
            } else if (e.key === 'Enter') {
                const activeItem = lastRenderedItems[activeSuggestionIndex] || lastRenderedItems[0];
                if (activeItem) {
                    e.preventDefault();
                    navigateToItem(activeItem);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeSearch();
            }
        });

        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!searchInput) return;
                searchInput.value = '';
                filterSuggestions('');
                searchInput.focus();
            });
        }

        suggestionsBox.addEventListener('click', (e) => {
            const target = e.target.closest('button[data-index]');
            if (!target) return;
            const index = Number(target.getAttribute('data-index'));
            const item = Number.isNaN(index) ? null : lastRenderedItems[index];
            navigateToItem(item);
        });

        suggestionsBox.addEventListener('mousemove', (e) => {
            const target = e.target.closest('button[data-index]');
            if (!target) return;
            const idx = Number(target.getAttribute('data-index'));
            if (!Number.isNaN(idx) && idx !== activeSuggestionIndex) {
                setActiveSuggestion(idx);
            }
        });

        document.addEventListener('click', (e) => {
            const isInside = searchPanel.contains(e.target) || searchToggle.contains(e.target);
            if (!isInside) closeSearch();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeSearch();
            }
        });
    }

    // ==========================================
    // NAVBAR SCROLL EFFECT
    // ==========================================
    const header = document.querySelector('.header');
    let isHeaderElevated = false;

    // ==========================================
    // CONTACT FORM VALIDATION & SUBMISSION
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            
            // Basic validation
            const name = formData.get('name').trim();
            const email = formData.get('email').trim();
            const message = formData.get('message').trim();
            
            if (!name || !email || !message) {
                showFormStatus('Please fill in all required fields.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showFormStatus('Please enter a valid email address.', 'error');
                return;
            }
            
            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            try {
                // Send form data to PHP backend
                const response = await fetch('contact.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showFormStatus('Thank you for your message! We will get back to you soon.', 'success');
                    contactForm.reset();
                } else {
                    showFormStatus(result.message || 'Something went wrong. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showFormStatus('Unable to send message. Please email us directly at Militest@gmail.com', 'error');
            } finally {
                // Restore button state
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }

    // ==========================================
    // FORM VALIDATION HELPERS
    // ==========================================
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showFormStatus(message, type) {
        if (formStatus) {
            formStatus.textContent = message;
            formStatus.className = 'form-status ' + type;
            formStatus.style.display = 'block';
            
            // Auto-hide success message after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 5000);
            }
        }
    }

    // ==========================================
    // REAL-TIME FORM INPUT VALIDATION
    // ==========================================
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '';
            }
        });
    }

    const nameInput = document.getElementById('name');
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            if (this.value.length > 0 && this.value.length < 2) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '';
            }
        });
    }

    // ==========================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // ==========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const sections = document.querySelectorAll('.about, .services, .price-list, .contact');

    // Keep sections visible by default; animate only if supported
    sections.forEach(section => {
        section.style.opacity = '1';
        section.style.transform = 'none';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            // Optional mild offset for small lift-on-appear
            section.style.transform = 'translateY(10px)';
            observer.observe(section);
        });
    }

    // ==========================================
    // SERVICE CARDS STAGGERED ANIMATION
    // ==========================================
    const serviceCards = document.querySelectorAll('.service-card');

    // Keep cards visible by default
    serviceCards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'none';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // ==========================================
    // SHOW MORE FOR LONG CATEGORIES
    // ==========================================
    const serviceCategories = document.querySelectorAll('.service-category');

    serviceCategories.forEach(category => {
        const grid = category.querySelector('.services-grid');
        if (!grid) return;

        const cards = grid.querySelectorAll('.service-card');
        if (cards.length <= 3) return;

        grid.classList.add('collapsed');

        const toggleWrapper = document.createElement('div');
        toggleWrapper.className = 'show-more-wrapper';

        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'show-more-toggle';
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.textContent = 'Show more treatments';

        toggleWrapper.appendChild(toggleButton);
        grid.insertAdjacentElement('afterend', toggleWrapper);

        toggleButton.addEventListener('click', () => {
            const isCollapsed = grid.classList.toggle('collapsed');
            const expanded = !isCollapsed;
            toggleButton.setAttribute('aria-expanded', expanded.toString());
            toggleButton.textContent = expanded ? 'Show fewer treatments' : 'Show more treatments';
        });
    });

    if ('IntersectionObserver' in window) {
        const cardObserver = new IntersectionObserver(function(entries) {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 80); // Stagger the animation
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        serviceCards.forEach(card => {
            // Slight lift only if animations supported
            card.style.transform = 'translateY(10px)';
            cardObserver.observe(card);
        });
    }

    // ==========================================
    // ACTIVE NAVIGATION HIGHLIGHTING
    // ==========================================
    const sectionAnchors = Array.from(document.querySelectorAll('section[id]'));
    const navAnchorLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
    let activeNavSectionId = '';

    const updateActiveNavLink = (scrollY) => {
        if (!sectionAnchors.length || !navAnchorLinks.length) return;

        let nextActiveSectionId = '';

        for (const section of sectionAnchors) {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            if (scrollY > sectionTop && scrollY <= sectionBottom) {
                nextActiveSectionId = section.getAttribute('id') || '';
                break;
            }
        }

        if (nextActiveSectionId === activeNavSectionId) return;
        activeNavSectionId = nextActiveSectionId;

        navAnchorLinks.forEach((link) => {
            link.style.color = '';
            link.style.fontWeight = '';
        });

        if (!activeNavSectionId) return;

        const activeLink = document.querySelector(`.nav-link[href="#${activeNavSectionId}"]`);
        if (activeLink) {
            activeLink.style.color = 'var(--accent-color)';
            activeLink.style.fontWeight = '600';
        }
    };

    // ==========================================
    // LOADING PLACEHOLDER IMAGES
    // ==========================================
    const images = document.querySelectorAll('.service-image img');
    
    images.forEach(img => {
        // If image fails to load, show placeholder
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #F5F1E8, #C9A87C);
                color: #8B6F47;
                font-size: 3rem;
            `;
            placeholder.innerHTML = '<i class="fas fa-spa"></i>';
            this.parentElement.appendChild(placeholder);
        });
    });

    // ==========================================
    // LOGO IMAGE ERROR HANDLING
    // ==========================================
    const logoImg = document.querySelector('.logo-img');
    if (logoImg) {
        logoImg.addEventListener('error', function() {
            this.style.display = 'none';
            // Logo text will still be visible
        });
    }

    // ==========================================
    // PHONE NUMBER FORMATTING
    // ==========================================
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) {
                value = value.slice(0, 11);
            }
            e.target.value = value;
        });
    }

    // ==========================================
    // BACK TO TOP BUTTON (Optional Enhancement)
    // ==========================================
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.className = 'back-to-top';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        box-shadow: 0 4px 15px rgba(139, 111, 71, 0.3);
        transition: all 0.3s ease;
        z-index: 999;
    `;
    document.body.appendChild(backToTopButton);

    // Unified passive scroll handling to reduce jank from multiple listeners.
    let isBackToTopVisible = false;
    let scrollTicking = false;

    const onScrollUpdate = () => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

        if (header) {
            const shouldElevateHeader = scrollY > 50;
            if (shouldElevateHeader !== isHeaderElevated) {
                header.style.boxShadow = shouldElevateHeader
                    ? '0 4px 15px rgba(0, 0, 0, 0.15)'
                    : '0 2px 10px rgba(0, 0, 0, 0.1)';
                isHeaderElevated = shouldElevateHeader;
            }
        }

        const shouldShowBackToTop = scrollY > 300;
        if (shouldShowBackToTop !== isBackToTopVisible) {
            backToTopButton.style.display = shouldShowBackToTop ? 'flex' : 'none';
            isBackToTopVisible = shouldShowBackToTop;
        }

        updateActiveNavLink(scrollY);
        scrollTicking = false;
    };

    const onScroll = () => {
        if (scrollTicking) return;
        scrollTicking = true;
        window.requestAnimationFrame(onScrollUpdate);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScrollUpdate();

    // Scroll to top when clicked
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    backToTopButton.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 6px 20px rgba(139, 111, 71, 0.4)';
    });

    backToTopButton.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(139, 111, 71, 0.3)';
    });

    // ==========================================
    // ACCORDION - SERVICE PAGES & FAQS
    // ==========================================
    const allAccordionItems = document.querySelectorAll('.accordion-item');
    
    allAccordionItems.forEach((item, index) => {
        const uniqueId = `accordion-item-${index}-${Math.random().toString(36).substr(2, 9)}`;
        item.setAttribute('data-accordion-uid', uniqueId);
        
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        const body = item.querySelector('.accordion-body');
        
        if (!header || !content || !body) return;
        
        header.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            const thisItem = document.querySelector(`[data-accordion-uid="${uniqueId}"]`);
            if (!thisItem) return;
            
            const thisContent = thisItem.querySelector('.accordion-content');
            if (!thisContent) return;
            
            const isOpen = thisItem.classList.contains('open');
            
            const parentAccordion = thisItem.closest('.accordion');
            
            if (parentAccordion) {
                const siblings = parentAccordion.querySelectorAll('.accordion-item');
                
                siblings.forEach((sibling) => {
                    const siblingUid = sibling.getAttribute('data-accordion-uid');
                    
                    if (siblingUid !== uniqueId) {
                        sibling.classList.remove('open');
                        const sibContent = sibling.querySelector('.accordion-content');
                        if (sibContent) {
                            sibContent.style.maxHeight = '0px';
                        }
                    }
                });
            }
            
            if (isOpen) {
                thisItem.classList.remove('open');
                thisContent.style.maxHeight = '0px';
            } else {
                thisItem.classList.add('open');
                void thisContent.offsetHeight;
                const height = thisContent.scrollHeight;
                thisContent.style.maxHeight = height + 'px';
            }
        });
    });
    
    // Handle legacy FAQ structure (for backward compatibility)
    const faqQuestions = document.querySelectorAll('.faq-question, .faq-question-modern');
    
    if (faqQuestions.length > 0) {
        faqQuestions.forEach(question => {
            question.addEventListener('click', function(e) {
                e.preventDefault();
                
                const faqItem = this.closest('.faq-item, .faq-item-modern');
                if (!faqItem) return;
                
                const isActive = faqItem.classList.contains('active');
                
                // Close all other FAQ items
                const allFaqItems = document.querySelectorAll('.faq-item.active, .faq-item-modern.active');
                allFaqItems.forEach(item => {
                    item.classList.remove('active');
                });
                
                // Toggle current item
                if (!isActive) {
                    faqItem.classList.add('active');
                }
            });
        });
    }

    // ==========================================
    // TREATMENT CATEGORIES DROPDOWN NAVIGATION
    // ==========================================
    const categoryHeaders = document.querySelectorAll('.category-header');
    
    categoryHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const dropdownId = this.getAttribute('aria-controls');
            const dropdown = document.getElementById(dropdownId);
            
            // Close other dropdowns in the same nav
            const navContainer = this.closest('.treatment-categories-nav');
            if (navContainer) {
                const otherHeaders = navContainer.querySelectorAll('.category-header');
                otherHeaders.forEach(otherHeader => {
                    if (otherHeader !== this) {
                        otherHeader.setAttribute('aria-expanded', 'false');
                        const otherDropdownId = otherHeader.getAttribute('aria-controls');
                        const otherDropdown = document.getElementById(otherDropdownId);
                        if (otherDropdown) {
                            otherDropdown.setAttribute('aria-hidden', 'true');
                        }
                    }
                });
            }
            
            // Toggle current dropdown
            const newState = !isExpanded;
            this.setAttribute('aria-expanded', newState);
            if (dropdown) {
                dropdown.setAttribute('aria-hidden', !newState);
            }
        });
    });

    // ==========================================
    // CONSOLE LOG - WEBSITE LOADED
    // ==========================================
    console.log('✨ ANÁR Skin Therapy website loaded successfully!');
    console.log('📧 Contact: Militest@gmail.com');
    console.log('📍 Location: 13b Edinburgh Cl, London E2 9NY');
    
});

// ==========================================
// PREVENT FORM RESUBMISSION ON REFRESH
// ==========================================
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
