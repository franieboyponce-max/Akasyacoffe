/* =============================================
   AKASYA COFFEE - INVENTORY MANAGEMENT SYSTEM
   JavaScript Application Logic
   ============================================= */

const app = (function() {
    'use strict';

    // ==========================================
    // LOCALSTORAGE DATABASE
    // ==========================================
    const DB = {
        get(key) {
            try {
                const data = localStorage.getItem('akasya_' + key);
                return data ? JSON.parse(data) : null;
            } catch(e) { return null; }
        },
        set(key, value) {
            localStorage.setItem('akasya_' + key, JSON.stringify(value));
        },
        keys: {
            inventory: 'inventory',
            suppliers: 'suppliers',
            transactions: 'transactions',
            recipes: 'recipes',
            settings: 'settings',
            initialized: 'initialized'
        }
    };

    // ==========================================
    // STATE
    // ==========================================
    let currentPage = 'dashboard';
    let inventorySort = { field: 'name', dir: 'asc' };
    let inventoryFilter = { search: '', category: '', supplier: '', status: '' };
    let inventoryPageNum = 1;
    const inventoryPerPage = 15;
    let confirmCallback = null;

    // ==========================================
    // SAMPLE DATA
    // ==========================================
    function getSampleInventory() {
        return [
            { id: genId(), sku: 'COF-001', name: 'Arabica Coffee Beans', category: 'Coffee Beans', supplierId: '', unit: 'kg', cost: 450, reorderLevel: 5, qtyWarehouse: 25, qtyBamban: 8, qtyCapas: 6, desc: 'Premium Arabica whole beans' },
            { id: genId(), sku: 'COF-002', name: 'Robusta Coffee Beans', category: 'Coffee Beans', supplierId: '', unit: 'kg', cost: 320, reorderLevel: 5, qtyWarehouse: 18, qtyBamban: 5, qtyCapas: 4, desc: 'Robusta blend for espresso' },
            { id: genId(), sku: 'COF-003', name: 'Espresso Beans Dark Roast', category: 'Coffee Beans', supplierId: '', unit: 'kg', cost: 500, reorderLevel: 3, qtyWarehouse: 12, qtyBamban: 4, qtyCapas: 3, desc: 'Dark roast for espresso shots' },
            { id: genId(), sku: 'MIL-001', name: 'Fresh Whole Milk', category: 'Milk & Dairy', supplierId: '', unit: 'L', cost: 85, reorderLevel: 10, qtyWarehouse: 40, qtyBamban: 15, qtyCapas: 12, desc: 'Fresh whole milk 1L cartons' },
            { id: genId(), sku: 'MIL-002', name: 'Oat Milk (Barista)', category: 'Milk & Dairy', supplierId: '', unit: 'L', cost: 180, reorderLevel: 8, qtyWarehouse: 20, qtyBamban: 8, qtyCapas: 6, desc: 'Oatly Barista Edition oat milk' },
            { id: genId(), sku: 'MIL-003', name: 'Almond Milk', category: 'Milk & Dairy', supplierId: '', unit: 'L', cost: 150, reorderLevel: 6, qtyWarehouse: 15, qtyBamban: 5, qtyCapas: 4, desc: 'Unsweetened almond milk' },
            { id: genId(), sku: 'MIL-004', name: 'Condensed Milk', category: 'Milk & Dairy', supplierId: '', unit: 'can', cost: 45, reorderLevel: 12, qtyWarehouse: 48, qtyBamban: 16, qtyCapas: 14, desc: 'Sweetened condensed milk' },
            { id: genId(), sku: 'POW-001', name: 'Chocolate Powder', category: 'Powders', supplierId: '', unit: 'kg', cost: 380, reorderLevel: 4, qtyWarehouse: 10, qtyBamban: 3, qtyCapas: 3, desc: 'Premium Dutch cocoa powder' },
            { id: genId(), sku: 'POW-002', name: 'Matcha Green Tea Powder', category: 'Powders', supplierId: '', unit: 'g', cost: 850, reorderLevel: 200, qtyWarehouse: 800, qtyBamban: 200, qtyCapas: 150, desc: 'Ceremonial grade matcha' },
            { id: genId(), sku: 'POW-003', name: 'Vanilla Powder', category: 'Powders', supplierId: '', unit: 'g', cost: 320, reorderLevel: 250, qtyWarehouse: 600, qtyBamban: 150, qtyCapas: 100, desc: 'Natural vanilla powder' },
            { id: genId(), sku: 'SYR-001', name: 'Vanilla Syrup', category: 'Syrups', supplierId: '', unit: 'bottle', cost: 220, reorderLevel: 5, qtyWarehouse: 15, qtyBamban: 5, qtyCapas: 4, desc: 'Monin vanilla syrup 750ml' },
            { id: genId(), sku: 'SYR-002', name: 'Caramel Syrup', category: 'Syrups', supplierId: '', unit: 'bottle', cost: 220, reorderLevel: 5, qtyWarehouse: 14, qtyBamban: 4, qtyCapas: 4, desc: 'Monin caramel syrup 750ml' },
            { id: genId(), sku: 'SYR-003', name: 'Hazelnut Syrup', category: 'Syrups', supplierId: '', unit: 'bottle', cost: 240, reorderLevel: 4, qtyWarehouse: 10, qtyBamban: 3, qtyCapas: 3, desc: 'Monin hazelnut syrup 750ml' },
            { id: genId(), sku: 'CUP-001', name: 'Paper Cups (12oz)', category: 'Cups & Lids', supplierId: '', unit: 'pcs', cost: 4.5, reorderLevel: 200, qtyWarehouse: 2000, qtyBamban: 500, qtyCapas: 400, desc: 'Double wall hot cups 12oz' },
            { id: genId(), sku: 'CUP-002', name: 'Paper Cups (16oz)', category: 'Cups & Lids', supplierId: '', unit: 'pcs', cost: 5, reorderLevel: 150, qtyWarehouse: 1500, qtyBamban: 400, qtyCapas: 350, desc: 'Double wall hot cups 16oz' },
            { id: genId(), sku: 'CUP-003', name: 'Cup Lids (Flat)', category: 'Cups & Lids', supplierId: '', unit: 'pcs', cost: 2, reorderLevel: 200, qtyWarehouse: 2500, qtyBamban: 600, qtyCapas: 500, desc: 'Flat lids for hot cups' },
            { id: genId(), sku: 'CUP-004', name: 'Cup Lids (Dome)', category: 'Cups & Lids', supplierId: '', unit: 'pcs', cost: 2.5, reorderLevel: 100, qtyWarehouse: 1200, qtyBamban: 300, qtyCapas: 250, desc: 'Dome lids for iced drinks' },
            { id: genId(), sku: 'CUP-005', name: 'Plastic Straws', category: 'Cups & Lids', supplierId: '', unit: 'pcs', cost: 0.8, reorderLevel: 500, qtyWarehouse: 5000, qtyBamban: 1000, qtyCapas: 1000, desc: 'Biodegradable straws' },
            { id: genId(), sku: 'CON-001', name: 'Sugar Packets (White)', category: 'Consumables', supplierId: '', unit: 'pcs', cost: 0.3, reorderLevel: 1000, qtyWarehouse: 10000, qtyBamban: 2000, qtyCapas: 2000, desc: 'Individual sugar sachets' },
            { id: genId(), sku: 'CON-002', name: 'Sugar Packets (Brown)', category: 'Consumables', supplierId: '', unit: 'pcs', cost: 0.35, reorderLevel: 500, qtyWarehouse: 5000, qtyBamban: 1000, qtyCapas: 1000, desc: 'Individual brown sugar sachets' },
            { id: genId(), sku: 'CON-003', name: 'Napkins (2-ply)', category: 'Consumables', supplierId: '', unit: 'pcs', cost: 0.5, reorderLevel: 500, qtyWarehouse: 8000, qtyBamban: 1500, qtyCapas: 1500, desc: 'White 2-ply napkins' },
            { id: genId(), sku: 'CON-004', name: 'Stirrers (Wooden)', category: 'Consumables', supplierId: '', unit: 'pcs', cost: 0.2, reorderLevel: 500, qtyWarehouse: 6000, qtyBamban: 1200, qtyCapas: 1200, desc: 'Wooden coffee stirrers' },
            { id: genId(), sku: 'CLN-001', name: 'Dishwashing Liquid', category: 'Cleaning', supplierId: '', unit: 'bottle', cost: 120, reorderLevel: 3, qtyWarehouse: 12, qtyBamban: 4, qtyCapas: 4, desc: 'Concentrated dish soap' },
            { id: genId(), sku: 'CLN-002', name: 'Surface Sanitizer', category: 'Cleaning', supplierId: '', unit: 'bottle', cost: 180, reorderLevel: 3, qtyWarehouse: 10, qtyBamban: 3, qtyCapas: 3, desc: 'Food-safe surface cleaner' },
            { id: genId(), sku: 'CLN-003', name: 'Espresso Machine Cleaner', category: 'Cleaning', supplierId: '', unit: 'box', cost: 350, reorderLevel: 2, qtyWarehouse: 8, qtyBamban: 2, qtyCapas: 2, desc: 'Puly Caff cleaning tablets' },
            { id: genId(), sku: 'CLN-004', name: 'Milk Frother Cleaner', category: 'Cleaning', supplierId: '', unit: 'bottle', cost: 280, reorderLevel: 2, qtyWarehouse: 6, qtyBamban: 2, qtyCapas: 2, desc: 'Urnex Rinza milk cleaner' },
            { id: genId(), sku: 'CLN-005', name: 'Trash Bags (Large)', category: 'Cleaning', supplierId: '', unit: 'box', cost: 150, reorderLevel: 3, qtyWarehouse: 15, qtyBamban: 5, qtyCapas: 5, desc: 'Heavy duty trash bags' },
            { id: genId(), sku: 'EQP-001', name: 'Coffee Filters (V60)', category: 'Equipment', supplierId: '', unit: 'pcs', cost: 3, reorderLevel: 100, qtyWarehouse: 500, qtyBamban: 100, qtyCapas: 100, desc: 'Hario V60 paper filters' },
            { id: genId(), sku: 'EQP-002', name: 'Espresso Portafilter Baskets', category: 'Equipment', supplierId: '', unit: 'pcs', cost: 450, reorderLevel: 2, qtyWarehouse: 10, qtyBamban: 0, qtyCapas: 0, desc: '18g precision baskets' },
        ];
    }

    function getSampleSuppliers() {
        return [
            { id: genId(), name: 'Highlands Coffee Supply Co.', contact: 'Juan Reyes', phone: '0917-555-0101', email: 'orders@highlandscoffee.ph', address: 'Baguio City, Benguet', leadTime: 5, payment: 'Net 15', products: 'Coffee Beans' },
            { id: genId(), name: 'Alaska Milk Corp', contact: 'Maria Santos', phone: '0918-555-0202', email: 'sales@alaskamilk.com', address: 'Makati City, Metro Manila', leadTime: 3, payment: 'Net 30', products: 'Milk, Condensed Milk' },
            { id: genId(), name: 'Oatly Philippines', contact: 'David Chen', phone: '0919-555-0303', email: 'ph@oatly.com', address: 'Taguig City, Metro Manila', leadTime: 7, payment: 'Net 15', products: 'Oat Milk' },
            { id: genId(), name: 'Monin Flavors Asia', contact: 'Lisa Park', phone: '0916-555-0404', email: 'asia@monin.com', address: 'Singapore (PH Distributor)', leadTime: 14, payment: 'Net 30', products: 'Syrups' },
            { id: genId(), name: 'Cacao Culture PH', contact: 'Ramon Cruz', phone: '0915-555-0505', email: 'hello@cacaoculture.ph', address: 'Davao City, Davao del Sur', leadTime: 7, payment: 'Cash on Delivery', products: 'Chocolate Powder' },
            { id: genId(), name: 'Matcha Source Manila', contact: 'Yuki Tanaka', phone: '0917-555-0606', email: 'orders@matchasource.ph', address: 'Makati City, Metro Manila', leadTime: 5, payment: 'Net 15', products: 'Matcha Powder' },
            { id: genId(), name: 'EcoPackaging Solutions', contact: 'Anna Lim', phone: '0918-555-0707', email: 'sales@ecopack.ph', address: 'Quezon City, Metro Manila', leadTime: 3, payment: 'Net 30', products: 'Cups, Lids, Straws' },
            { id: genId(), name: 'Urnex Professional', contact: 'Mark Wilson', phone: '0919-555-0808', email: 'ph@urnex.com', address: 'Pasig City, Metro Manila', leadTime: 10, payment: 'Net 30', products: 'Cleaning Supplies' },
        ];
    }

    function getSampleTransactions() {
        const items = DB.get(DB.keys.inventory) || [];
        const suppliers = DB.get(DB.keys.suppliers) || [];
        const now = new Date();
        const txs = [];
        // Generate some sample transactions
        for (let i = 0; i < 20; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const d = new Date(now);
            d.setDate(d.getDate() - daysAgo);
            const types = ['Receive', 'Transfer', 'Damage', 'Expired', 'Adjustment'];
            const type = types[Math.floor(Math.random() * types.length)];
            const item = items[Math.floor(Math.random() * items.length)];
            const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
            if (!item) continue;
            const qty = type === 'Receive' ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 5) + 1;
            const branches = ['Warehouse', 'Bamban', 'Capas'];
            const from = branches[Math.floor(Math.random() * branches.length)];
            let to = branches[Math.floor(Math.random() * branches.length)];
            while (to === from) to = branches[Math.floor(Math.random() * branches.length)];
            txs.push({
                id: genId(),
                date: d.toISOString().split('T')[0],
                time: `${String(Math.floor(Math.random()*9)+8).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
                type,
                itemId: item.id,
                itemName: item.name,
                sku: item.sku,
                qty,
                from: type === 'Transfer' ? from : (type === 'Receive' ? '' : from),
                to: type === 'Transfer' ? to : (type === 'Receive' ? from : ''),
                supplierId: type === 'Receive' ? supplier.id : '',
                supplierName: type === 'Receive' ? supplier.name : '',
                refNum: genRefNum(type),
                reason: type === 'Damage' ? 'Spilled during handling' : type === 'Expired' ? 'Past expiry date' : type === 'Adjustment' ? 'Inventory count correction' : '',
                user: 'Admin',
                notes: '',
                unitCost: item.cost || 0,
                createdAt: d.toISOString()
            });
        }
        return txs.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
    }

    function getSampleRecipes() {
        return [
            {
                id: genId(),
                name: 'Spanish Latte',
                category: 'Coffee',
                description: 'Rich espresso with condensed milk and creamy steamed milk',
                ingredients: [
                    { itemId: '', itemName: 'Espresso Beans Dark Roast', qty: 18, unit: 'g' },
                    { itemId: '', itemName: 'Fresh Whole Milk', qty: 180, unit: 'ml' },
                    { itemId: '', itemName: 'Condensed Milk', qty: 20, unit: 'ml' },
                ]
            },
            {
                id: genId(),
                name: 'Caramel Macchiato',
                category: 'Coffee',
                description: 'Espresso with vanilla syrup, steamed milk, and caramel drizzle',
                ingredients: [
                    { itemId: '', itemName: 'Espresso Beans Dark Roast', qty: 18, unit: 'g' },
                    { itemId: '', itemName: 'Fresh Whole Milk', qty: 200, unit: 'ml' },
                    { itemId: '', itemName: 'Vanilla Syrup', qty: 15, unit: 'ml' },
                    { itemId: '', itemName: 'Caramel Syrup', qty: 10, unit: 'ml' },
                ]
            },
            {
                id: genId(),
                name: 'Matcha Latte',
                category: 'Non-Coffee',
                description: 'Premium matcha with steamed milk',
                ingredients: [
                    { itemId: '', itemName: 'Matcha Green Tea Powder', qty: 5, unit: 'g' },
                    { itemId: '', itemName: 'Fresh Whole Milk', qty: 200, unit: 'ml' },
                ]
            },
            {
                id: genId(),
                name: 'Hazelnut Latte',
                category: 'Coffee',
                description: 'Smooth espresso with hazelnut syrup and steamed milk',
                ingredients: [
                    { itemId: '', itemName: 'Arabica Coffee Beans', qty: 18, unit: 'g' },
                    { itemId: '', itemName: 'Oat Milk (Barista)', qty: 200, unit: 'ml' },
                    { itemId: '', itemName: 'Hazelnut Syrup', qty: 15, unit: 'ml' },
                ]
            },
            {
                id: genId(),
                name: 'Hot Chocolate',
                category: 'Non-Coffee',
                description: 'Rich chocolate drink with steamed milk',
                ingredients: [
                    { itemId: '', itemName: 'Chocolate Powder', qty: 25, unit: 'g' },
                    { itemId: '', itemName: 'Fresh Whole Milk', qty: 240, unit: 'ml' },
                ]
            },
        ];
    }

    // ==========================================
    // UTILITIES
    // ==========================================
    function genId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    function genRefNum(type) {
        const prefix = { Receive: 'RCV', Transfer: 'TRF', Damage: 'DMG', Expired: 'EXP', Adjustment: 'ADJ', Return: 'RET' };
        return (prefix[type] || 'TXN') + '-' + Date.now().toString(36).toUpperCase().slice(-6);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatCurrency(val) {
        const settings = DB.get(DB.keys.settings) || {};
        const sym = settings.currency || '₱';
        return sym + parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function todayStr() {
        return new Date().toISOString().split('T')[0];
    }

    function nowTimeStr() {
        const d = new Date();
        return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    }

    function getStatus(item) {
        const total = (item.qtyWarehouse || 0) + (item.qtyBamban || 0) + (item.qtyCapas || 0);
        const reorder = item.reorderLevel || 10;
        if (total <= reorder * 0.5) return 'Critical';
        if (total <= reorder) return 'Low';
        return 'Healthy';
    }

    function getItemName(id) {
        const items = DB.get(DB.keys.inventory) || [];
        const item = items.find(i => i.id === id);
        return item ? item.name : 'Unknown';
    }

    function getItemSku(id) {
        const items = DB.get(DB.keys.inventory) || [];
        const item = items.find(i => i.id === id);
        return item ? item.sku : '';
    }

    function getSupplierName(id) {
        const suppliers = DB.get(DB.keys.suppliers) || [];
        const s = suppliers.find(s => s.id === id);
        return s ? s.name : id;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    function init() {
        // Check if already initialized
        if (!DB.get(DB.keys.initialized)) {
            // Create sample data
            const inventory = getSampleInventory();
            const suppliers = getSampleSuppliers();

            // Link some items to suppliers
            const supplierMap = {};
            suppliers.forEach((s, i) => {
                const cats = s.products.split(',').map(p => p.trim());
                cats.forEach(c => { supplierMap[c] = s.id; });
            });
            inventory.forEach(item => {
                if (supplierMap[item.category]) {
                    item.supplierId = supplierMap[item.category];
                }
            });

            DB.set(DB.keys.inventory, inventory);
            DB.set(DB.keys.suppliers, suppliers);
            DB.set(DB.keys.transactions, getSampleTransactions());
            DB.set(DB.keys.recipes, getSampleRecipes());
            DB.set(DB.keys.settings, {
                businessName: 'Akasya Coffee',
                warehouseName: 'Main Warehouse',
                currency: '₱',
                reorderLevel: 10,
                theme: 'light'
            });
            DB.set(DB.keys.initialized, true);
        }

        // Apply theme
        const settings = DB.get(DB.keys.settings) || {};
        if (settings.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        // Setup event listeners
        setupEventListeners();

        // Navigate to dashboard
        navigate('dashboard');

        // Generate reference numbers
        updateRefNumbers();
    }

    // ==========================================
    // NAVIGATION
    // ==========================================
    function navigate(page) {
        currentPage = page;

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

        // Show selected page
        const pageEl = document.getElementById(page + 'Page');
        if (pageEl) pageEl.classList.add('active');

        // Update nav
        const navLink = document.querySelector(`.nav-link[data-page="${page}"]`);
        if (navLink) navLink.classList.add('active');

        // Update title
        const titles = {
            dashboard: 'Dashboard',
            inventory: 'Inventory',
            receive: 'Receive Stock',
            transfer: 'Transfer Stock',
            suppliers: 'Suppliers',
            branches: 'Branches',
            recipes: 'Recipe / BOM',
            reports: 'Reports',
            settings: 'Settings'
        };
        const titleEl = document.getElementById('pageTitle');
        if (titleEl) titleEl.textContent = titles[page] || page;

        // Close sidebar on mobile
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('active');

        // Render page content
        switch(page) {
            case 'dashboard': renderDashboard(); break;
            case 'inventory': renderInventory(); break;
            case 'receive': renderReceive(); break;
            case 'transfer': renderTransfer(); break;
            case 'suppliers': renderSuppliers(); break;
            case 'branches': renderBranches(); break;
            case 'recipes': renderRecipes(); break;
            case 'reports': renderReports(); break;
            case 'settings': renderSettings(); break;
        }

        window.scrollTo(0, 0);
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    function setupEventListeners() {
        // Sidebar toggle
        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.add('open');
            document.getElementById('sidebarOverlay').classList.add('active');
        });
        document.getElementById('sidebarClose').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('sidebarOverlay').classList.remove('active');
        });
        document.getElementById('sidebarOverlay').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('sidebarOverlay').classList.remove('active');
        });

        // Nav links
        document.querySelectorAll('.nav-link[data-page]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                navigate(link.dataset.page);
            });
        });

        // Global search
        document.getElementById('globalSearch').addEventListener('input', e => {
            const val = e.target.value.toLowerCase();
            if (val.length > 2) {
                navigate('inventory');
                inventoryFilter.search = val;
                document.getElementById('invSearch').value = val;
                renderInventory();
            }
        });

        // Inventory filters
        document.getElementById('invSearch').addEventListener('input', e => {
            inventoryFilter.search = e.target.value.toLowerCase();
            inventoryPageNum = 1;
            renderInventory();
        });
        document.getElementById('invCategoryFilter').addEventListener('change', e => {
            inventoryFilter.category = e.target.value;
            inventoryPageNum = 1;
            renderInventory();
        });
        document.getElementById('invSupplierFilter').addEventListener('change', e => {
            inventoryFilter.supplier = e.target.value;
            inventoryPageNum = 1;
            renderInventory();
        });
        document.getElementById('invStatusFilter').addEventListener('change', e => {
            inventoryFilter.status = e.target.value;
            inventoryPageNum = 1;
            renderInventory();
        });

        // Inventory sort
        document.querySelectorAll('#inventoryTable thead th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.dataset.sort;
                if (inventorySort.field === field) {
                    inventorySort.dir = inventorySort.dir === 'asc' ? 'desc' : 'asc';
                } else {
                    inventorySort.field = field;
                    inventorySort.dir = 'asc';
                }
                document.querySelectorAll('#inventoryTable thead th.sortable').forEach(t => {
                    t.classList.remove('asc', 'desc');
                });
                th.classList.add(inventorySort.dir);
                renderInventory();
            });
        });

        // Receive form
        document.getElementById('receiveForm').addEventListener('submit', e => {
            e.preventDefault();
            submitReceive();
        });

        // Transfer form
        document.getElementById('transferForm').addEventListener('submit', e => {
            e.preventDefault();
            submitTransfer();
        });

        // Adjustment form
        document.getElementById('adjustForm').addEventListener('submit', e => {
            e.preventDefault();
            submitAdjustment();
        });

        document.getElementById('adjustItem').addEventListener('change', e => {
            updateAdjustCurrentQty();
        });
        document.getElementById('adjustLocation').addEventListener('change', e => {
            updateAdjustCurrentQty();
        });

        // Transfer tabs
        document.querySelectorAll('.transfer-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.transfer-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.transfer-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('transfer' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1) + 'Panel').classList.add('active');
                if (tab.dataset.tab === 'history') renderTransferHistory();
            });
        });

        // Report tabs
        document.querySelectorAll('.report-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.report-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('report' + tab.dataset.report.charAt(0).toUpperCase() + tab.dataset.report.slice(1)).classList.add('active');
                renderReportPanel(tab.dataset.report);
            });
        });

        // Report transaction filters
        document.getElementById('reportTransType').addEventListener('change', () => renderReportTransactions());
        document.getElementById('reportTransFrom').addEventListener('change', () => renderReportTransactions());
        document.getElementById('reportTransTo').addEventListener('change', () => renderReportTransactions());

        // Transfer history filters
        document.getElementById('transferFromFilter').addEventListener('change', () => renderTransferHistory());
        document.getElementById('transferToFilter').addEventListener('change', () => renderTransferHistory());
        document.getElementById('transferDateFilter').addEventListener('change', () => renderTransferHistory());

        // Settings form
        document.getElementById('settingsForm').addEventListener('submit', e => {
            e.preventDefault();
            saveSettings();
        });

        // Theme options
        document.querySelectorAll('input[name="theme"]').forEach(r => {
            r.addEventListener('change', e => {
                const theme = e.target.value;
                document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                e.target.closest('.theme-option').classList.add('active');
                if (theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.removeAttribute('data-theme');
                }
                const settings = DB.get(DB.keys.settings) || {};
                settings.theme = theme;
                DB.set(DB.keys.settings, settings);
            });
        });

        // Supplier search
        document.getElementById('supplierSearch').addEventListener('input', e => {
            renderSuppliers(e.target.value.toLowerCase());
        });

        // Recipe search
        document.getElementById('recipeSearch').addEventListener('input', e => {
            renderRecipes(e.target.value.toLowerCase());
        });
    }

    // ==========================================
    // DASHBOARD
    // ==========================================
    function renderDashboard() {
        const items = DB.get(DB.keys.inventory) || [];
        const transactions = DB.get(DB.keys.transactions) || [];

        // Stats calculations
        let inventoryValue = 0;
        let lowStock = 0;
        let criticalStock = 0;
        items.forEach(item => {
            const total = (item.qtyWarehouse || 0) + (item.qtyBamban || 0) + (item.qtyCapas || 0);
            inventoryValue += total * (item.cost || 0);
            const status = getStatus(item);
            if (status === 'Low') lowStock++;
            if (status === 'Critical') criticalStock++;
        });

        const today = todayStr();
        const todayTxs = transactions.filter(t => t.date === today);

        // Update stat cards
        document.getElementById('dashInventoryValue').textContent = formatCurrency(inventoryValue);
        document.getElementById('dashTotalProducts').textContent = items.length;
        document.getElementById('dashLowStock').textContent = lowStock;
        document.getElementById('dashCriticalStock').textContent = criticalStock;
        document.getElementById('dashTodayTransactions').textContent = todayTxs.length;
        document.getElementById('dashPendingTransfers').textContent = transactions.filter(t => t.type === 'Transfer' && t.date === today).length;

        // Notification badge
        const totalAlerts = lowStock + criticalStock;
        const badge = document.getElementById('notifBadge');
        badge.textContent = totalAlerts;
        badge.style.display = totalAlerts > 0 ? 'flex' : 'none';

        // Low stock table
        const lowStockItems = items.filter(i => {
            const s = getStatus(i);
            return s === 'Low' || s === 'Critical';
        }).slice(0, 8);

        const tbody = document.getElementById('dashLowStockTable');
        if (lowStockItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>No low stock items</p></td></tr>';
        } else {
            tbody.innerHTML = lowStockItems.map(item => {
                const status = getStatus(item);
                const statusClass = status === 'Critical' ? 'badge-critical' : 'badge-low';
                return `<tr>
                    <td><span class="item-name-text">${escapeHtml(item.name)}</span></td>
                    <td><span class="item-sku">${escapeHtml(item.sku)}</span></td>
                    <td class="text-right">${item.qtyWarehouse || 0}</td>
                    <td class="text-right">${item.qtyBamban || 0}</td>
                    <td class="text-right">${item.qtyCapas || 0}</td>
                    <td><span class="badge-status ${statusClass}">${status}</span></td>
                </tr>`;
            }).join('');
        }

        // Recent activity
        const recentTxs = transactions.slice(0, 12);
        const activityList = document.getElementById('dashActivityList');
        if (recentTxs.length === 0) {
            activityList.innerHTML = '<div class="empty-state"><p>No recent activity</p></div>';
        } else {
            activityList.innerHTML = recentTxs.map(tx => {
                let iconBg, iconColor, actionText;
                switch(tx.type) {
                    case 'Receive':
                        iconBg = 'rgba(76,175,80,0.1)'; iconColor = 'var(--success)';
                        actionText = `Received <strong>${tx.qty} ${tx.unit || 'pcs'}</strong> of <strong>${escapeHtml(tx.itemName)}</strong>`;
                        break;
                    case 'Transfer':
                        iconBg = 'rgba(33,150,243,0.1)'; iconColor = 'var(--info)';
                        actionText = `Transferred <strong>${tx.qty} ${tx.unit || 'pcs'}</strong> of <strong>${escapeHtml(tx.itemName)}</strong> from ${tx.from} to ${tx.to}`;
                        break;
                    case 'Damage':
                        iconBg = 'rgba(217,83,79,0.1)'; iconColor = 'var(--danger)';
                        actionText = `Recorded <strong>${tx.qty} ${tx.unit || 'pcs'}</strong> damaged <strong>${escapeHtml(tx.itemName)}</strong>`;
                        break;
                    case 'Expired':
                        iconBg = 'rgba(244,168,37,0.1)'; iconColor = 'var(--warning)';
                        actionText = `Recorded <strong>${tx.qty} ${tx.unit || 'pcs'}</strong> expired <strong>${escapeHtml(tx.itemName)}</strong>`;
                        break;
                    case 'Adjustment':
                        iconBg = 'rgba(196,106,43,0.1)'; iconColor = 'var(--primary)';
                        actionText = `Adjusted <strong>${escapeHtml(tx.itemName)}</strong> by ${tx.qty}`;
                        break;
                    default:
                        iconBg = 'rgba(104,119,91,0.1)'; iconColor = 'var(--secondary)';
                        actionText = `${tx.type} <strong>${tx.qty} ${tx.unit || 'pcs'}</strong> of <strong>${escapeHtml(tx.itemName)}</strong>`;
                }
                const icons = {
                    Receive: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
                    Transfer: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>',
                    Damage: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
                    Expired: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
                    Adjustment: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>'
                };
                return `<div class="activity-item">
                    <div class="activity-icon" style="background: ${iconBg}; color: ${iconColor};">${icons[tx.type] || icons.Adjustment}</div>
                    <div class="activity-content">
                        <div class="activity-text">${actionText}</div>
                        <div class="activity-meta">
                            <span>${formatDate(tx.date)}</span>
                            <span>&bull;</span>
                            <span>${tx.time || ''}</span>
                            <span>&bull;</span>
                            <span>${tx.user || 'Admin'}</span>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }

        // Branch summary
        let wTotal = 0, bTotal = 0, cTotal = 0;
        let wVal = 0, bVal = 0, cVal = 0;
        items.forEach(item => {
            wTotal += item.qtyWarehouse || 0;
            bTotal += item.qtyBamban || 0;
            cTotal += item.qtyCapas || 0;
            wVal += (item.qtyWarehouse || 0) * (item.cost || 0);
            bVal += (item.qtyBamban || 0) * (item.cost || 0);
            cVal += (item.qtyCapas || 0) * (item.cost || 0);
        });

        document.getElementById('dashBranchSummary').innerHTML = `
            <div class="branch-sum-item">
                <span class="branch-sum-name">Warehouse</span>
                <div class="branch-sum-stats">
                    <span><strong>${wTotal}</strong> items</span>
                    <span><strong>${formatCurrency(wVal)}</strong></span>
                </div>
            </div>
            <div class="branch-sum-item">
                <span class="branch-sum-name">Bamban Branch</span>
                <div class="branch-sum-stats">
                    <span><strong>${bTotal}</strong> items</span>
                    <span><strong>${formatCurrency(bVal)}</strong></span>
                </div>
            </div>
            <div class="branch-sum-item">
                <span class="branch-sum-name">Capas Branch</span>
                <div class="branch-sum-stats">
                    <span><strong>${cTotal}</strong> items</span>
                    <span><strong>${formatCurrency(cVal)}</strong></span>
                </div>
            </div>
        `;
    }

    // ==========================================
    // INVENTORY
    // ==========================================
    function renderInventory() {
        let items = DB.get(DB.keys.inventory) || [];
        const suppliers = DB.get(DB.keys.suppliers) || [];

        // Populate filter dropdowns
        populateCategoryFilter(items);
        populateSupplierFilter(suppliers);

        // Apply filters
        if (inventoryFilter.search) {
            items = items.filter(i =>
                (i.name || '').toLowerCase().includes(inventoryFilter.search) ||
                (i.sku || '').toLowerCase().includes(inventoryFilter.search) ||
                (i.category || '').toLowerCase().includes(inventoryFilter.search)
            );
        }
        if (inventoryFilter.category) {
            items = items.filter(i => i.category === inventoryFilter.category);
        }
        if (inventoryFilter.supplier) {
            items = items.filter(i => i.supplierId === inventoryFilter.supplier);
        }
        if (inventoryFilter.status) {
            items = items.filter(i => getStatus(i) === inventoryFilter.status);
        }

        // Apply sort
        items.sort((a, b) => {
            let av = a[inventorySort.field] || '';
            let bv = b[inventorySort.field] || '';
            if (typeof av === 'string') av = av.toLowerCase();
            if (typeof bv === 'string') bv = bv.toLowerCase();
            if (av < bv) return inventorySort.dir === 'asc' ? -1 : 1;
            if (av > bv) return inventorySort.dir === 'asc' ? 1 : -1;
            return 0;
        });

        // Pagination
        const totalPages = Math.max(1, Math.ceil(items.length / inventoryPerPage));
        if (inventoryPageNum > totalPages) inventoryPageNum = totalPages;
        const start = (inventoryPageNum - 1) * inventoryPerPage;
        const pageItems = items.slice(start, start + inventoryPerPage);

        // Render table
        const tbody = document.getElementById('inventoryTableBody');
        if (pageItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="empty-state"><p>No items found</p></td></tr>';
        } else {
            tbody.innerHTML = pageItems.map(item => {
                const status = getStatus(item);
                const statusClass = status === 'Healthy' ? 'badge-healthy' : status === 'Low' ? 'badge-low' : 'badge-critical';
                const supplier = suppliers.find(s => s.id === item.supplierId);
                return `<tr>
                    <td><span class="item-sku">${escapeHtml(item.sku)}</span></td>
                    <td><span class="item-name-text">${escapeHtml(item.name)}</span></td>
                    <td>${escapeHtml(item.category)}</td>
                    <td>${escapeHtml(supplier ? supplier.name : '-')}</td>
                    <td class="text-right">${item.qtyWarehouse || 0}</td>
                    <td class="text-right">${item.qtyBamban || 0}</td>
                    <td class="text-right">${item.qtyCapas || 0}</td>
                    <td>${escapeHtml(item.unit)}</td>
                    <td class="text-right">${item.reorderLevel || 0}</td>
                    <td><span class="badge-status ${statusClass}">${status}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon" onclick="app.editItem('${item.id}')" title="Edit">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="btn-icon" onclick="app.confirmDeleteItem('${item.id}')" title="Delete">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </td>
                </tr>`;
            }).join('');
        }

        // Pagination
        renderPagination('inventoryPagination', items.length, inventoryPerPage, inventoryPageNum, (page) => {
            inventoryPageNum = page;
            renderInventory();
        });
    }

    function populateCategoryFilter(items) {
        const select = document.getElementById('invCategoryFilter');
        const currentVal = select.value;
        const categories = [...new Set(items.map(i => i.category).filter(Boolean))].sort();
        select.innerHTML = '<option value="">All Categories</option>' +
            categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
        select.value = currentVal;
    }

    function populateSupplierFilter(suppliers) {
        const select = document.getElementById('invSupplierFilter');
        const currentVal = select.value;
        select.innerHTML = '<option value="">All Suppliers</option>' +
            suppliers.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
        select.value = currentVal;
    }

    function renderPagination(containerId, total, perPage, current, callback) {
        const totalPages = Math.max(1, Math.ceil(total / perPage));
        const container = document.getElementById(containerId);
        let html = `
            <button class="page-btn" ${current === 1 ? 'disabled' : ''} onclick="(${callback.toString()})(${current - 1})">&lt;</button>
            <span class="page-info">Page ${current} of ${totalPages} (${total} items)</span>
            <button class="page-btn" ${current === totalPages ? 'disabled' : ''} onclick="(${callback.toString()})(${current + 1})">&gt;</button>
        `;
        // Use a simpler approach with onclick handlers stored globally
        container.innerHTML = '';
        const prev = document.createElement('button');
        prev.className = 'page-btn';
        prev.innerHTML = '&lt;';
        prev.disabled = current === 1;
        prev.onclick = () => callback(current - 1);
        container.appendChild(prev);

        const info = document.createElement('span');
        info.className = 'page-info';
        info.textContent = `Page ${current} of ${totalPages} (${total} items)`;
        container.appendChild(info);

        const next = document.createElement('button');
        next.className = 'page-btn';
        next.innerHTML = '&gt;';
        next.disabled = current === totalPages;
        next.onclick = () => callback(current + 1);
        container.appendChild(next);
    }

    // ==========================================
    // ITEM CRUD
    // ==========================================
    function addItem() {
        document.getElementById('itemId').value = '';
        document.getElementById('itemModalTitle').textContent = 'Add Item';
        document.getElementById('itemForm').reset();
        populateItemSupplierDropdown();
        openModal('itemModal');
    }

    function editItem(id) {
        const items = DB.get(DB.keys.inventory) || [];
        const item = items.find(i => i.id === id);
        if (!item) return;
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemModalTitle').textContent = 'Edit Item';
        document.getElementById('itemSku').value = item.sku || '';
        document.getElementById('itemName').value = item.name || '';
        document.getElementById('itemCategory').value = item.category || '';
        populateItemSupplierDropdown();
        document.getElementById('itemSupplier').value = item.supplierId || '';
        document.getElementById('itemUnit').value = item.unit || '';
        document.getElementById('itemCost').value = item.cost || '';
        document.getElementById('itemReorder').value = item.reorderLevel || 10;
        document.getElementById('itemDesc').value = item.desc || '';
        openModal('itemModal');
    }

    function populateItemSupplierDropdown() {
        const suppliers = DB.get(DB.keys.suppliers) || [];
        const select = document.getElementById('itemSupplier');
        select.innerHTML = '<option value="">No Supplier</option>' +
            suppliers.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
    }

    function saveItem() {
        const id = document.getElementById('itemId').value;
        const sku = document.getElementById('itemSku').value.trim();
        const name = document.getElementById('itemName').value.trim();
        const category = document.getElementById('itemCategory').value;
        const supplierId = document.getElementById('itemSupplier').value;
        const unit = document.getElementById('itemUnit').value;
        const cost = parseFloat(document.getElementById('itemCost').value) || 0;
        const reorderLevel = parseInt(document.getElementById('itemReorder').value) || 10;
        const desc = document.getElementById('itemDesc').value.trim();

        if (!sku || !name || !category || !unit) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        let items = DB.get(DB.keys.inventory) || [];
        const existingIdx = items.findIndex(i => i.id === id);

        if (existingIdx >= 0) {
            // Update existing
            items[existingIdx] = { ...items[existingIdx], sku, name, category, supplierId, unit, cost, reorderLevel, desc };
            showToast('Item updated successfully', 'success');
        } else {
            // Create new
            items.push({
                id: genId(), sku, name, category, supplierId, unit, cost, reorderLevel, desc,
                qtyWarehouse: 0, qtyBamban: 0, qtyCapas: 0
            });
            showToast('Item added successfully', 'success');
        }

        DB.set(DB.keys.inventory, items);
        closeModal('itemModal');
        renderInventory();
        renderDashboard();
    }

    function confirmDeleteItem(id) {
        confirmCallback = () => {
            let items = DB.get(DB.keys.inventory) || [];
            items = items.filter(i => i.id !== id);
            DB.set(DB.keys.inventory, items);
            showToast('Item deleted', 'success');
            renderInventory();
            renderDashboard();
            closeModal('confirmModal');
        };
        document.getElementById('confirmTitle').textContent = 'Delete Item';
        document.getElementById('confirmMessage').textContent = 'Are you sure you want to delete this item? This action cannot be undone.';
        document.getElementById('confirmBtn').onclick = confirmCallback;
        openModal('confirmModal');
    }

    // ==========================================
    // RECEIVE STOCK
    // ==========================================
    function renderReceive() {
        updateRefNumbers();
        document.getElementById('receiveDate').value = todayStr();

        // Populate supplier dropdown
        const suppliers = DB.get(DB.keys.suppliers) || [];
        const select = document.getElementById('receiveSupplier');
        select.innerHTML = '<option value="">Select Supplier</option>' +
            suppliers.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');

        // Populate item dropdowns
        populateReceiveItemDropdowns();

        // Render recent deliveries
        renderRecentDeliveries();
    }

    function populateReceiveItemDropdowns() {
        const items = DB.get(DB.keys.inventory) || [];
        const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
        document.querySelectorAll('.receive-item-select').forEach(select => {
            const currentVal = select.value;
            select.innerHTML = '<option value="">Select Item</option>' +
                sorted.map(i => `<option value="${i.id}" data-unit="${escapeHtml(i.unit)}">${escapeHtml(i.name)} (${escapeHtml(i.sku)})</option>`).join('');
            select.value = currentVal;
        });
    }

    function addReceiveItem() {
        const container = document.getElementById('receiveItems');
        const rows = container.querySelectorAll('.receive-item-row');
        const newRow = document.createElement('div');
        newRow.className = 'receive-item-row';
        newRow.dataset.index = rows.length;
        newRow.innerHTML = `
            <div class="form-group item-select-group">
                <label class="form-label">Item</label>
                <select class="form-select receive-item-select" required>
                    <option value="">Select Item</option>
                </select>
            </div>
            <div class="form-group qty-group">
                <label class="form-label">Quantity</label>
                <input type="number" class="form-input receive-qty" min="1" placeholder="0" required>
            </div>
            <div class="form-group price-group">
                <label class="form-label">Unit Cost (₱)</label>
                <input type="number" class="form-input receive-price" min="0" step="0.01" placeholder="0.00">
            </div>
            <div class="form-group branch-group">
                <label class="form-label">Destination</label>
                <select class="form-select receive-branch" required>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Bamban">Bamban Branch</option>
                    <option value="Capas">Capas Branch</option>
                </select>
            </div>
            <button type="button" class="btn-icon remove-item" onclick="app.removeReceiveItem(this)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;
        container.appendChild(newRow);
        populateReceiveItemDropdowns();

        // Show all remove buttons if more than 1 row
        if (container.querySelectorAll('.receive-item-row').length > 1) {
            container.querySelectorAll('.remove-item').forEach(btn => btn.style.display = '');
        }
    }

    function removeReceiveItem(btn) {
        const container = document.getElementById('receiveItems');
        const rows = container.querySelectorAll('.receive-item-row');
        if (rows.length <= 1) return;
        btn.closest('.receive-item-row').remove();
        if (container.querySelectorAll('.receive-item-row').length <= 1) {
            container.querySelectorAll('.remove-item').forEach(b => b.style.display = 'none');
        }
    }

    function submitReceive() {
        const refNum = document.getElementById('receiveRef').value;
        const date = document.getElementById('receiveDate').value;
        const supplierId = document.getElementById('receiveSupplier').value;
        const notes = document.getElementById('receiveNotes').value;

        if (!date || !supplierId) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const rows = document.querySelectorAll('#receiveItems .receive-item-row');
        const received = [];
        let hasError = false;

        rows.forEach(row => {
            const itemId = row.querySelector('.receive-item-select').value;
            const qty = parseInt(row.querySelector('.receive-qty').value);
            const cost = parseFloat(row.querySelector('.receive-price').value) || 0;
            const branch = row.querySelector('.receive-branch').value;

            if (!itemId || !qty || qty < 1) {
                hasError = true;
                return;
            }
            received.push({ itemId, qty, cost, branch });
        });

        if (hasError || received.length === 0) {
            showToast('Please fill in all item details', 'error');
            return;
        }

        const supplierName = getSupplierName(supplierId);
        const items = DB.get(DB.keys.inventory) || [];
        let transactions = DB.get(DB.keys.transactions) || [];

        received.forEach(r => {
            const item = items.find(i => i.id === r.itemId);
            if (!item) return;

            // Update quantity at destination
            if (r.branch === 'Warehouse') item.qtyWarehouse = (item.qtyWarehouse || 0) + r.qty;
            else if (r.branch === 'Bamban') item.qtyBamban = (item.qtyBamban || 0) + r.qty;
            else if (r.branch === 'Capas') item.qtyCapas = (item.qtyCapas || 0) + r.qty;

            // Update cost if provided
            if (r.cost > 0) item.cost = r.cost;

            // Create transaction
            transactions.unshift({
                id: genId(),
                date,
                time: nowTimeStr(),
                type: 'Receive',
                itemId: r.itemId,
                itemName: item.name,
                sku: item.sku,
                qty: r.qty,
                unit: item.unit,
                from: '',
                to: r.branch,
                supplierId,
                supplierName,
                refNum,
                reason: '',
                user: 'Admin',
                notes,
                unitCost: r.cost || item.cost || 0,
                createdAt: new Date().toISOString()
            });
        });

        DB.set(DB.keys.inventory, items);
        DB.set(DB.keys.transactions, transactions);

        // Reset form
        document.getElementById('receiveForm').reset();
        document.getElementById('receiveDate').value = todayStr();
        updateRefNumbers();
        // Reset to one row
        document.getElementById('receiveItems').innerHTML = document.getElementById('receiveItems').querySelector('.receive-item-row').outerHTML;
        populateReceiveItemDropdowns();

        showToast(`Received ${received.length} item(s) successfully`, 'success');
        renderRecentDeliveries();
        renderDashboard();
    }

    function renderRecentDeliveries() {
        const transactions = DB.get(DB.keys.transactions) || [];
        const receives = transactions.filter(t => t.type === 'Receive').slice(0, 10);
        const tbody = document.getElementById('recentDeliveriesTable');
        if (receives.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><p>No recent deliveries</p></td></tr>';
        } else {
            tbody.innerHTML = receives.map(tx => `<tr>
                <td><span class="item-sku">${escapeHtml(tx.refNum)}</span></td>
                <td>${formatDate(tx.date)}</td>
                <td>${escapeHtml(tx.supplierName || '-')}</td>
                <td>${escapeHtml(tx.itemName)}</td>
                <td class="text-right">${tx.qty}</td>
                <td>${escapeHtml(tx.to || '-')}</td>
                <td>${escapeHtml(tx.user || 'Admin')}</td>
            </tr>`).join('');
        }
    }

    // ==========================================
    // TRANSFER STOCK
    // ==========================================
    function renderTransfer() {
        updateRefNumbers();
        document.getElementById('transferDate').value = todayStr();
        document.getElementById('adjustDate').value = todayStr();

        // Populate item dropdowns for transfer
        const items = DB.get(DB.keys.inventory) || [];
        const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));

        document.querySelectorAll('.transfer-item-select').forEach(select => {
            select.innerHTML = '<option value="">Select Item</option>' +
                sorted.map(i => `<option value="${i.id}">${escapeHtml(i.name)} (${escapeHtml(i.sku)})</option>`).join('');
        });

        // Populate adjustment item dropdown
        const adjSelect = document.getElementById('adjustItem');
        adjSelect.innerHTML = '<option value="">Select Item</option>' +
            sorted.map(i => `<option value="${i.id}" data-wh="${i.qtyWarehouse || 0}" data-ba="${i.qtyBamban || 0}" data-ca="${i.qtyCapas || 0}">${escapeHtml(i.name)} (${escapeHtml(i.sku)})</option>`).join('');

        renderTransferHistory();
    }

    function addTransferItem() {
        const container = document.getElementById('transferItems');
        const items = DB.get(DB.keys.inventory) || [];
        const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));

        const newRow = document.createElement('div');
        newRow.className = 'receive-item-row';
        newRow.style.cssText = 'grid-template-columns: 2fr 1fr auto; gap: 12px;';
        newRow.innerHTML = `
            <div class="form-group item-select-group">
                <label class="form-label">Item</label>
                <select class="form-select transfer-item-select" required>
                    <option value="">Select Item</option>
                    ${sorted.map(i => `<option value="${i.id}">${escapeHtml(i.name)} (${escapeHtml(i.sku)})</option>`).join('')}
                </select>
            </div>
            <div class="form-group qty-group">
                <label class="form-label">Quantity</label>
                <input type="number" class="form-input transfer-qty" min="1" placeholder="0" required>
            </div>
            <button type="button" class="btn-icon remove-item" onclick="app.removeTransferItem(this)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;
        container.appendChild(newRow);

        if (container.querySelectorAll('.receive-item-row').length > 1) {
            container.querySelectorAll('.remove-item').forEach(btn => btn.style.display = '');
        }
    }

    function removeTransferItem(btn) {
        const container = document.getElementById('transferItems');
        const rows = container.querySelectorAll('.receive-item-row');
        if (rows.length <= 1) return;
        btn.closest('.receive-item-row').remove();
        if (container.querySelectorAll('.receive-item-row').length <= 1) {
            container.querySelectorAll('.remove-item').forEach(b => b.style.display = 'none');
        }
    }

    function submitTransfer() {
        const refNum = document.getElementById('transferRef').value;
        const date = document.getElementById('transferDate').value;
        const from = document.getElementById('transferFrom').value;
        const to = document.getElementById('transferTo').value;
        const notes = document.getElementById('transferNotes').value;

        if (!date || !from || !to) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        if (from === to) {
            showToast('Source and destination cannot be the same', 'error');
            return;
        }

        const rows = document.querySelectorAll('#transferItems .receive-item-row');
        const transfers = [];
        let hasError = false;

        rows.forEach(row => {
            const itemId = row.querySelector('.transfer-item-select').value;
            const qty = parseInt(row.querySelector('.transfer-qty').value);
            if (!itemId || !qty || qty < 1) {
                hasError = true;
                return;
            }
            transfers.push({ itemId, qty });
        });

        if (hasError || transfers.length === 0) {
            showToast('Please fill in all item details', 'error');
            return;
        }

        const items = DB.get(DB.keys.inventory) || [];
        let transactions = DB.get(DB.keys.transactions) || [];

        // Validate quantities
        for (const t of transfers) {
            const item = items.find(i => i.id === t.itemId);
            if (!item) continue;
            let fromQty = 0;
            if (from === 'Warehouse') fromQty = item.qtyWarehouse || 0;
            else if (from === 'Bamban') fromQty = item.qtyBamban || 0;
            else if (from === 'Capas') fromQty = item.qtyCapas || 0;
            if (t.qty > fromQty) {
                showToast(`Insufficient stock for ${item.name} at ${from}`, 'error');
                return;
            }
        }

        transfers.forEach(t => {
            const item = items.find(i => i.id === t.itemId);
            if (!item) return;

            // Deduct from source
            if (from === 'Warehouse') item.qtyWarehouse = (item.qtyWarehouse || 0) - t.qty;
            else if (from === 'Bamban') item.qtyBamban = (item.qtyBamban || 0) - t.qty;
            else if (from === 'Capas') item.qtyCapas = (item.qtyCapas || 0) - t.qty;

            // Add to destination
            if (to === 'Warehouse') item.qtyWarehouse = (item.qtyWarehouse || 0) + t.qty;
            else if (to === 'Bamban') item.qtyBamban = (item.qtyBamban || 0) + t.qty;
            else if (to === 'Capas') item.qtyCapas = (item.qtyCapas || 0) + t.qty;

            transactions.unshift({
                id: genId(),
                date,
                time: nowTimeStr(),
                type: 'Transfer',
                itemId: t.itemId,
                itemName: item.name,
                sku: item.sku,
                qty: t.qty,
                unit: item.unit,
                from,
                to,
                supplierId: '',
                supplierName: '',
                refNum,
                reason: '',
                user: 'Admin',
                notes,
                unitCost: item.cost || 0,
                createdAt: new Date().toISOString()
            });
        });

        DB.set(DB.keys.inventory, items);
        DB.set(DB.keys.transactions, transactions);

        document.getElementById('transferForm').reset();
        document.getElementById('transferDate').value = todayStr();
        updateRefNumbers();
        document.getElementById('transferItems').innerHTML = document.getElementById('transferItems').querySelector('.receive-item-row').outerHTML;
        const items2 = DB.get(DB.keys.inventory) || [];
        const sorted = [...items2].sort((a, b) => a.name.localeCompare(b.name));
        document.querySelector('.transfer-item-select').innerHTML = '<option value="">Select Item</option>' +
            sorted.map(i => `<option value="${i.id}">${escapeHtml(i.name)} (${escapeHtml(i.sku)})</option>`).join('');

        showToast(`Transferred ${transfers.length} item(s) from ${from} to ${to}`, 'success');
        renderTransferHistory();
        renderDashboard();
    }

    function renderTransferHistory() {
        let transactions = DB.get(DB.keys.transactions) || [];
        transactions = transactions.filter(t => t.type === 'Transfer');

        const fromFilter = document.getElementById('transferFromFilter').value;
        const toFilter = document.getElementById('transferToFilter').value;
        const dateFilter = document.getElementById('transferDateFilter').value;

        if (fromFilter) transactions = transactions.filter(t => t.from === fromFilter);
        if (toFilter) transactions = transactions.filter(t => t.to === toFilter);
        if (dateFilter) transactions = transactions.filter(t => t.date === dateFilter);

        const tbody = document.getElementById('transferHistoryTable');
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><p>No transfer records</p></td></tr>';
        } else {
            tbody.innerHTML = transactions.slice(0, 50).map(tx => `<tr>
                <td><span class="item-sku">${escapeHtml(tx.refNum)}</span></td>
                <td>${formatDate(tx.date)}</td>
                <td>${escapeHtml(tx.from)}</td>
                <td>${escapeHtml(tx.to)}</td>
                <td>${escapeHtml(tx.itemName)}</td>
                <td class="text-right">${tx.qty}</td>
                <td><span class="badge-status badge-completed">Completed</span></td>
                <td>${escapeHtml(tx.user || 'Admin')}</td>
            </tr>`).join('');
        }
    }

    // ==========================================
    // STOCK ADJUSTMENT
    // ==========================================
    function updateAdjustCurrentQty() {
        const itemId = document.getElementById('adjustItem').value;
        const location = document.getElementById('adjustLocation').value;
        const items = DB.get(DB.keys.inventory) || [];
        const item = items.find(i => i.id === itemId);
        const display = document.getElementById('adjustCurrentQty');
        if (!item || !location) {
            display.value = '-';
            return;
        }
        let qty = 0;
        if (location === 'Warehouse') qty = item.qtyWarehouse || 0;
        else if (location === 'Bamban') qty = item.qtyBamban || 0;
        else if (location === 'Capas') qty = item.qtyCapas || 0;
        display.value = `${qty} ${item.unit}`;
    }

    function submitAdjustment() {
        const refNum = document.getElementById('adjustRef').value;
        const date = document.getElementById('adjustDate').value;
        const location = document.getElementById('adjustLocation').value;
        const itemId = document.getElementById('adjustItem').value;
        const type = document.getElementById('adjustType').value;
        const qty = parseInt(document.getElementById('adjustQty').value);
        const notes = document.getElementById('adjustNotes').value;

        if (!date || !location || !itemId || !type || !qty || qty < 1 || !notes) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const items = DB.get(DB.keys.inventory) || [];
        let transactions = DB.get(DB.keys.transactions) || [];
        const item = items.find(i => i.id === itemId);
        if (!item) {
            showToast('Item not found', 'error');
            return;
        }

        // Check current qty
        let currentQty = 0;
        if (location === 'Warehouse') currentQty = item.qtyWarehouse || 0;
        else if (location === 'Bamban') currentQty = item.qtyBamban || 0;
        else if (location === 'Capas') currentQty = item.qtyCapas || 0;

        if (qty > currentQty) {
            showToast('Adjustment quantity exceeds current stock', 'error');
            return;
        }

        // Deduct
        if (location === 'Warehouse') item.qtyWarehouse = currentQty - qty;
        else if (location === 'Bamban') item.qtyBamban = currentQty - qty;
        else if (location === 'Capas') item.qtyCapas = currentQty - qty;

        transactions.unshift({
            id: genId(),
            date,
            time: nowTimeStr(),
            type,
            itemId,
            itemName: item.name,
            sku: item.sku,
            qty,
            unit: item.unit,
            from: location,
            to: '',
            supplierId: '',
            supplierName: '',
            refNum,
            reason: notes,
            user: 'Admin',
            notes,
            unitCost: item.cost || 0,
            createdAt: new Date().toISOString()
        });

        DB.set(DB.keys.inventory, items);
        DB.set(DB.keys.transactions, transactions);

        document.getElementById('adjustForm').reset();
        document.getElementById('adjustDate').value = todayStr();
        document.getElementById('adjustCurrentQty').value = '-';
        updateRefNumbers();

        showToast(`${type} recorded: ${qty} ${item.unit} of ${item.name}`, 'success');
        renderDashboard();
    }

    // ==========================================
    // SUPPLIERS
    // ==========================================
    function renderSuppliers(search = '') {
        let suppliers = DB.get(DB.keys.suppliers) || [];
        if (search) {
            suppliers = suppliers.filter(s =>
                (s.name || '').toLowerCase().includes(search) ||
                (s.contact || '').toLowerCase().includes(search) ||
                (s.phone || '').toLowerCase().includes(search)
            );
        }
        const tbody = document.getElementById('suppliersTableBody');
        if (suppliers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-state"><p>No suppliers found</p></td></tr>';
        } else {
            tbody.innerHTML = suppliers.map(s => `<tr>
                <td><strong>${escapeHtml(s.name)}</strong></td>
                <td>${escapeHtml(s.contact || '-')}</td>
                <td>${escapeHtml(s.phone || '-')}</td>
                <td>${escapeHtml(s.email || '-')}</td>
                <td>${escapeHtml(s.address || '-')}</td>
                <td>${escapeHtml(s.products || '-')}</td>
                <td>${s.leadTime || '-'} days</td>
                <td>${escapeHtml(s.payment || '-')}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon" onclick="app.editSupplier('${s.id}')" title="Edit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-icon" onclick="app.confirmDeleteSupplier('${s.id}')" title="Delete">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>`).join('');
        }
    }

    function addSupplier() {
        document.getElementById('supplierId').value = '';
        document.getElementById('supplierModalTitle').textContent = 'Add Supplier';
        document.getElementById('supplierForm').reset();
        openModal('supplierModal');
    }

    function editSupplier(id) {
        const suppliers = DB.get(DB.keys.suppliers) || [];
        const s = suppliers.find(s => s.id === id);
        if (!s) return;
        document.getElementById('supplierId').value = s.id;
        document.getElementById('supplierModalTitle').textContent = 'Edit Supplier';
        document.getElementById('supplierName').value = s.name || '';
        document.getElementById('supplierContact').value = s.contact || '';
        document.getElementById('supplierPhone').value = s.phone || '';
        document.getElementById('supplierEmail').value = s.email || '';
        document.getElementById('supplierAddress').value = s.address || '';
        document.getElementById('supplierLeadTime').value = s.leadTime || 7;
        document.getElementById('supplierPayment').value = s.payment || 'Net 30';
        document.getElementById('supplierProducts').value = s.products || '';
        openModal('supplierModal');
    }

    function saveSupplier() {
        const id = document.getElementById('supplierId').value;
        const name = document.getElementById('supplierName').value.trim();
        if (!name) {
            showToast('Supplier name is required', 'error');
            return;
        }
        let suppliers = DB.get(DB.keys.suppliers) || [];
        const idx = suppliers.findIndex(s => s.id === id);
        const data = {
            id: id || genId(),
            name,
            contact: document.getElementById('supplierContact').value.trim(),
            phone: document.getElementById('supplierPhone').value.trim(),
            email: document.getElementById('supplierEmail').value.trim(),
            address: document.getElementById('supplierAddress').value.trim(),
            leadTime: parseInt(document.getElementById('supplierLeadTime').value) || 7,
            payment: document.getElementById('supplierPayment').value,
            products: document.getElementById('supplierProducts').value.trim()
        };
        if (idx >= 0) {
            suppliers[idx] = data;
            showToast('Supplier updated', 'success');
        } else {
            suppliers.push(data);
            showToast('Supplier added', 'success');
        }
        DB.set(DB.keys.suppliers, suppliers);
        closeModal('supplierModal');
        renderSuppliers();
    }

    function confirmDeleteSupplier(id) {
        confirmCallback = () => {
            let suppliers = DB.get(DB.keys.suppliers) || [];
            suppliers = suppliers.filter(s => s.id !== id);
            DB.set(DB.keys.suppliers, suppliers);
            showToast('Supplier deleted', 'success');
            renderSuppliers();
            closeModal('confirmModal');
        };
        document.getElementById('confirmTitle').textContent = 'Delete Supplier';
        document.getElementById('confirmMessage').textContent = 'Delete this supplier?';
        document.getElementById('confirmBtn').onclick = confirmCallback;
        openModal('confirmModal');
    }

    // ==========================================
    // BRANCHES
    // ==========================================
    function renderBranches() {
        const items = DB.get(DB.keys.inventory) || [];
        const transactions = DB.get(DB.keys.transactions) || [];

        const branches = [
            { key: 'Warehouse', name: 'Main Warehouse', color: '#C46A2B', qtyKey: 'qtyWarehouse' },
            { key: 'Bamban', name: 'Bamban Branch', color: '#68775B', qtyKey: 'qtyBamban' },
            { key: 'Capas', name: 'Capas Branch', color: '#5A4636', qtyKey: 'qtyCapas' }
        ];

        document.getElementById('branchesGrid').innerHTML = branches.map(b => {
            let totalItems = 0, totalQty = 0, totalValue = 0, lowStock = 0;
            items.forEach(item => {
                const qty = item[b.qtyKey] || 0;
                if (qty > 0) totalItems++;
                totalQty += qty;
                totalValue += qty * (item.cost || 0);
                if (qty <= (item.reorderLevel || 10)) lowStock++;
            });

            const recentTxs = transactions.filter(t =>
                (t.from === b.key || t.to === b.key)
            ).slice(0, 5);

            return `<div class="branch-card">
                <div class="branch-card-header">
                    <div class="branch-card-icon" style="background: ${b.color}15; color: ${b.color};">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    </div>
                    <div>
                        <div class="branch-card-title">${b.name}</div>
                        <div class="branch-card-subtitle">${totalItems} items in stock</div>
                    </div>
                </div>
                <div class="branch-card-body">
                    <div class="branch-stat-row">
                        <span class="branch-stat-label">Total Quantity</span>
                        <span class="branch-stat-value">${totalQty.toLocaleString()}</span>
                    </div>
                    <div class="branch-stat-row">
                        <span class="branch-stat-label">Inventory Value</span>
                        <span class="branch-stat-value">${formatCurrency(totalValue)}</span>
                    </div>
                    <div class="branch-stat-row">
                        <span class="branch-stat-label">Low Stock Items</span>
                        <span class="branch-stat-value" style="color: ${lowStock > 0 ? 'var(--danger)' : 'var(--success)'}">${lowStock}</span>
                    </div>
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-light);">
                        <div style="font-size: 11px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Recent Transactions</div>
                        ${recentTxs.length === 0 ? '<span style="font-size: 12px; color: var(--text-muted);">No recent activity</span>' :
                            recentTxs.map(tx => `<div style="font-size: 12px; color: var(--text); margin-bottom: 4px; display: flex; justify-content: space-between;">
                                <span>${escapeHtml(tx.itemName)} - ${tx.qty} ${tx.unit || ''}</span>
                                <span style="color: var(--text-muted);">${formatDate(tx.date)}</span>
                            </div>`).join('')}
                    </div>
                </div>
            </div>`;
        }).join('');

        // Branch comparison table
        document.getElementById('branchComparisonTable').innerHTML = items.map(item => {
            const total = (item.qtyWarehouse || 0) + (item.qtyBamban || 0) + (item.qtyCapas || 0);
            return `<tr>
                <td><strong>${escapeHtml(item.name)}</strong><br><span class="item-sku">${escapeHtml(item.sku)}</span></td>
                <td class="text-right">${item.qtyWarehouse || 0}</td>
                <td class="text-right">${item.qtyBamban || 0}</td>
                <td class="text-right">${item.qtyCapas || 0}</td>
                <td class="text-right"><strong>${total}</strong></td>
            </tr>`;
        }).join('');
    }

    // ==========================================
    // RECIPES / BOM
    // ==========================================
    function renderRecipes(search = '') {
        let recipes = DB.get(DB.keys.recipes) || [];
        if (search) {
            recipes = recipes.filter(r =>
                (r.name || '').toLowerCase().includes(search) ||
                (r.category || '').toLowerCase().includes(search)
            );
        }

        const container = document.getElementById('recipesList');
        if (recipes.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No recipes found</p></div>';
            return;
        }

        container.innerHTML = recipes.map(r => {
            const ingredients = r.ingredients || [];
            return `<div class="recipe-card" onclick="app.viewRecipe('${r.id}')">
                <div class="recipe-card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                </div>
                <div class="recipe-card-body">
                    <div class="recipe-card-title">${escapeHtml(r.name)}</div>
                    <div class="recipe-card-meta">${escapeHtml(r.category)} &bull; ${ingredients.length} ingredient(s)</div>
                    <div class="recipe-card-ingredients">
                        ${ingredients.slice(0, 4).map(ing => `<span class="recipe-ingredient-tag">${ing.qty}${ing.unit || ''} ${escapeHtml(ing.itemName)}</span>`).join('')}
                        ${ingredients.length > 4 ? `<span class="recipe-ingredient-tag">+${ingredients.length - 4} more</span>` : ''}
                    </div>
                </div>
                <div class="recipe-card-actions" onclick="event.stopPropagation()">
                    <button class="btn-icon" onclick="app.editRecipe('${r.id}')" title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-icon" onclick="app.confirmDeleteRecipe('${r.id}')" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>`;
        }).join('');
    }

    function addRecipe() {
        document.getElementById('recipeId').value = '';
        document.getElementById('recipeModalTitle').textContent = 'Add Recipe';
        document.getElementById('recipeForm').reset();
        document.getElementById('recipeIngredients').innerHTML = createIngredientRowHTML(0, true);
        populateRecipeIngredientDropdowns();
        openModal('recipeModal');
    }

    function editRecipe(id) {
        const recipes = DB.get(DB.keys.recipes) || [];
        const recipe = recipes.find(r => r.id === id);
        if (!recipe) return;
        document.getElementById('recipeId').value = recipe.id;
        document.getElementById('recipeModalTitle').textContent = 'Edit Recipe';
        document.getElementById('recipeName').value = recipe.name || '';
        document.getElementById('recipeCategory').value = recipe.category || 'Coffee';
        document.getElementById('recipeDesc').value = recipe.description || '';

        const container = document.getElementById('recipeIngredients');
        container.innerHTML = '';
        (recipe.ingredients || []).forEach((ing, idx) => {
            container.insertAdjacentHTML('beforeend', createIngredientRowHTML(idx, idx === 0));
        });
        populateRecipeIngredientDropdowns();

        // Set values
        const rows = container.querySelectorAll('.recipe-ingredient-row');
        (recipe.ingredients || []).forEach((ing, idx) => {
            if (rows[idx]) {
                const itemSelect = rows[idx].querySelector('.recipe-ingredient-item');
                // Find option with matching item name
                const options = itemSelect.querySelectorAll('option');
                for (const opt of options) {
                    if (opt.textContent.includes(ing.itemName)) {
                        itemSelect.value = opt.value;
                        break;
                    }
                }
                rows[idx].querySelector('.recipe-ingredient-qty').value = ing.qty;
                rows[idx].querySelector('.recipe-ingredient-unit').value = ing.unit || '';
            }
        });

        openModal('recipeModal');
        event.stopPropagation();
    }

    function viewRecipe(id) {
        const recipes = DB.get(DB.keys.recipes) || [];
        const recipe = recipes.find(r => r.id === id);
        if (!recipe) return;
        document.getElementById('viewRecipeTitle').textContent = escapeHtml(recipe.name);
        const ingredients = recipe.ingredients || [];
        document.getElementById('viewRecipeBody').innerHTML = `
            <div style="margin-bottom: 12px;">
                <span class="badge-status badge-healthy">${escapeHtml(recipe.category)}</span>
            </div>
            <p style="color: var(--text-light); font-size: 13px; margin-bottom: 20px;">${escapeHtml(recipe.description || 'No description')}</p>
            <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--dark);">Ingredients</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${ingredients.length === 0 ? '<p style="color: var(--text-muted); font-size: 13px;">No ingredients</p>' :
                    ingredients.map(ing => `<div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: var(--bg); border-radius: var(--radius-sm);">
                        <span style="font-weight: 500;">${escapeHtml(ing.itemName)}</span>
                        <span style="color: var(--text-light); font-size: 13px;">${ing.qty} ${escapeHtml(ing.unit || '')}</span>
                    </div>`).join('')}
            </div>
        `;
        openModal('viewRecipeModal');
    }

    function createIngredientRowHTML(index, isFirst) {
        return `<div class="recipe-ingredient-row" data-index="${index}">
            <div class="form-group" style="flex: 2;">
                ${index === 0 ? '<label class="form-label">Item</label>' : ''}
                <select class="form-select recipe-ingredient-item" required>
                    <option value="">Select Item</option>
                </select>
            </div>
            <div class="form-group" style="flex: 1;">
                ${index === 0 ? '<label class="form-label">Qty</label>' : ''}
                <input type="number" class="form-input recipe-ingredient-qty" min="0.01" step="0.01" placeholder="Qty" required>
            </div>
            <div class="form-group" style="flex: 1;">
                ${index === 0 ? '<label class="form-label">Unit</label>' : ''}
                <input type="text" class="form-input recipe-ingredient-unit" placeholder="Unit" readonly>
            </div>
            <button type="button" class="btn-icon remove-ingredient" onclick="app.removeIngredient(this)" style="${isFirst ? 'display:none;' : ''} margin-top: ${index === 0 ? '22px' : '0'};">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>`;
    }

    function addIngredient() {
        const container = document.getElementById('recipeIngredients');
        const rows = container.querySelectorAll('.recipe-ingredient-row');
        container.insertAdjacentHTML('beforeend', createIngredientRowHTML(rows.length, false));
        populateRecipeIngredientDropdowns();
        // Show all remove buttons
        container.querySelectorAll('.remove-ingredient').forEach(btn => btn.style.display = '');
    }

    function removeIngredient(btn) {
        const container = document.getElementById('recipeIngredients');
        const rows = container.querySelectorAll('.recipe-ingredient-row');
        if (rows.length <= 1) return;
        btn.closest('.recipe-ingredient-row').remove();
        if (container.querySelectorAll('.recipe-ingredient-row').length <= 1) {
            container.querySelector('.remove-ingredient').style.display = 'none';
        }
    }

    function populateRecipeIngredientDropdowns() {
        const items = DB.get(DB.keys.inventory) || [];
        const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
        document.querySelectorAll('.recipe-ingredient-item').forEach(select => {
            const currentVal = select.value;
            select.innerHTML = '<option value="">Select Item</option>' +
                sorted.map(i => `<option value="${i.id}" data-unit="${escapeHtml(i.unit)}">${escapeHtml(i.name)} (${escapeHtml(i.sku)})</option>`).join('');
            select.value = currentVal;
            // Update unit on change
            select.onchange = function() {
                const selected = this.options[this.selectedIndex];
                const unitInput = this.closest('.recipe-ingredient-row').querySelector('.recipe-ingredient-unit');
                unitInput.value = selected.dataset.unit || '';
            };
        });
    }

    function saveRecipe() {
        const id = document.getElementById('recipeId').value;
        const name = document.getElementById('recipeName').value.trim();
        const category = document.getElementById('recipeCategory').value;
        const description = document.getElementById('recipeDesc').value.trim();

        if (!name) {
            showToast('Recipe name is required', 'error');
            return;
        }

        const ingredients = [];
        let hasError = false;
        document.querySelectorAll('#recipeIngredients .recipe-ingredient-row').forEach(row => {
            const itemSelect = row.querySelector('.recipe-ingredient-item');
            const itemId = itemSelect.value;
            const qty = parseFloat(row.querySelector('.recipe-ingredient-qty').value);
            const unit = row.querySelector('.recipe-ingredient-unit').value;
            const itemText = itemSelect.options[itemSelect.selectedIndex]?.text || '';
            const itemName = itemText.split('(')[0]?.trim() || '';

            if (!itemId || !qty || qty <= 0) {
                hasError = true;
                return;
            }
            ingredients.push({ itemId, itemName, qty, unit });
        });

        if (hasError || ingredients.length === 0) {
            showToast('Please add at least one valid ingredient', 'error');
            return;
        }

        let recipes = DB.get(DB.keys.recipes) || [];
        const idx = recipes.findIndex(r => r.id === id);
        const data = { id: id || genId(), name, category, description, ingredients };
        if (idx >= 0) {
            recipes[idx] = data;
            showToast('Recipe updated', 'success');
        } else {
            recipes.push(data);
            showToast('Recipe added', 'success');
        }
        DB.set(DB.keys.recipes, recipes);
        closeModal('recipeModal');
        renderRecipes();
        renderDashboard();
    }

    function confirmDeleteRecipe(id) {
        confirmCallback = () => {
            let recipes = DB.get(DB.keys.recipes) || [];
            recipes = recipes.filter(r => r.id !== id);
            DB.set(DB.keys.recipes, recipes);
            showToast('Recipe deleted', 'success');
            renderRecipes();
            closeModal('confirmModal');
        };
        document.getElementById('confirmTitle').textContent = 'Delete Recipe';
        document.getElementById('confirmMessage').textContent = 'Delete this recipe?';
        document.getElementById('confirmBtn').onclick = confirmCallback;
        openModal('confirmModal');
        event.stopPropagation();
    }

    // ==========================================
    // REPORTS
    // ==========================================
    function renderReports() {
        // Default to summary report
        renderReportSummary();
    }

    function renderReportPanel(type) {
        switch(type) {
            case 'summary': renderReportSummary(); break;
            case 'transactions': renderReportTransactions(); break;
            case 'lowstock': renderReportLowStock(); break;
            case 'suppliers': renderReportSuppliers(); break;
            case 'branches': renderReportBranches(); break;
            case 'mostused': renderReportMostUsed(); break;
        }
    }

    function renderReportSummary() {
        const items = DB.get(DB.keys.inventory) || [];
        const transactions = DB.get(DB.keys.transactions) || [];

        let totalValue = 0, totalItems = items.length, totalQty = 0, lowCount = 0;
        const categoryStats = {};

        items.forEach(item => {
            const w = item.qtyWarehouse || 0;
            const b = item.qtyBamban || 0;
            const c = item.qtyCapas || 0;
            const total = w + b + c;
            const val = total * (item.cost || 0);
            totalValue += val;
            totalQty += total;
            if (getStatus(item) !== 'Healthy') lowCount++;

            const cat = item.category || 'Uncategorized';
            if (!categoryStats[cat]) categoryStats[cat] = { items: 0, qty: 0, value: 0, low: 0 };
            categoryStats[cat].items++;
            categoryStats[cat].qty += total;
            categoryStats[cat].value += val;
            if (getStatus(item) !== 'Healthy') categoryStats[cat].low++;
        });

        document.getElementById('reportSummaryStats').innerHTML = `
            <div class="report-stat-item">
                <div class="report-stat-value">${totalItems}</div>
                <div class="report-stat-label">Total Items</div>
            </div>
            <div class="report-stat-item">
                <div class="report-stat-value">${totalQty.toLocaleString()}</div>
                <div class="report-stat-label">Total Quantity</div>
            </div>
            <div class="report-stat-item">
                <div class="report-stat-value">${formatCurrency(totalValue)}</div>
                <div class="report-stat-label">Total Value</div>
            </div>
            <div class="report-stat-item">
                <div class="report-stat-value" style="color: var(--danger);">${lowCount}</div>
                <div class="report-stat-label">Low Stock</div>
            </div>
        `;

        const tbody = document.getElementById('reportSummaryTable');
        const cats = Object.entries(categoryStats).sort((a, b) => b[1].value - a[1].value);
        tbody.innerHTML = cats.map(([cat, stat]) => `<tr>
            <td><strong>${escapeHtml(cat)}</strong></td>
            <td class="text-right">${stat.items}</td>
            <td class="text-right">${stat.qty.toLocaleString()}</td>
            <td class="text-right">${formatCurrency(stat.value)}</td>
            <td class="text-right" style="color: ${stat.low > 0 ? 'var(--danger)' : 'var(--success)'}; font-weight: 600;">${stat.low}</td>
        </tr>`).join('');
    }

    function renderReportTransactions() {
        let transactions = DB.get(DB.keys.transactions) || [];
        const typeFilter = document.getElementById('reportTransType').value;
        const fromDate = document.getElementById('reportTransFrom').value;
        const toDate = document.getElementById('reportTransTo').value;

        if (typeFilter) transactions = transactions.filter(t => t.type === typeFilter);
        if (fromDate) transactions = transactions.filter(t => t.date >= fromDate);
        if (toDate) transactions = transactions.filter(t => t.date <= toDate);

        const tbody = document.getElementById('reportTransactionsTable');
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><p>No transactions found</p></td></tr>';
        } else {
            tbody.innerHTML = transactions.slice(0, 200).map(tx => {
                const typeColors = { Receive: 'badge-healthy', Transfer: 'badge-pending', Damage: 'badge-critical', Expired: 'badge-low', Adjustment: 'badge-low', Return: 'badge-low' };
                return `<tr>
                    <td>${formatDate(tx.date)} ${tx.time || ''}</td>
                    <td><span class="badge-status ${typeColors[tx.type] || ''}">${tx.type}</span></td>
                    <td><span class="item-sku">${escapeHtml(tx.refNum)}</span></td>
                    <td>${escapeHtml(tx.itemName)}</td>
                    <td class="text-right">${tx.qty}</td>
                    <td>${escapeHtml(tx.to || tx.from || '-')}</td>
                    <td>${escapeHtml(tx.user || 'Admin')}</td>
                    <td>${escapeHtml(tx.notes || tx.reason || '-')}</td>
                </tr>`;
            }).join('');
        }
    }

    function renderReportLowStock() {
        const items = DB.get(DB.keys.inventory) || [];
        const lowItems = items.filter(i => getStatus(i) !== 'Healthy').sort((a, b) => {
            const totalA = (a.qtyWarehouse || 0) + (a.qtyBamban || 0) + (a.qtyCapas || 0);
            const totalB = (b.qtyWarehouse || 0) + (b.qtyBamban || 0) + (b.qtyCapas || 0);
            return totalA - totalB;
        });

        const tbody = document.getElementById('reportLowStockTable');
        if (lowItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-state"><p>No low stock items</p></td></tr>';
        } else {
            tbody.innerHTML = lowItems.map(item => {
                const total = (item.qtyWarehouse || 0) + (item.qtyBamban || 0) + (item.qtyCapas || 0);
                const status = getStatus(item);
                const statusClass = status === 'Critical' ? 'badge-critical' : 'badge-low';
                return `<tr>
                    <td><span class="item-sku">${escapeHtml(item.sku)}</span></td>
                    <td><strong>${escapeHtml(item.name)}</strong></td>
                    <td>${escapeHtml(item.category)}</td>
                    <td class="text-right">${item.qtyWarehouse || 0}</td>
                    <td class="text-right">${item.qtyBamban || 0}</td>
                    <td class="text-right">${item.qtyCapas || 0}</td>
                    <td class="text-right"><strong>${total}</strong></td>
                    <td class="text-right">${item.reorderLevel || 0}</td>
                    <td><span class="badge-status ${statusClass}">${status}</span></td>
                </tr>`;
            }).join('');
        }
    }

    function renderReportSuppliers() {
        const suppliers = DB.get(DB.keys.suppliers) || [];
        const transactions = DB.get(DB.keys.transactions) || [];
        const items = DB.get(DB.keys.inventory) || [];

        const supplierData = suppliers.map(s => {
            const suppliedItems = items.filter(i => i.supplierId === s.id);
            const receives = transactions.filter(t => t.type === 'Receive' && t.supplierId === s.id);
            const totalReceived = receives.reduce((sum, t) => sum + (t.qty || 0), 0);
            const totalValue = receives.reduce((sum, t) => sum + (t.qty || 0) * (t.unitCost || 0), 0);
            const lastDelivery = receives.length > 0 ? receives[0].date : null;
            return { ...s, productCount: suppliedItems.length, totalReceived, totalValue, lastDelivery };
        }).sort((a, b) => b.totalValue - a.totalValue);

        const tbody = document.getElementById('reportSupplierTable');
        tbody.innerHTML = supplierData.map(s => `<tr>
            <td><strong>${escapeHtml(s.name)}</strong></td>
            <td class="text-right">${s.productCount}</td>
            <td class="text-right">${s.totalReceived.toLocaleString()}</td>
            <td class="text-right">${formatCurrency(s.totalValue)}</td>
            <td>${s.lastDelivery ? formatDate(s.lastDelivery) : 'No deliveries'}</td>
        </tr>`).join('');
    }

    function renderReportBranches() {
        const items = DB.get(DB.keys.inventory) || [];
        const branches = [
            { key: 'Warehouse', name: 'Main Warehouse', qtyKey: 'qtyWarehouse' },
            { key: 'Bamban', name: 'Bamban Branch', qtyKey: 'qtyBamban' },
            { key: 'Capas', name: 'Capas Branch', qtyKey: 'qtyCapas' }
        ];

        let grandTotalVal = 0;
        const branchData = branches.map(b => {
            let totalItems = 0, totalQty = 0, totalValue = 0, lowStock = 0;
            items.forEach(item => {
                const qty = item[b.qtyKey] || 0;
                if (qty > 0) totalItems++;
                totalQty += qty;
                totalValue += qty * (item.cost || 0);
                if (qty <= (item.reorderLevel || 10)) lowStock++;
            });
            grandTotalVal += totalValue;
            return { ...b, totalItems, totalQty, totalValue, lowStock };
        });

        document.getElementById('reportBranchStats').innerHTML = branchData.map(b => `
            <div class="report-stat-item">
                <div class="report-stat-value">${formatCurrency(b.totalValue)}</div>
                <div class="report-stat-label">${b.name}</div>
            </div>
        `).join('') + `
            <div class="report-stat-item">
                <div class="report-stat-value" style="color: var(--primary);">${formatCurrency(grandTotalVal)}</div>
                <div class="report-stat-label">Grand Total</div>
            </div>
        `;

        document.getElementById('reportBranchTable').innerHTML = branchData.map(b => `<tr>
            <td><strong>${b.name}</strong></td>
            <td class="text-right">${b.totalItems}</td>
            <td class="text-right">${b.totalQty.toLocaleString()}</td>
            <td class="text-right">${formatCurrency(b.totalValue)}</td>
            <td class="text-right" style="color: ${b.lowStock > 0 ? 'var(--danger)' : 'var(--success)'}; font-weight: 600;">${b.lowStock}</td>
        </tr>`).join('');
    }

    function renderReportMostUsed() {
        const items = DB.get(DB.keys.inventory) || [];
        const transactions = DB.get(DB.keys.transactions) || [];
        const suppliers = DB.get(DB.keys.suppliers) || [];

        const itemUsage = {};
        transactions.forEach(tx => {
            if (!itemUsage[tx.itemId]) {
                itemUsage[tx.itemId] = { count: 0, totalQty: 0 };
            }
            itemUsage[tx.itemId].count++;
            itemUsage[tx.itemId].totalQty += tx.qty || 0;
        });

        const mostUsed = Object.entries(itemUsage)
            .map(([itemId, usage]) => {
                const item = items.find(i => i.id === itemId);
                if (!item) return null;
                const supplier = suppliers.find(s => s.id === item.supplierId);
                return { ...item, ...usage, supplierName: supplier ? supplier.name : '-' };
            })
            .filter(Boolean)
            .sort((a, b) => b.totalQty - a.totalQty)
            .slice(0, 20);

        const tbody = document.getElementById('reportMostUsedTable');
        if (mostUsed.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><p>No transaction data yet</p></td></tr>';
        } else {
            tbody.innerHTML = mostUsed.map(item => `<tr>
                <td><strong>${escapeHtml(item.name)}</strong></td>
                <td>${escapeHtml(item.category)}</td>
                <td class="text-right">${item.count}</td>
                <td class="text-right">${item.totalQty.toLocaleString()}</td>
                <td>${escapeHtml(item.supplierName)}</td>
            </tr>`).join('');
        }
    }

    function exportReportCSV() {
        const items = DB.get(DB.keys.inventory) || [];
        const headers = ['SKU', 'Item Name', 'Category', 'Supplier', 'Warehouse Qty', 'Bamban Qty', 'Capas Qty', 'Total Qty', 'Unit', 'Unit Cost', 'Total Value', 'Reorder Level', 'Status'];
        const rows = items.map(item => {
            const total = (item.qtyWarehouse || 0) + (item.qtyBamban || 0) + (item.qtyCapas || 0);
            const status = getStatus(item);
            return [
                item.sku, item.name, item.category, getSupplierName(item.supplierId),
                item.qtyWarehouse || 0, item.qtyBamban || 0, item.qtyCapas || 0,
                total, item.unit, item.cost || 0, total * (item.cost || 0),
                item.reorderLevel || 0, status
            ];
        });
        downloadCSV(headers, rows, 'akasya_inventory_report.csv');
        showToast('Report exported as CSV', 'success');
    }

    function printReport() {
        window.print();
    }

    // ==========================================
    // SETTINGS
    // ==========================================
    function renderSettings() {
        const settings = DB.get(DB.keys.settings) || {};
        document.getElementById('settingBusinessName').value = settings.businessName || 'Akasya Coffee';
        document.getElementById('settingWarehouseName').value = settings.warehouseName || 'Main Warehouse';
        document.getElementById('settingCurrency').value = settings.currency || '₱';
        document.getElementById('settingReorderLevel').value = settings.reorderLevel || 10;

        // Theme
        const theme = settings.theme || 'light';
        document.querySelectorAll('input[name="theme"]').forEach(r => {
            r.checked = r.value === theme;
            r.closest('.theme-option').classList.toggle('active', r.value === theme);
        });

        // System info
        const items = DB.get(DB.keys.inventory) || [];
        const suppliers = DB.get(DB.keys.suppliers) || [];
        const transactions = DB.get(DB.keys.transactions) || [];
        const recipes = DB.get(DB.keys.recipes) || [];
        document.getElementById('sysTotalItems').textContent = items.length;
        document.getElementById('sysTotalSuppliers').textContent = suppliers.length;
        document.getElementById('sysTotalTransactions').textContent = transactions.length;
        document.getElementById('sysTotalRecipes').textContent = recipes.length;
    }

    function saveSettings() {
        const settings = {
            businessName: document.getElementById('settingBusinessName').value.trim() || 'Akasya Coffee',
            warehouseName: document.getElementById('settingWarehouseName').value.trim() || 'Main Warehouse',
            currency: document.getElementById('settingCurrency').value,
            reorderLevel: parseInt(document.getElementById('settingReorderLevel').value) || 10,
            theme: document.querySelector('input[name="theme"]:checked')?.value || 'light'
        };
        DB.set(DB.keys.settings, settings);
        showToast('Settings saved', 'success');
        renderDashboard();
    }

    // ==========================================
    // DATA MANAGEMENT
    // ==========================================
    function backupData() {
        const data = {
            inventory: DB.get(DB.keys.inventory) || [],
            suppliers: DB.get(DB.keys.suppliers) || [],
            transactions: DB.get(DB.keys.transactions) || [],
            recipes: DB.get(DB.keys.recipes) || [],
            settings: DB.get(DB.keys.settings) || {},
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `akasya_backup_${todayStr()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Backup downloaded', 'success');
    }

    function importData(input) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.inventory) DB.set(DB.keys.inventory, data.inventory);
                if (data.suppliers) DB.set(DB.keys.suppliers, data.suppliers);
                if (data.transactions) DB.set(DB.keys.transactions, data.transactions);
                if (data.recipes) DB.set(DB.keys.recipes, data.recipes);
                if (data.settings) DB.set(DB.keys.settings, data.settings);
                showToast('Data imported successfully', 'success');
                renderDashboard();
                if (currentPage === 'inventory') renderInventory();
                if (currentPage === 'suppliers') renderSuppliers();
                if (currentPage === 'settings') renderSettings();
            } catch(err) {
                showToast('Invalid backup file', 'error');
            }
        };
        reader.readAsText(file);
        input.value = '';
    }

    function exportData() {
        backupData();
    }

    function importInventory() {
        document.getElementById('importFileInput').click();
    }

    function resetData() {
        confirmCallback = () => {
            localStorage.removeItem('akasya_' + DB.keys.inventory);
            localStorage.removeItem('akasya_' + DB.keys.suppliers);
            localStorage.removeItem('akasya_' + DB.keys.transactions);
            localStorage.removeItem('akasya_' + DB.keys.recipes);
            localStorage.removeItem('akasya_' + DB.keys.settings);
            localStorage.removeItem('akasya_' + DB.keys.initialized);
            showToast('All data cleared. Reloading...', 'success');
            setTimeout(() => location.reload(), 1500);
        };
        document.getElementById('confirmTitle').textContent = 'Reset All Data';
        document.getElementById('confirmMessage').textContent = 'This will erase ALL data and restore sample data. This cannot be undone!';
        document.getElementById('confirmBtn').onclick = confirmCallback;
        openModal('confirmModal');
    }

    // ==========================================
    // UI HELPERS
    // ==========================================
    function openModal(id) {
        document.getElementById(id).classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(id) {
        document.getElementById(id).classList.remove('active');
        document.body.style.overflow = '';
    }

    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const icons = {
            success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
        };
        const titles = { success: 'Success', error: 'Error', warning: 'Warning' };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <div class="toast-message">${escapeHtml(message)}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function updateRefNumbers() {
        const receiveRef = document.getElementById('receiveRef');
        if (receiveRef) receiveRef.value = genRefNum('Receive');
        const transferRef = document.getElementById('transferRef');
        if (transferRef) transferRef.value = genRefNum('Transfer');
        const adjustRef = document.getElementById('adjustRef');
        if (adjustRef) adjustRef.value = genRefNum('Adjustment');
    }

    function downloadCSV(headers, rows, filename) {
        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Close modals on Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => {
                m.classList.remove('active');
            });
            document.body.style.overflow = '';
        }
    });

    // ==========================================
    // INIT
    // ==========================================
    document.addEventListener('DOMContentLoaded', init);

    // ==========================================
    // PUBLIC API
    // ==========================================
    return {
        navigate,
        addItem,
        editItem,
        saveItem,
        confirmDeleteItem,
        addSupplier,
        editSupplier,
        saveSupplier,
        confirmDeleteSupplier,
        addRecipe,
        editRecipe,
        viewRecipe,
        saveRecipe,
        confirmDeleteRecipe,
        addReceiveItem,
        removeReceiveItem,
        addTransferItem,
        removeTransferItem,
        addIngredient,
        removeIngredient,
        closeModal: (id) => closeModal(id),
        openModal: (id) => openModal(id),
        backupData,
        importData,
        exportData,
        resetData,
        importInventory,
        saveSettings,
        exportReportCSV,
        printReport
    };
})();
