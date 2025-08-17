// Global Variables
let isMobileMenuOpen = false;
let isAdminVisible = false;
let currentCustomer = 0;
let layoutDesigner;

// Navigation Functions
function showLanding() {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
}

function showSection(sectionName) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const sectionMap = {
        'services': 'servicesSection',
        'design': 'designSection',
        'contact': 'contactSection',
        'access': 'accessSection'
    };
    
    const targetSection = document.getElementById(sectionMap[sectionName]);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    isMobileMenuOpen = !isMobileMenuOpen;
    mobileNav.classList.toggle('active');
}

function closeMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    isMobileMenuOpen = false;
    mobileNav.classList.remove('active');
}

// Admin Functions
function toggleAdmin() {
    const panel = document.getElementById('adminPanel');
    isAdminVisible = !isAdminVisible;
    panel.style.display = isAdminVisible ? 'block' : 'none';
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName + 'Tab').classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.textContent.toLowerCase().includes(tabName)) {
            btn.classList.add('active');
        }
    });
}

// Customer Carousel Functions
function showCustomer(index) {
    const customers = document.querySelectorAll('.customer-card');
    const dots = document.querySelectorAll('.dot');
    
    customers.forEach(card => card.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    customers[index].classList.add('active');
    dots[index].classList.add('active');
    
    currentCustomer = index;
}

function accessPortal() {
    alert('Portal access would redirect to client seat map');
}

// Layout Designer Class
class LayoutDesigner {
    constructor() {
        this.draggedItem = null;
        this.selectedSeat = null;
        this.seatCounter = 1;
        this.restaurantLayout = {};
        this.autosnapEnabled = true;
        this.gridDimensions = this.getGridDimensions();
        this.init();
    }
    
    getGridDimensions() {
        const width = window.innerWidth;
        if (width <= 480) return { rows: 5, cols: 6 };
        if (width <= 768) return { rows: 6, cols: 8 };
        return { rows: 8, cols: 10 };
    }
    
    init() {
        this.initializeGrid();
        this.setupEventListeners();
        window.addEventListener('resize', () => this.handleResize());
    }
    
    setupEventListeners() {
        document.querySelectorAll('.seat-icon').forEach(icon => {
            icon.addEventListener('dragstart', (e) => this.handleDragStart(e));
            icon.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });
    }
    
    handleResize() {
        const newDimensions = this.getGridDimensions();
        if (newDimensions.rows !== this.gridDimensions.rows || 
            newDimensions.cols !== this.gridDimensions.cols) {
            this.gridDimensions = newDimensions;
            this.initializeGrid();
        }
    }
    
    initializeGrid() {
        const grid = document.getElementById('restaurantGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${this.gridDimensions.cols}, 40px)`;
        grid.style.gridTemplateRows = `repeat(${this.gridDimensions.rows}, 40