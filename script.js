// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');

if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        navbar.style.backgroundColor =
            currentScroll > 100 ? 'rgba(18, 18, 18, 0.95)' : 'rgba(18, 18, 18, 0.8)';
    });
}

// Utility to escape HTML (for code snippets)
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function (m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
}

// Menu Rendering
function renderMenu(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = items.map(item => `
        <div class="menu-item">
            <img src="${item.image}" alt="${item.name}" class="menu-item-image" loading="lazy">
            <h3 class="menu-item-name">${item.name}</h3>
            <div class="menu-item-price">$${item.price.toFixed(2)}</div>
            <p class="menu-item-description">${item.description}</p>
        </div>
    `).join('');

    observeNewElements(container.querySelectorAll('.menu-item'));
}

// Blog Rendering
let blogsData = [];

function renderBlogs(blogs) {
    const container = document.getElementById('blogGrid');
    if (!container) return;

    blogsData = blogs; // store for modal

    container.innerHTML = blogs.map(blog => `
        <div class="blog-card" onclick="openBlogModal(${blog.id})">
            <img src="${blog.image}" alt="${blog.title}" class="blog-card-image" loading="lazy">
            <div class="blog-card-content">
                <h3 class="blog-card-title">${blog.title}</h3>
                <div class="blog-card-meta">
                    <span>${blog.date}</span> | <span>By ${blog.author}</span>
                </div>
                <p class="blog-card-excerpt">${blog.excerpt}</p>
                <div class="blog-card-tags">
                    ${blog.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');

    observeNewElements(container.querySelectorAll('.blog-card'));
}

// Intersection Observer for fade-in
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

function observeNewElements(elements) {
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Fetch Menus
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('featuredMenu')) {
        fetch('./menu.json')
            .then(res => res.json())
            .then(data => renderMenu(data.filter(i => i.category === 'coffee').slice(0, 3), 'featuredMenu'))
            .catch(err => console.error(err));
    }

    if (document.getElementById('coffeeMenu')) {
        fetch('./menu.json')
            .then(res => res.json())
            .then(data => {
                renderMenu(data.filter(i => i.category === 'coffee'), 'coffeeMenu');
                renderMenu(data.filter(i => i.category === 'food'), 'foodMenu');
            })
            .catch(err => console.error(err));
    }

    if (document.getElementById('blogGrid')) {
        fetch('./blogs.json')
            .then(res => res.json())
            .then(data => renderBlogs(data))
            .catch(err => console.error(err));
    }
});

// Blog Modal
function openBlogModal(blogId) {
    const blog = blogsData.find(b => b.id === blogId);
    if (!blog) return;

    const modal = document.getElementById('blogModal');
    const modalBody = document.getElementById('blogModalBody');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <img src="${blog.image}" alt="${blog.title}" class="blog-modal-image">
        <h2 class="blog-modal-title">${blog.title}</h2>
        <div class="blog-modal-meta">
            <span>${blog.date}</span> | <span>By ${blog.author}</span>
            <div class="blog-card-tags">${blog.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}</div>
        </div>
        <div class="blog-modal-content-text">${blog.content}</div>
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeBlogModal() {
    const modal = document.getElementById('blogModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

const modalClose = document.getElementById('blogModalClose');
const modalOverlay = document.getElementById('blogModalOverlay');
if (modalClose) modalClose.addEventListener('click', closeBlogModal);
if (modalOverlay) modalOverlay.addEventListener('click', closeBlogModal);

// Leaflet Map
if (document.getElementById('map')) {
    const map = L.map('map').setView([37.7749, -122.4194], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    L.marker([37.7749, -122.4194]).addTo(map)
        .bindPopup('<b>Java Buzz</b><br>123 Developer Street<br>San Francisco, CA').openPopup();
}

// Order Form
const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', e => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            orderType: document.getElementById('orderType').value,
            message: document.getElementById('message').value,
            timestamp: new Date().toISOString()
        };
        const orders = JSON.parse(localStorage.getItem('javaBuzzOrders') || '[]');
        orders.push(formData);
        localStorage.setItem('javaBuzzOrders', JSON.stringify(orders));

        orderForm.style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';

        setTimeout(() => {
            orderForm.reset();
            orderForm.style.display = 'flex';
            document.getElementById('successMessage').style.display = 'none';
        }, 5000);
    });
}