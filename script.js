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
        grid.style.gridTemplateRows = `repeat(${this.gridDimensions.rows}, 40px)`;
        
        for (let row = 0; row < this.gridDimensions.rows; row++) {
            for (let col = 0; col < this.gridDimensions.cols; col++) {
                const cell = this.createGridCell(row, col);
                grid.appendChild(cell);
            }
        }
    }
    
    createGridCell(row, col) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        cell.addEventListener('click', () => this.selectCell(cell));
        cell.addEventListener('dragover', (e) => this.handleDragOver(e));
        cell.addEventListener('drop', (e) => this.handleDrop(e));
        
        return cell;
    }
    
    handleDragStart(e) {
        this.draggedItem = {
            type: e.target.dataset.type,
            size: e.target.dataset.size
        };
        e.target.classList.add('dragging');
    }
    
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedItem = null;
    }
    
    handleDragOver(e) {
        e.preventDefault();
        if (this.draggedItem && this.autosnapEnabled) {
            e.target.classList.add('drop-zone');
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.target.classList.remove('drop-zone');
        
        if (!this.draggedItem) return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const [width, height] = this.draggedItem.size.split('x').map(Number);
        
        if (this.canPlaceSeat(row, col, width, height)) {
            this.placeSeat(row, col, width, height, this.draggedItem.type);
        }
    }
    
    canPlaceSeat(row, col, width, height) {
        for (let r = row; r < row + height; r++) {
            for (let c = col; c < col + width; c++) {
                if (r >= this.gridDimensions.rows || c >= this.gridDimensions.cols) return false;
                
                const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (cell?.classList.contains('occupied')) return false;
            }
        }
        return true;
    }
    
    placeSeat(row, col, width, height, type) {
        const seatId = `${type.toUpperCase()}-${this.seatCounter++}`;
        const shortId = this.getShortId(type);
        
        for (let r = row; r < row + height; r++) {
            for (let c = col; c < col + width; c++) {
                const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (cell) {
                    cell.classList.add('occupied');
                    cell.dataset.seatId = seatId;
                    
                    if (r === row && c === col) {
                        cell.textContent = shortId;
                    }
                }
            }
        }
        
        this.restaurantLayout[seatId] = {
            type, position: { row, col }, size: { width, height },
            fabric: '', color: '', condition: 'Good', notes: ''
        };
    }
    
    selectCell(cell) {
        if (!cell.classList.contains('occupied')) return;
        
        this.selectedSeat = cell.dataset.seatId;
        const seatData = this.restaurantLayout[this.selectedSeat];
        this.showSeatDetails(seatData);
    }
    
    showSeatDetails(seatData) {
        document.getElementById('seatDetails').style.display = 'block';
        document.getElementById('seatId').textContent = this.selectedSeat;
        document.getElementById('seatType').textContent = seatData.type.replace('-', ' ');
        
        const form = document.getElementById('seatForm');
        form.fabric.value = seatData.fabric;
        form.color.value = seatData.color;
        form.condition.value = seatData.condition;
        form.notes.value = seatData.notes;
    }
    
    saveSeatDetails() {
        if (!this.selectedSeat) return;
        
        const form = document.getElementById('seatForm');
        this.restaurantLayout[this.selectedSeat] = {
            ...this.restaurantLayout[this.selectedSeat],
            fabric: form.fabric.value,
            color: form.color.value,
            condition: form.condition.value,
            notes: form.notes.value
        };
        
        alert('Seat details saved!');
    }
    
    removeSeat() {
        if (!this.selectedSeat) return;
        
        const seatData = this.restaurantLayout[this.selectedSeat];
        const { row, col } = seatData.position;
        const { width, height } = seatData.size;
        
        for (let r = row; r < row + height; r++) {
            for (let c = col; c < col + width; c++) {
                const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (cell) {
                    cell.classList.remove('occupied');
                    cell.textContent = '';
                    delete cell.dataset.seatId;
                }
            }
        }
        
        delete this.restaurantLayout[this.selectedSeat];
        document.getElementById('seatDetails').style.display = 'none';
        this.selectedSeat = null;
    }
    
    getShortId(type) {
        const ids = { 'small-booth': 'SB', 'big-booth': 'BB', 'chair': 'C', 'barstool': 'BS' };
        return ids[type] || 'S';
    }
    
    clearGrid() {
        if (confirm('Clear all seats?')) {
            this.restaurantLayout = {};
            this.seatCounter = 1;
            this.selectedSeat = null;
            document.getElementById('seatDetails').style.display = 'none';
            this.initializeGrid();
        }
    }
    
    exportLayout() {
        const name = prompt('Restaurant name:') || 'Restaurant';
        const data = {
            restaurant: name,
            layout: this.restaurantLayout,
            created: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${name.replace(/\s+/g, '_')}_layout.json`;
        link.click();
    }
    
    loadSampleLayout() {
        this.restaurantLayout = {
            'SMALL-BOOTH-1': { 
                type: 'small-booth', position: {row: 1, col: 1}, size: {width: 2, height: 1}, 
                fabric: 'Vinyl', color: 'Brown', condition: 'Good', notes: '' 
            },
            'BIG-BOOTH-1': { 
                type: 'big-booth', position: {row: 3, col: 3}, size: {width: 3, height: 2}, 
                fabric: 'Leather', color: 'Black', condition: 'Fair', notes: 'Corner booth' 
            }
        };
        
        this.initializeGrid();
        this.renderExistingSeats();
        this.seatCounter = 3;
    }
    
    renderExistingSeats() {
        Object.entries(this.restaurantLayout).forEach(([seatId, data]) => {
            const { row, col } = data.position;
            const { width, height } = data.size;
            
            for (let r = row; r < row + height; r++) {
                for (let c = col; c < col + width; c++) {
                    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    if (cell) {
                        cell.classList.add('occupied');
                        cell.dataset.seatId = seatId;
                        
                        if (r === row && c === col) {
                            cell.textContent = this.getShortId(data.type);
                        }
                    }
                }
            }
        });
    }
}

// Global Layout Designer Functions
function toggleAutosnap() {
    if (layoutDesigner) {
        layoutDesigner.autosnapEnabled = document.getElementById('autosnapToggle').checked;
    }
}

function toggleGridView() {
    const grid = document.getElementById('restaurantGrid');
    grid.classList.toggle('hide-grid');
}

function saveSeatDetails() {
    if (layoutDesigner) layoutDesigner.saveSeatDetails();
}

function removeSeat() {
    if (layoutDesigner) layoutDesigner.removeSeat();
}

function clearGrid() {
    if (layoutDesigner) layoutDesigner.clearGrid();
}

function exportLayout() {
    if (layoutDesigner) layoutDesigner.exportLayout();
}

function loadSampleLayout() {
    if (layoutDesigner) layoutDesigner.loadSampleLayout();
}

// Auto-cycle customers
setInterval(() => {
    const customers = document.querySelectorAll('.customer-card');
    if (customers.length > 0) {
        currentCustomer = (currentCustomer + 1) % customers.length;
        showCustomer(currentCustomer);
    }
}, 3000);

// Initialize Everything
document.addEventListener('DOMContentLoaded', function() {
    showLanding();
    
    // Initialize layout designer
    layoutDesigner = new LayoutDesigner();
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileNav = document.getElementById('mobileNav');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (isMobileMenuOpen && !mobileNav.contains(e.target) && !mobileMenu.contains(e.target)) {
            closeMobileMenu();
        }
    });
});