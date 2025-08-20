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
    
    // Initialize gallery if opening gallery tab
    if (tabName === 'gallery') {
        initializeAdminPhotoGrid();
    }
}

// Gallery Functions
function initializeMasonryGallery() {
    const masonryGrid = document.getElementById('masonryGrid');
    if (!masonryGrid) return;
    
    masonryGrid.innerHTML = '';
    
    const masonryLayouts = [
        { class: 'tall', span: 'tall' },
        { class: '', span: 'normal' },
        { class: 'wide', span: 'wide' },
        { class: '', span: 'normal' },
        { class: 'tall', span: 'tall' },
        { class: '', span: 'normal' }
    ];
    
    let layoutIndex = 0;
    
    Object.entries(clientDatabase).forEach(([clientId, client]) => {
        const coverPhoto = client.photos?.find(photo => photo.isCover) || client.photos?.[0];
        const photoCount = client.photos?.length || 0;
        const layout = masonryLayouts[layoutIndex % masonryLayouts.length];
        
        const masonryItem = document.createElement('div');
        masonryItem.className = `masonry-item ${layout.class}`;
        masonryItem.onclick = () => openClientGallery(clientId);
        
        masonryItem.innerHTML = `
            <div class="masonry-image" style="background-image: url('${coverPhoto?.url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'}')">
                <div class="masonry-overlay">
                    <div style="color: white;">
                        <h4 style="margin: 0; font-size: 1.2rem; font-weight: 600;">${client.name}</h4>
                        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 1rem;">${client.location}</p>
                    </div>
                </div>
                <button class="masonry-view-more">📷</button>
            </div>
            <div class="masonry-content">
                <h3>${client.name}</h3>
                <p>${client.location}</p>
                <div class="masonry-stats">
                    <span class="masonry-stat">${photoCount} Photos</span>
                    <span class="masonry-stat">${client.totalSeats} Seats</span>
                    <span class="masonry-stat">${client.status}</span>
                </div>
            </div>
        `;
        
        masonryGrid.appendChild(masonryItem);
        layoutIndex++;
    });
}

function initializeGallery() {
    // This function is now replaced by initializeMasonryGallery
    initializeMasonryGallery();
}

function openClientGallery(clientId) {
    const client = clientDatabase[clientId];
    const modal = document.getElementById('galleryModal');
    const title = document.getElementById('galleryModalTitle');
    const subtitle = document.getElementById('galleryModalSubtitle');
    const photoGrid = document.getElementById('modalPhotoGrid');
    
    title.textContent = client.name;
    subtitle.textContent = `${client.location} • ${client.photos?.length || 0} Photos`;
    
    photoGrid.innerHTML = '';
    
    if (client.photos && client.photos.length > 0) {
        client.photos.forEach(photo => {
            const photoItem = document.createElement('div');
            photoItem.className = 'modal-photo-item';
            
            photoItem.innerHTML = `
                <div class="modal-photo-image" style="background-image: url('${photo.url}')"></div>
                <div class="modal-photo-info">
                    <h4>${photo.caption}</h4>
                    <p>${photo.isCover ? 'Cover Photo' : 'Gallery Photo'}</p>
                </div>
            `;
            
            photoGrid.appendChild(photoItem);
        });
    } else {
        photoGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b;">
                <h3>No Photos Available</h3>
                <p>Photos will appear here once uploaded through the admin panel.</p>
            </div>
        `;
    }
    
    modal.style.display = 'block';
}

function closeGalleryModal() {
    document.getElementById('galleryModal').style.display = 'none';
}

// Admin Photo Management
function initializeAdminPhotoGrid() {
    const adminPhotoGrid = document.getElementById('adminPhotoGrid');
    if (!adminPhotoGrid) return;
    
    adminPhotoGrid.innerHTML = '';
    
    Object.entries(clientDatabase).forEach(([clientId, client]) => {
        const photoCard = document.createElement('div');
        photoCard.className = 'admin-photo-card';
        
        const photoCount = client.photos?.length || 0;
        const thumbsHTML = client.photos?.map(photo => `
            <div class="admin-photo-thumb ${photo.isCover ? 'cover' : ''}" 
                 style="background-image: url('${photo.url}')"
                 onclick="toggleCoverPhoto('${clientId}', ${photo.id})"
                 title="${photo.caption}${photo.isCover ? ' (Cover Photo)' : ''}">
            </div>
        `).join('') || '<p style="padding: 20px; text-align: center; color: #64748b;">No photos uploaded</p>';
        
        photoCard.innerHTML = `
            <div class="admin-photo-header">
                <h4>${client.name}</h4>
                <span class="admin-photo-count">${photoCount} photos</span>
            </div>
            <div class="admin-photo-grid">
                ${thumbsHTML}
            </div>
            <div class="photo-upload-area" onclick="triggerPhotoUpload('${clientId}')">
                <p style="margin: 0; color: #64748b; font-weight: 500;">📷 Click to add photos</p>
                <p style="margin: 5px 0 0 0; font-size: 0.8rem; color: #9ca3af;">or drag and drop images here</p>
            </div>
        `;
        
        adminPhotoGrid.appendChild(photoCard);
    });
}

function uploadPhotos() {
    const clientSelect = document.getElementById('photoClientSelect');
    const fileInput = document.getElementById('photoUpload');
    
    if (!clientSelect.value) {
        alert('Please select a client first');
        return;
    }
    
    if (!fileInput.files.length) {
        alert('Please select photos to upload');
        return;
    }
    
    const clientId = clientSelect.value;
    const client = clientDatabase[clientId];
    
    // Simulate photo upload process
    Array.from(fileInput.files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newPhoto = {
                id: Date.now() + index,
                url: e.target.result,
                caption: `${client.name} - ${file.name.split('.')[0]}`,
                isCover: client.photos.length === 0 && index === 0 // First photo becomes cover if no photos exist
            };
            
            if (!client.photos) client.photos = [];
            client.photos.push(newPhoto);
            
            // Refresh displays
            initializeAdminPhotoGrid();
            initializeGallery();
        };
        reader.readAsDataURL(file);
    });
    
    // Reset form
    clientSelect.value = '';
    fileInput.value = '';
    
    alert(`${fileInput.files.length} photos uploaded successfully!`);
}

function triggerPhotoUpload(clientId) {
    document.getElementById('photoClientSelect').value = clientId;
    document.getElementById('photoUpload').click();
}

function toggleCoverPhoto(clientId, photoId) {
    const client = clientDatabase[clientId];
    if (!client.photos) return;
    
    // Remove cover status from all photos
    client.photos.forEach(photo => photo.isCover = false);
    
    // Set new cover photo
    const photo = client.photos.find(p => p.id === photoId);
    if (photo) {
        photo.isCover = true;
        initializeAdminPhotoGrid();
        initializeMasonryGallery();
        alert(`Cover photo updated for ${client.name}`);
    }
}// Global Variables
let isMobileMenuOpen = false;
let isAdminVisible = false;
let currentCustomer = 0;
let layoutDesigner;
let currentUser = null;
let selectedClient = null;
let selectedSeat = null;

// Personnel Access Codes
const adminCodes = {
    '0326': { name: 'Owner (Primary)', level: 'admin', access: ['clients', 'queue', 'gallery', 'settings', 'reports'] },
    '2323': { name: 'Owner (Secondary)', level: 'admin', access: ['clients', 'queue', 'gallery', 'settings', 'reports'] },
    '1337': { name: 'Manager', level: 'manager', access: ['clients', 'queue', 'gallery', 'reports'] },
    '5678': { name: 'Technician', level: 'tech', access: ['queue'] },
    '9999': { name: 'Guest', level: 'view', access: ['reports'] }
};

// Client Database with detailed seat information and photos
const clientDatabase = {
    'oaks-church': {
        name: 'Oaks Church',
        location: 'Sanctuary & Fellowship Hall',
        contact: 'Pastor Johnson - (555) 123-0001',
        totalSeats: 25,
        lastVisit: '2 days ago',
        status: 'Active',
        photos: [
            { id: 1, url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600', caption: 'Sanctuary Overview', isCover: true },
            { id: 2, url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600', caption: 'Pew Detail - Before', isCover: false },
            { id: 3, url: 'https://images.unsplash.com/photo-1517774133134-e8f58ac28bf1?w=600', caption: 'Pew Detail - After', isCover: false },
            { id: 4, url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600', caption: 'Pastor Chair', isCover: false }
        ],
        seats: {
            'A1': { type: 'Pew', fabric: 'Navy Blue Velvet', color: '#1e3a8a', condition: 'Good', width: 72, depth: 18, height: 32, notes: 'High back style', lastMaintenance: '2024-01-15' },
            'A2': { type: 'Pew', fabric: 'Navy Blue Velvet', color: '#1e3a8a', condition: 'Fair', width: 72, depth: 18, height: 32, notes: 'Minor wear on armrest', lastMaintenance: '2024-01-15' },
            'A3': { type: 'Pew', fabric: 'Navy Blue Velvet', color: '#1e3a8a', condition: 'Needs Repair', width: 72, depth: 18, height: 32, notes: 'Torn cushion, needs reupholster', lastMaintenance: '2023-08-12' },
            'B1': { type: 'Chair', fabric: 'Burgundy Vinyl', color: '#7f1d1d', condition: 'Good', width: 24, depth: 22, height: 36, notes: 'Stackable style', lastMaintenance: '2024-02-01' },
            'B2': { type: 'Chair', fabric: 'Burgundy Vinyl', color: '#7f1d1d', condition: 'Good', width: 24, depth: 22, height: 36, notes: 'Stackable style', lastMaintenance: '2024-02-01' },
            'P1': { type: 'Pastor Chair', fabric: 'Brown Leather', color: '#92400e', condition: 'Excellent', width: 28, depth: 26, height: 42, notes: 'High-back executive style', lastMaintenance: '2024-01-10' }
        }
    },
    'tonys-pizza': {
        name: "Tony's Pizza Palace",
        location: 'Dining Room & Bar Area',
        contact: 'Tony Ricci - (555) 123-0002',
        totalSeats: 42,
        lastVisit: '1 week ago',
        status: 'Active',
        photos: [
            { id: 5, url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', caption: 'Dining Room Overview', isCover: true },
            { id: 6, url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', caption: 'Red Booth Section', isCover: false },
            { id: 7, url: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600', caption: 'Bar Area', isCover: false },
            { id: 8, url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', caption: 'Before Restoration', isCover: false },
            { id: 9, url: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600', caption: 'After Restoration', isCover: false }
        ],
        seats: {
            'T1': { type: 'Booth Small', fabric: 'Red Vinyl', color: '#dc2626', condition: 'Good', width: 48, depth: 24, height: 30, notes: '2-person booth', lastMaintenance: '2024-01-20' },
            'T2': { type: 'Booth Small', fabric: 'Red Vinyl', color: '#dc2626', condition: 'Needs Repair', width: 48, depth: 24, height: 30, notes: 'Tear in back cushion', lastMaintenance: '2023-11-15' },
            'T3': { type: 'Booth Large', fabric: 'Red Vinyl', color: '#dc2626', condition: 'Good', width: 72, depth: 24, height: 30, notes: '4-person booth', lastMaintenance: '2024-01-20' },
            'B1': { type: 'Bar Stool', fabric: 'Black Leather', color: '#000000', condition: 'Fair', width: 16, depth: 16, height: 30, notes: 'Swivel base, chrome legs', lastMaintenance: '2023-12-10' },
            'B2': { type: 'Bar Stool', fabric: 'Black Leather', color: '#000000', condition: 'Good', width: 16, depth: 16, height: 30, notes: 'Swivel base, chrome legs', lastMaintenance: '2024-01-05' },
            'C1': { type: 'Chair', fabric: 'Brown Vinyl', color: '#92400e', condition: 'Good', width: 20, depth: 20, height: 32, notes: 'Standard dining chair', lastMaintenance: '2024-01-18' }
        }
    },
    'corner-cafe': {
        name: 'Corner Café',
        location: 'Main Dining & Patio',
        contact: 'Sarah Mitchell - (555) 123-0003',
        totalSeats: 18,
        lastVisit: '3 weeks ago',
        status: 'Active',
        photos: [
            { id: 10, url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600', caption: 'Cozy Interior', isCover: true },
            { id: 11, url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600', caption: 'Window Booth', isCover: false },
            { id: 12, url: 'https://images.unsplash.com/photo-1556909045-f58de08b9c90?w=600', caption: 'Patio Seating', isCover: false }
        ],
        seats: {
            'A1': { type: 'Booth Small', fabric: 'Cream Fabric', color: '#fef3c7', condition: 'Good', width: 45, depth: 22, height: 28, notes: 'Corner booth', lastMaintenance: '2024-01-08' },
            'A2': { type: 'Booth Small', fabric: 'Cream Fabric', color: '#fef3c7', condition: 'Good', width: 45, depth: 22, height: 28, notes: 'Window booth', lastMaintenance: '2024-01-08' },
            'C1': { type: 'Chair', fabric: 'Green Vinyl', color: '#16a34a', condition: 'Fair', width: 18, depth: 18, height: 30, notes: 'Outdoor rated', lastMaintenance: '2023-10-22' },
            'C2': { type: 'Chair', fabric: 'Green Vinyl', color: '#16a34a', condition: 'Good', width: 18, depth: 18, height: 30, notes: 'Outdoor rated', lastMaintenance: '2024-01-12' }
        }
    }
};

// Navigation Functions
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showSection(sectionName) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const sectionMap = {
        'services': 'servicesSection',
        'design': 'designSection',
        'quote': 'quoteSection',
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
    if (!isAdminVisible) {
        // Show login prompt when accessing admin
        const code = prompt('🔒 Admin Access Code:');
        
        // Check if code exists in our system
        if (adminCodes[code]) {
            currentUser = adminCodes[code];
            const panel = document.getElementById('adminPanel');
            isAdminVisible = true;
            panel.style.display = 'block';
            
            // Update admin panel based on user access
            updateAdminInterface();
            
            // Add some retro flair with personalized message
            console.log(`🎯 Access Granted - Welcome ${currentUser.name}`);
            console.log(`📋 Access Level: ${currentUser.level.toUpperCase()}`);
            
            document.body.style.filter = 'hue-rotate(10deg)';
            setTimeout(() => {
                document.body.style.filter = 'none';
            }, 1000);
            
            // Show welcome message
            alert(`✅ Welcome ${currentUser.name}!\nAccess Level: ${currentUser.level.toUpperCase()}`);
            
        } else if (code !== null) {
            // Wrong code (but they didn't cancel)
            alert('❌ Access Denied - Invalid Code');
            console.log('🚫 Unauthorized access attempt detected');
            console.log(`🕵️ Failed code attempt: ${code}`);
        }
        // If they cancel (code === null), do nothing
    } else {
        // Close admin panel
        const panel = document.getElementById('adminPanel');
        isAdminVisible = false;
        panel.style.display = 'none';
        currentUser = null;
        console.log('🚪 Admin session ended');
    }
}

function updateAdminInterface() {
    // Update header with user info
    const adminHeader = document.querySelector('.admin-header h2');
    adminHeader.textContent = `Admin Dashboard - ${currentUser.name} (${currentUser.level})`;
    
    // Show/hide tabs based on access level
    const allTabs = document.querySelectorAll('.tab-btn');
    allTabs.forEach(tab => {
        const tabType = tab.textContent.toLowerCase().includes('client') ? 'clients' :
                       tab.textContent.toLowerCase().includes('queue') ? 'queue' :
                       tab.textContent.toLowerCase().includes('settings') ? 'settings' :
                       tab.textContent.toLowerCase().includes('reports') ? 'reports' : '';
        
        if (currentUser.access.includes(tabType)) {
            tab.style.display = 'block';
            tab.disabled = false;
        } else {
            tab.style.display = 'none';
        }
    });
    
    // Auto-select first available tab
    const firstAvailableTab = document.querySelector('.tab-btn[style*="block"], .tab-btn:not([style])');
    if (firstAvailableTab) {
        // Remove active from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Activate first available tab
        firstAvailableTab.classList.add('active');
        const tabName = firstAvailableTab.textContent.toLowerCase().includes('client') ? 'clients' :
                       firstAvailableTab.textContent.toLowerCase().includes('queue') ? 'queue' :
                       firstAvailableTab.textContent.toLowerCase().includes('settings') ? 'settings' :
                       firstAvailableTab.textContent.toLowerCase().includes('reports') ? 'reports' : 'clients';
        
        const targetTab = document.getElementById(tabName + 'Tab');
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }
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

// Client Management Functions
function showClientDetails(clientId) {
    selectedClient = clientId;
    const client = clientDatabase[clientId];
    
    // Hide list view, show detail view
    document.getElementById('clientListView').style.display = 'none';
    document.getElementById('clientDetailView').style.display = 'block';
    
    // Update client header
    const header = document.getElementById('clientHeader');
    header.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h2 style="margin-bottom: 5px;">${client.name}</h2>
                <p style="opacity: 0.9; margin-bottom: 10px;">${client.location}</p>
                <p style="opacity: 0.8; font-size: 0.9rem;">${client.contact}</p>
            </div>
            <div style="text-align: right;">
                <div style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 4px; margin-bottom: 10px;">
                    <div style="font-size: 1.5rem; font-weight: bold;">${Object.keys(client.seats).length}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Total Seats</div>
                </div>
                <div style="font-size: 0.9rem; opacity: 0.8;">Last Visit: ${client.lastVisit}</div>
            </div>
        </div>
    `;
    
    // Update seat table
    updateSeatTable(client.seats);
}

function backToClientList() {
    document.getElementById('clientDetailView').style.display = 'none';
    document.getElementById('clientListView').style.display = 'block';
    selectedClient = null;
}

function updateSeatTable(seats) {
    const tbody = document.getElementById('seatTableBody');
    tbody.innerHTML = '';
    
    Object.entries(seats).forEach(([seatId, seat]) => {
        const conditionColor = {
            'Excellent': '#16a34a',
            'Good': '#16a34a',
            'Fair': '#eab308',
            'Needs Repair': '#dc2626'
        }[seat.condition];
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${seatId}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${seat.type}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 20px; height: 20px; background: ${seat.color}; border-radius: 3px; border: 1px solid #ccc;"></div>
                    ${seat.fabric}
                </div>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${seat.color}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: monospace; font-size: 0.9rem;">${seat.width}×${seat.depth}×${seat.height}"</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <span style="background: ${conditionColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">
                    ${seat.condition}
                </span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem;">${seat.lastMaintenance}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <button onclick="showSeatDetail('${seatId}')" style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">Details</button>
                <button onclick="generateSeatBOM('${seatId}')" style="background: #16a34a; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; cursor: pointer; margin-left: 5px;">BOM</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showSeatDetail(seatId) {
    selectedSeat = seatId;
    const client = clientDatabase[selectedClient];
    const seat = client.seats[seatId];
    
    document.getElementById('seatModalTitle').textContent = `${client.name} - Seat ${seatId}`;
    document.getElementById('seatModalContent').innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
                <h4 style="margin-bottom: 10px; color: #1a1a2e;">Seat Information</h4>
                <p><strong>Type:</strong> ${seat.type}</p>
                <p><strong>Fabric:</strong> ${seat.fabric}</p>
                <p><strong>Color:</strong> ${seat.color}</p>
                <p><strong>Condition:</strong> ${seat.condition}</p>
                <p><strong>Last Maintenance:</strong> ${seat.lastMaintenance}</p>
            </div>
            <div>
                <h4 style="margin-bottom: 10px; color: #1a1a2e;">Dimensions</h4>
                <p><strong>Width:</strong> ${seat.width} inches</p>
                <p><strong>Depth:</strong> ${seat.depth} inches</p>
                <p><strong>Height:</strong> ${seat.height} inches</p>
                <div style="margin-top: 15px; background: ${seat.color}; width: 60px; height: 40px; border-radius: 4px; border: 1px solid #ccc;"></div>
            </div>
        </div>
        <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 10px; color: #1a1a2e;">Notes</h4>
            <p style="background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb;">${seat.notes}</p>
        </div>
        <div style="display: flex; gap: 10px;">
            <button onclick="generateSeatBOM('${seatId}')" class="btn">Generate BOM</button>
            <button onclick="scheduleMaintenance('${seatId}')" class="btn secondary">Schedule Service</button>
        </div>
    `;
    
    document.getElementById('seatDetailModal').style.display = 'block';
}

function closeSeatModal() {
    document.getElementById('seatDetailModal').style.display = 'none';
    selectedSeat = null;
}

function generateSeatBOM(seatId) {
    const client = clientDatabase[selectedClient];
    const seat = client.seats[seatId];
    
    // Calculate fabric needed (simplified calculation)
    const fabricYards = Math.ceil((seat.width * seat.depth * 2) / 1296); // Convert sq inches to yards
    const laborHours = seat.type.includes('Booth') ? 3 : 2;
    const totalCost = (fabricYards * 25) + (laborHours * 45) + 15; // Fabric + Labor + Materials
    
    const bomContent = `
======================================
BILL OF MATERIALS
======================================
Client: ${client.name}
Seat ID: ${seatId}
Date: ${new Date().toLocaleDateString()}
======================================

SEAT DETAILS:
- Type: ${seat.type}
- Dimensions: ${seat.width}" × ${seat.depth}" × ${seat.height}"
- Current Fabric: ${seat.fabric}
- Color: ${seat.color}
- Condition: ${seat.condition}

MATERIALS NEEDED:
- Fabric: ${fabricYards} yards (${seat.fabric})
- Batting/Foam: 1 sheet
- Thread: 2 spools
- Zipper: 1 (if applicable)
- Piping: 10 feet

LABOR:
- Estimated Hours: ${laborHours}
- Rate: $45/hour

COST BREAKDOWN:
- Fabric (${fabricYards} yards @ $25): ${fabricYards * 25}
- Labor (${laborHours} hours @ $45): ${laborHours * 45}
- Materials & Supplies: $15
- Total Estimate: ${totalCost}

NOTES:
${seat.notes}

======================================
Quality Care Upholstery
Phone: (555) 123-4567
======================================
    `;
    
    // Create downloadable file
    const blob = new Blob([bomContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BOM_${client.name.replace(/\s+/g, '_')}_${seatId}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    alert(`BOM generated for ${client.name} - Seat ${seatId}\nEstimated Cost: ${totalCost}`);
}

function printBOM() {
    if (!selectedClient) {
        alert('Please select a client first');
        return;
    }
    
    const client = clientDatabase[selectedClient];
    let totalEstimate = 0;
    
    let bomContent = `
======================================
COMPLETE BILL OF MATERIALS
======================================
Client: ${client.name}
Location: ${client.location}
Contact: ${client.contact}
Date: ${new Date().toLocaleDateString()}
======================================

SEAT INVENTORY:
`;
    
    Object.entries(client.seats).forEach(([seatId, seat]) => {
        const fabricYards = Math.ceil((seat.width * seat.depth * 2) / 1296);
        const laborHours = seat.type.includes('Booth') ? 3 : 2;
        const seatCost = (fabricYards * 25) + (laborHours * 45) + 15;
        totalEstimate += seatCost;
        
        bomContent += `
${seatId} - ${seat.type}
  Fabric: ${seat.fabric} (${seat.color})
  Size: ${seat.width}" × ${seat.depth}" × ${seat.height}"
  Condition: ${seat.condition}
  Est. Cost: ${seatCost}
  Notes: ${seat.notes}
`;
    });
    
    bomContent += `
======================================
TOTAL ESTIMATE: ${totalEstimate}
======================================
Quality Care Upholstery
Phone: (555) 123-4567
======================================
    `;
    
    // Create downloadable file
    const blob = new Blob([bomContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Complete_BOM_${client.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    alert(`Complete BOM generated for ${client.name}\nTotal Estimate: ${totalEstimate}`);
}

function scheduleMaintenance(seatId) {
    alert(`Scheduling maintenance for seat ${seatId}. This feature will integrate with your calendar system.`);
}

// Remove the customer carousel functions since we're not using them anymore

// Initialize Everything
document.addEventListener('DOMContentLoaded', function() {
    // Initialize layout designer
    layoutDesigner = new LayoutDesigner();
    
    // Initialize masonry gallery
    initializeMasonryGallery();
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileNav = document.getElementById('mobileNav');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (isMobileMenuOpen && !mobileNav.contains(e.target) && !mobileMenu.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close gallery modal when clicking outside
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('galleryModal');
        if (e.target === modal) {
            closeGalleryModal();
        }
    });
});
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

// Remove the auto-cycling customer code since we're not using it anymore

// Initialize Everything
document.addEventListener('DOMContentLoaded', function() {
    showLanding();
    
    // Initialize layout designer
    layoutDesigner = new LayoutDesigner();
    
    // Initialize gallery
    initializeGallery();
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileNav = document.getElementById('mobileNav');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (isMobileMenuOpen && !mobileNav.contains(e.target) && !mobileMenu.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close gallery modal when clicking outside
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('galleryModal');
        if (e.target === modal) {
            closeGalleryModal();
        }
    });
});// Global Variables
let isMobileMenuOpen = false;
let isAdminVisible = false;
let currentCustomer = 0;
let layoutDesigner;
let currentUser = null;
let selectedClient = null;
let selectedSeat = null;

// Personnel Access Codes
const adminCodes = {
    '0326': { name: 'Owner (Primary)', level: 'admin', access: ['clients', 'queue', 'settings', 'reports'] },
    '2323': { name: 'Owner (Secondary)', level: 'admin', access: ['clients', 'queue', 'settings', 'reports'] },
    '1337': { name: 'Manager', level: 'manager', access: ['clients', 'queue', 'reports'] },
    '5678': { name: 'Technician', level: 'tech', access: ['queue'] },
    '9999': { name: 'Guest', level: 'view', access: ['reports'] }
};

// Client Database with detailed seat information
const clientDatabase = {
    'oaks-church': {
        name: 'Oaks Church',
        location: 'Sanctuary & Fellowship Hall',
        contact: 'Pastor Johnson - (555) 123-0001',
        totalSeats: 25,
        lastVisit: '2 days ago',
        status: 'Active',
        seats: {
            'A1': { type: 'Pew', fabric: '