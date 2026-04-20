// ============================================
// BASE DE DATOS DE PRODUCTOS
// ============================================
const products = [
    {
        id: 17,
        name: "POCO X7 Versión Global",
        brand: "POCO",
        category: "celular",
        condition: "B",
        conditionLabel: "Muy buen estado",
        price: 1200000,
        oldPrice: 3500000,
        image: "images/poco-x7.png",
        specs: ["6.67\" AMOLED 120Hz", "Dimensity 7300", "50MP OIS", "5110 mAh 45W", "5G + IP68"],
        description: "POCO X7 Versión Global en muy buen estado. Pantalla AMOLED 120Hz espectacular, procesador de alto desempeño y cámaras profesionales con OIS. Batería de larga duración con carga turbo 45W. Completamente funcional y probado.",
        stock: 4
    },
    {
        id: 18,
        name: "Samsung Galaxy S22",
        brand: "Samsung",
        category: "celular",
        condition: "B",
        conditionLabel: "Outlet Ecocel",
        price: 1800000,
        oldPrice: 3800000,
        image: "images/Outlet-Galaxy-S22.png",
        specs: ["6.1\" AMOLED 120Hz", "Exynos 2200", "50MP Triple", "8K Video", "IP68"],
        description: "Categoría Outlet: 100% funcional con detalles estéticos. Cámara triple, sonido Dolby Atmos. Incluye caja, cable y 6 meses de garantía.",
        stock: 3
    }
];

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================
let cart = [];
let currentFilter = 'todos';

// ============================================
// FORMATEAR PRECIO EN PESOS COLOMBIANOS
// ============================================
function formatPrice(price) {
    return '$' + price.toLocaleString('es-CO');
}

// ============================================
// CALCULAR DESCUENTO
// ============================================
function getDiscount(price, oldPrice) {
    return Math.round(((oldPrice - price) / oldPrice) * 100);
}

// ============================================
// RENDERIZAR PRODUCTOS
// ============================================
function renderProducts(filter = 'todos') {
    const grid = document.getElementById('productsGrid');
    const filtered = filter === 'todos' ? products : products.filter(p => p.category === filter);

    grid.innerHTML = filtered.map((product, index) => {
        const discount = getDiscount(product.price, product.oldPrice);
        const conditionClass = product.condition === 'A' ? 'condition-a' : product.condition === 'B' ? 'condition-b' : 'condition-c';

        return `
        <div class="product-card reveal" style="animation-delay:${index * 0.05}s" data-category="${product.category}">
            <div class="product-img-wrap">
                <span class="badge-condition ${conditionClass}">${product.conditionLabel}</span>
                <span class="discount-badge">-${discount}%</span>
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div style="padding:20px;">
                <div style="font-size:12px;color:var(--fg-muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">${product.brand}</div>
                <h3 class="font-heading" style="font-size:18px;font-weight:600;margin-bottom:10px;">${product.name}</h3>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:14px;">
                    ${product.specs.slice(0, 3).map(s => `<span style="font-size:11px;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:2px 8px;color:var(--fg-muted);">${s}</span>`).join('')}
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                    <div>
                        <div class="price-old">${formatPrice(product.oldPrice)}</div>
                        <div class="font-heading" style="font-size:22px;font-weight:700;color:var(--accent);">${formatPrice(product.price)}</div>
                    </div>
                    ${product.stock <= 2 ? `<span style="font-size:11px;color:var(--danger);font-weight:600;">${product.stock === 1 ? 'Último disponible' : 'Quedan ' + product.stock}</span>` : ''}
                </div>
                <div style="display:flex;gap:8px;">
                    <button onclick="addToCart(${product.id})" class="btn-primary" style="flex:1;font-size:13px;padding:10px 16px;">
                        <i class="fas fa-plus" style="margin-right:6px;"></i>Agregar
                    </button>
                    <button onclick="openProductModal(${product.id})" style="width:42px;height:42px;border-radius:12px;background:var(--bg);border:1px solid var(--border);color:var(--fg-muted);cursor:pointer;transition:all 0.3s;display:flex;align-items:center;justify-content:center;" onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--fg-muted)'" aria-label="Ver detalles del producto">
                        <i class="fas fa-eye" style="font-size:14px;"></i>
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');

    // Activar animaciones reveal para los nuevos elementos
    setTimeout(() => {
        document.querySelectorAll('#productsGrid .reveal').forEach(el => el.classList.add('visible'));
    }, 50);
}

// ============================================
// FILTRAR PRODUCTOS
// ============================================
function filterProducts(category, btn) {
    currentFilter = category;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(category);
}

// ============================================
// CARRITO
// ============================================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.qty >= product.stock) {
            showToast('No hay más stock disponible de este producto', 'warning');
            return;
        }
        existingItem.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    updateCartUI();
    showToast(`${product.name} agregado al carrito`, 'success');

    // Animación del ícono del carrito
    const cartIcon = document.getElementById('cartCount');
    cartIcon.parentElement.classList.add('cart-pulse');
    setTimeout(() => cartIcon.parentElement.classList.remove('cart-pulse'), 300);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateCartQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    const product = products.find(p => p.id === productId);

    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(productId);
        return;
    }
    if (item.qty > product.stock) {
        item.qty = product.stock;
        showToast('Stock máximo alcanzado', 'warning');
    }
    updateCartUI();
}

function clearCart() {
    cart = [];
    updateCartUI();
    showToast('Carrito vaciado', 'info');
}

function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    document.getElementById('cartCount').textContent = count;

    const cartItemsEl = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');

    if (cart.length === 0) {
        cartItemsEl.innerHTML = `
            <div style="text-align:center;padding:60px 20px;">
                <i class="fas fa-shopping-bag" style="font-size:48px;color:var(--border);margin-bottom:16px;"></i>
                <p style="color:var(--fg-muted);font-size:15px;">Tu carrito está vacío</p>
                <p style="color:var(--fg-muted);font-size:13px;margin-top:8px;">Explora nuestros equipos reacondicionados</p>
                <button onclick="toggleCart()" class="btn-outline" style="margin-top:20px;font-size:14px;padding:10px 24px;">Ver productos</button>
            </div>`;
        cartFooter.style.display = 'none';
    } else {
        cartItemsEl.innerHTML = cart.map(item => `
            <div style="display:flex;gap:14px;padding:14px 0;border-bottom:1px solid var(--border);">
                <img src="${item.image}" alt="${item.name}" style="width:64px;height:64px;border-radius:10px;object-fit:cover;flex-shrink:0;">
                <div style="flex:1;min-width:0;">
                    <div style="font-size:12px;color:var(--fg-muted);">${item.brand}</div>
                    <div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
                    <div style="font-family:'Space Grotesk';font-weight:700;color:var(--accent);font-size:15px;margin-top:4px;">${formatPrice(item.price * item.qty)}</div>
                    <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
                        <button onclick="updateCartQty(${item.id}, -1)" style="width:28px;height:28px;border-radius:8px;background:var(--bg);border:1px solid var(--border);color:var(--fg);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;">-</button>
                        <span style="font-family:'Space Grotesk';font-weight:600;font-size:14px;min-width:20px;text-align:center;">${item.qty}</span>
                        <button onclick="updateCartQty(${item.id}, 1)" style="width:28px;height:28px;border-radius:8px;background:var(--bg);border:1px solid var(--border);color:var(--fg);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;">+</button>
                        <button onclick="removeFromCart(${item.id})" style="margin-left:auto;background:none;border:none;color:var(--fg-muted);cursor:pointer;font-size:13px;transition:color 0.3s;" onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--fg-muted)'" aria-label="Eliminar del carrito">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>`).join('');
        cartFooter.style.display = 'block';
        document.getElementById('cartSubtotal').textContent = formatPrice(subtotal);
    }
}

function toggleCart() {
    const overlay = document.getElementById('cartOverlay');
    const panel = document.getElementById('cartPanel');
    const isOpen = panel.classList.contains('open');

    if (isOpen) {
        overlay.classList.remove('open');
        panel.classList.remove('open');
        document.body.style.overflow = '';
    } else {
        overlay.classList.add('open');
        panel.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

// ============================================
// MODAL DE PRODUCTO
// ============================================
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const discount = getDiscount(product.price, product.oldPrice);
    const conditionClass = product.condition === 'A' ? 'condition-a' : product.condition === 'B' ? 'condition-b' : 'condition-c';

    document.getElementById('modalContent').innerHTML = `
        <div style="position:relative;">
            <button onclick="closeModal()" style="position:absolute;top:16px;right:16px;z-index:10;width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);border:none;color:#fff;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;" aria-label="Cerrar">
                <i class="fas fa-times"></i>
            </button>
            <div style="background:linear-gradient(135deg,#0d1812,#14201a);padding:40px;display:flex;align-items:center;justify-content:center;aspect-ratio:16/9;">
                <img src="${product.image}" alt="${product.name}" style="max-width:70%;max-height:100%;object-fit:contain;">
            </div>
        </div>
        <div style="padding:28px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                <span style="font-size:13px;color:var(--fg-muted);text-transform:uppercase;letter-spacing:0.5px;">${product.brand}</span>
                <span class="badge-condition ${conditionClass}" style="position:static;">${product.conditionLabel}</span>
                <span style="font-size:12px;background:rgba(255,77,106,0.15);color:var(--danger);padding:3px 10px;border-radius:20px;font-weight:600;">-${discount}%</span>
            </div>
            <h2 class="font-heading" style="font-size:28px;font-weight:700;margin-bottom:12px;">${product.name}</h2>
            <p style="color:var(--fg-muted);font-size:15px;line-height:1.7;margin-bottom:20px;">${product.description}</p>

            <div style="background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:20px;">
                <h4 style="font-size:13px;font-weight:600;margin-bottom:12px;color:var(--fg-muted);text-transform:uppercase;letter-spacing:0.5px;">Especificaciones</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    ${product.specs.map(s => `
                        <div style="display:flex;align-items:center;gap:8px;font-size:14px;">
                            <i class="fas fa-check-circle" style="color:var(--accent);font-size:12px;flex-shrink:0;"></i>
                            <span>${s}</span>
                        </div>`).join('')}
                </div>
            </div>

            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                <span class="price-old" style="font-size:18px;">${formatPrice(product.oldPrice)}</span>
                <span class="font-heading" style="font-size:32px;font-weight:700;color:var(--accent);">${formatPrice(product.price)}</span>
            </div>

            <div style="display:flex;gap:10px;">
                <button onclick="addToCart(${product.id});closeModal();" class="btn-primary" style="flex:1;font-size:16px;padding:16px;">
                    <i class="fas fa-shopping-bag" style="margin-right:8px;"></i>Agregar al carrito
                </button>
                <a href="https://wa.me/573214567890?text=Hola, estoy interesado en el ${product.name} reacondicionado que vi en ReconectaTech" target="_blank" rel="noopener" class="btn-outline" style="padding:16px 20px;text-decoration:none;display:flex;align-items:center;gap:8px;" aria-label="Consultar por WhatsApp">
                    <i class="fab fa-whatsapp" style="font-size:18px;"></i>
                </a>
            </div>

            <div style="display:flex;gap:16px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
                <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--fg-muted);">
                    <i class="fas fa-shield-halved" style="color:var(--accent);"></i> 3 meses garantía
                </div>
                <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--fg-muted);">
                    <i class="fas fa-truck" style="color:var(--accent);"></i> Envío nacional
                </div>
                <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--fg-muted);">
                    <i class="fas fa-rotate-left" style="color:var(--accent);"></i> 7 días devolución
                </div>
            </div>
        </div>`;

    document.getElementById('productModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('productModal').classList.remove('open');
    document.body.style.overflow = '';
}

// ============================================
// CHECKOUT SIMULADO
// ============================================
function handleCheckout(method = 'whatsapp') {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const itemsList = cart.map(i => `${i.qty}x ${i.name}`).join(', ');

    let message = "";
    if (method === 'nequi') {
        message = encodeURIComponent(
            `Hola ReconectaTech! Quiero pagar con Nequi:\n\n${cart.map(i => `* ${i.qty}x ${i.name} - ${formatPrice(i.price * i.qty)}`).join('\n')}\n\n*Total a transferir: ${formatPrice(total)}*\n\nPor favor, indíquenme el número de Nequi para enviar el comprobante.`
        );
    } else {
        message = encodeURIComponent(
            `Hola ReconectaTech! Quiero comprar:\n\n${cart.map(i => `* ${i.qty}x ${i.name} - ${formatPrice(i.price * i.qty)}`).join('\n')}\n\n*Total: ${formatPrice(total)}*\n\n¿Cuáles son los métodos de pago y envío disponibles?`
        );
    }

    toggleCart();
    showToast('Redirigiendo a WhatsApp para finalizar tu compra...', 'success');

    setTimeout(() => {
        window.open(`https://wa.me/573214567890?text=${message}`, '_blank');
    }, 800);
}

// ============================================
// FORMULARIO DE CONTACTO
// ============================================
function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const inputs = form.querySelectorAll('input, select, textarea');
    const name = inputs[0].value;
    const phone = inputs[1].value;
    const subject = inputs[2].value;
    const message = inputs[3].value;

    // Generar mensaje de WhatsApp
    const waMessage = encodeURIComponent(
        `Hola ReconectaTech, soy ${name}.\n\nTeléfono: ${phone}\nMotivo: ${subject}\n\n${message}`
    );

    showToast('Mensaje recibido. Te redirigimos a WhatsApp para respuesta inmediata.', 'success');
    form.reset();

    setTimeout(() => {
        window.open(`https://wa.me/573214567890?text=${waMessage}`, '_blank');
    }, 1000);
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';

    const colors = {
        success: 'var(--accent)',
        warning: 'var(--warm)',
        info: '#64b4ff',
        error: 'var(--danger)'
    };
    toast.style.borderLeftColor = colors[type] || colors.info;

    const icons = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
        error: 'fa-times-circle'
    };

    toast.innerHTML = `<div style="display:flex;align-items:center;gap:10px;">
        <i class="fas ${icons[type] || icons.info}" style="color:${colors[type]};"></i>
        <span>${message}</span>
    </div>`;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
}

// ============================================
// MENÚ MÓVIL
// ============================================
function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('open');
}

// ============================================
// NAVBAR SCROLL
// ============================================
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    const scrollY = window.scrollY;

    if (scrollY > 80) {
        navbar.style.background = 'rgba(10,15,13,0.9)';
        navbar.style.backdropFilter = 'blur(16px)';
        navbar.style.borderBottom = '1px solid var(--border)';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.backdropFilter = 'none';
        navbar.style.borderBottom = '1px solid transparent';
    }
    lastScroll = scrollY;
});

// ============================================
// INTERSECTION OBSERVER PARA REVEAL
// ============================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

function observeReveals() {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ============================================
// ANIMACIÓN DE CONTADORES
// ============================================
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target);
            let current = 0;
            const increment = target / 60;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                el.textContent = Math.floor(current).toLocaleString('es-CO');
            }, 25);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

// ============================================
// PARTÍCULAS DEL HERO
// ============================================
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.bottom = '-10px';
        particle.style.animationDuration = (8 + Math.random() * 12) + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.width = (1 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;
        if (Math.random() > 0.7) particle.style.background = 'var(--warm)';
        container.appendChild(particle);
    }
}

// ============================================
// HERO SHOWCASE (imágenes flotantes)
// ============================================
function createHeroShowcase() {
    const container = document.getElementById('heroShowcase');
    if (!container) return;

    const items = [
        { src: 'https://picsum.photos/seed/herophone1/300/300', x: '10%', y: '15%', size: '140px', rotate: '-8deg', delay: '0s' },
        { src: 'https://picsum.photos/seed/herolaptop1/300/300', x: '40%', y: '30%', size: '200px', rotate: '5deg', delay: '0.3s' },
        { src: 'https://picsum.photos/seed/herophone2/300/300', x: '65%', y: '10%', size: '120px', rotate: '12deg', delay: '0.6s' },
    ];

    items.forEach(item => {
        const div = document.createElement('div');
        div.style.cssText = `
            position:absolute;
            left:${item.x};
            top:${item.y};
            width:${item.size};
            height:${item.size};
            border-radius:16px;
            overflow:hidden;
            border:1px solid var(--border);
            box-shadow:0 20px 60px rgba(0,0,0,0.4);
            transform:rotate(${item.rotate});
            animation:floatBlob ${6 + Math.random() * 4}s ease-in-out infinite ${item.delay};
            background:var(--card);
        `;
        div.innerHTML = `<img src="${item.src}" style="width:100%;height:100%;object-fit:cover;opacity:0.85;">`;
        container.appendChild(div);
    });

    // Círculo decorativo central
    const circle = document.createElement('div');
    circle.style.cssText = `
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
        width:280px;
        height:280px;
        border-radius:50%;
        border:1px dashed var(--border);
        animation:floatBlob 20s ease-in-out infinite;
    `;
    container.appendChild(circle);
}

// ============================================
// RESPONSIVE GRID ADJUSTMENTS
// ============================================
function addResponsiveStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .hero-grid { grid-template-columns: 1fr !important; }
            .contact-grid { grid-template-columns: 1fr !important; }
            .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
            .footer-grid { grid-template-columns: 1fr !important; }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// CERRAR MODAL CON ESCAPE
// ============================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        const cartPanel = document.getElementById('cartPanel');
        if (cartPanel.classList.contains('open')) toggleCart();
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu.classList.contains('open')) toggleMobileMenu();
    }
});

// ============================================
// SMOOTH SCROLL PARA ANCLAS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
    createParticles();
    createHeroShowcase();
    addResponsiveStyles();
    observeReveals();
});
