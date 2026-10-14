// Default Initial Archives
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        title: "OnESPORT Heavyweight Tactical Hoodie",
        category: "Hoodies",
        price: 110.00,
        spec: "500 GSM French Terry Cotton // Boxy Oversized Fit",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
        video: "https://assets.mixkit.co/videos/preview/mixkit-model-posing-in-a-studio-41680-large.mp4",
        badge: "01 / 50 DROPPED",
        gridClass: "card-featured"
    },
    {
        id: 2,
        title: "Pro Match Liquid Jersey 2026",
        category: "Jerseys",
        price: 85.00,
        spec: "Poly-Spandex Breathable Mesh // Sublimated Graphic",
        image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
        video: "",
        badge: "TOURNAMENT ISSUE",
        gridClass: "card-standard"
    },
    {
        id: 3,
        title: "Cyber Hall Effect Gaming Board",
        category: "Peripherals",
        price: 175.00,
        spec: "CNC Aluminum Frame // Rapid Trigger Switches",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
        video: "",
        badge: "LIMITED TECH",
        gridClass: "card-standard"
    },
    {
        id: 4,
        title: "Unsanctioned Nylon Cap",
        category: "Headwear",
        price: 45.00,
        spec: "Water-resistant Ripstop // Adjustable Strap",
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
        video: "",
        badge: "ESSENTIAL",
        gridClass: "card-portrait"
    },
    {
        id: 5,
        title: "Apex Ultralight Wireless Mouse",
        category: "Peripherals",
        price: 135.00,
        spec: "49g Ultra Weight // 8K Polling Rate Sensor",
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
        video: "",
        badge: "PRO EDITION",
        gridClass: "card-standard"
    }
];

// State
let products = JSON.parse(localStorage.getItem('onesport_editorial_products')) || DEFAULT_PRODUCTS;
let cart = JSON.parse(localStorage.getItem('onesport_editorial_cart')) || [];
let currentFilter = 'all';

// DOM Elements
const productGrid = document.getElementById('product-grid');
const categoryTabs = document.getElementById('category-tabs');
const navLinks = document.querySelectorAll('.nav-link');
const musicToggleBtn = document.getElementById('music-toggle');
const bgAudio = document.getElementById('bg-audio');

const adminToggleBtn = document.getElementById('admin-toggle');
const adminModal = document.getElementById('admin-modal');
const closeModalBtn = document.getElementById('close-modal');
const adminForm = document.getElementById('admin-form');
const resetDefaultsBtn = document.getElementById('reset-defaults');

const cartTrigger = document.getElementById('cart-trigger');
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutBtn = document.getElementById('close-checkout');
const cartCountSpan = document.getElementById('cart-count');
const checkoutItemsList = document.getElementById('checkout-items-list');
const cartSubtotalSpan = document.getElementById('cart-subtotal');
const cartTotalSpan = document.getElementById('cart-total');
const paymentForm = document.getElementById('payment-form');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(currentFilter);
    initAudio();
    updateCartUI();
    startDropTimer();
    setupEventListeners();
});

// Drop Countdown Timer
function startDropTimer() {
    let duration = 2 * 24 * 3600 + 14 * 3600 + 38 * 60; // 2 days 14 hrs
    const timerElement = document.getElementById('drop-timer');
    
    setInterval(() => {
        duration--;
        if (duration < 0) duration = 0;
        
        const days = Math.floor(duration / (24 * 3600));
        const hours = Math.floor((duration % (24 * 3600)) / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;

        timerElement.textContent = `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;
    }, 1000);
}

function pad(n) {
    return n < 10 ? '0' + n : n;
}

// Background Audio
function initAudio() {
    const savedAudio = localStorage.getItem('onesport_editorial_audio');
    bgAudio.src = savedAudio || "https://actions.google.com/sounds/v1/ambiences/sci_fi_hallway.ogg";
}

function toggleAudio() {
    if (bgAudio.paused) {
        bgAudio.play().catch(e => console.log(e));
        musicToggleBtn.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
        musicToggleBtn.style.color = 'var(--accent-volt)';
    } else {
        bgAudio.pause();
        musicToggleBtn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
        musicToggleBtn.style.color = '';
    }
}

// Event Listeners
function setupEventListeners() {
    musicToggleBtn.addEventListener('click', toggleAudio);

    adminToggleBtn.addEventListener('click', () => adminModal.classList.add('active'));
    closeModalBtn.addEventListener('click', () => adminModal.classList.remove('active'));

    cartTrigger.addEventListener('click', () => {
        renderCheckoutCart();
        checkoutModal.classList.add('active');
    });
    closeCheckoutBtn.addEventListener('click', () => checkoutModal.classList.remove('active'));

    categoryTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('cat-btn')) {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            renderProducts(currentFilter);
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            currentFilter = link.getAttribute('data-category');
            renderProducts(currentFilter);
        });
    });

    // Admin Submit with Local Gallery Upload
    adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('item-title').value;
        const category = document.getElementById('item-category').value;
        const price = parseFloat(document.getElementById('item-price').value);
        const spec = document.getElementById('item-spec').value || "Technical Apparel Spec";
        const video = document.getElementById('item-video').value;
        const badge = document.getElementById('item-badge').value || "NEW DROP";
        const imageUrlInput = document.getElementById('item-image-url').value;
        const imageFileInput = document.getElementById('item-image-file').files[0];
        const audioFileInput = document.getElementById('admin-audio-file').files[0];

        if (audioFileInput) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                localStorage.setItem('onesport_editorial_audio', evt.target.result);
                bgAudio.src = evt.target.result;
            };
            reader.readAsDataURL(audioFileInput);
        }

        if (imageFileInput) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                saveNewProduct(title, category, price, spec, evt.target.result, video, badge);
            };
            reader.readAsDataURL(imageFileInput);
        } else {
            const finalImg = imageUrlInput || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80";
            saveNewProduct(title, category, price, spec, finalImg, video, badge);
        }
    });

    resetDefaultsBtn.addEventListener('click', () => {
        if (confirm('Reset lookbook catalog to default drops?')) {
            products = [...DEFAULT_PRODUCTS];
            saveAndRenderProducts();
            adminModal.classList.remove('active');
        }
    });

    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert('Your bag is empty.');
            return;
        }
        alert('Order Confirmed! Your OnESPORT items are reserved.');
        cart = [];
        saveCart();
        updateCartUI();
        checkoutModal.classList.remove('active');
        paymentForm.reset();
    });
}

function saveNewProduct(title, category, price, spec, image, video, badge) {
    const newProduct = {
        id: Date.now(),
        title,
        category,
        price,
        spec,
        image,
        video,
        badge,
        gridClass: "card-standard"
    };

    products.unshift(newProduct);
    saveAndRenderProducts();
    adminForm.reset();
    adminModal.classList.remove('active');
}

// Render Asymmetrical Products
function renderProducts(filter) {
    productGrid.innerHTML = '';

    const filtered = filter === 'all' 
        ? products 
        : products.filter(p => p.category.toLowerCase() === filter.toLowerCase());

    if (filtered.length === 0) {
        productGrid.innerHTML = `<div style="grid-column: span 12; text-align: center; padding: 4rem; color: var(--text-muted);">NO DROPS FOUND IN THIS CATEGORY.</div>`;
        return;
    }

    filtered.forEach((product, idx) => {
        const card = document.createElement('div');
        
        // Dynamic grid classes for lookbook variance
        let cardClass = product.gridClass || (idx % 5 === 0 ? 'card-featured' : (idx % 3 === 0 ? 'card-portrait' : 'card-standard'));
        card.className = `lookbook-card ${cardClass}`;

        const videoHtml = product.video ? `<video src="${escapeHtml(product.video)}" muted loop playsinline preload="none" onmouseover="this.play()" onmouseout="this.pause(); this.currentTime=0;"></video>` : '';

        card.innerHTML = `
            <div class="card-media">
                <span class="badge-overlay">${escapeHtml(product.badge)}</span>
                <button class="delete-card-btn" onclick="deleteProduct(${product.id})" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
                <img src="${product.image}" alt="${escapeHtml(product.title)}" onerror="this.src='https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'">
                ${videoHtml}
            </div>
            <div class="card-details">
                <span class="card-spec">${escapeHtml(product.spec)}</span>
                <h3 class="card-title">${escapeHtml(product.title)}</h3>
                <div class="card-footer">
                    <span class="card-price">$${product.price.toFixed(2)}</span>
                    <button class="add-bag-btn" onclick="addToCart(${product.id})">+ ADD TO BAG</button>
                </div>
            </div>
        `;

        productGrid.appendChild(card);
    });
}

// Cart Management
window.addToCart = function(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        cart.push(product);
        saveCart();
        updateCartUI();
        
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'ADDED ✓';
        btn.style.background = 'var(--accent-volt)';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 1000);
    }
};

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    renderCheckoutCart();
};

function saveCart() {
    localStorage.setItem('onesport_editorial_cart', JSON.stringify(cart));
}

function updateCartUI() {
    cartCountSpan.textContent = cart.length;
}

function renderCheckoutCart() {
    checkoutItemsList.innerHTML = '';
    
    if (cart.length === 0) {
        checkoutItemsList.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 1rem;">BAG IS EMPTY.</p>`;
        cartSubtotalSpan.textContent = '$0.00';
        cartTotalSpan.textContent = '$2.00';
        return;
    }

    let subtotal = 0;
    cart.forEach((item, index) => {
        subtotal += item.price;
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item-row';
        itemEl.innerHTML = `
            <div>
                <div class="cart-item-name">${escapeHtml(item.title)}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${index})"><i class="fa-solid fa-trash"></i></button>
        `;
        checkoutItemsList.appendChild(itemEl);
    });

    cartSubtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
    cartTotalSpan.textContent = `$${(subtotal + 2.00).toFixed(2)}`;
}

window.deleteProduct = function(id) {
    if (confirm('Permanently delete item from lookbook?')) {
        products = products.filter(p => p.id !== id);
        saveAndRenderProducts();
    }
};

function saveAndRenderProducts() {
    localStorage.setItem('onesport_editorial_products', JSON.stringify(products));
    renderProducts(currentFilter);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}