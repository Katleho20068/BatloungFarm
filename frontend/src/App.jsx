
import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:5000/api';
const AUTH_STORAGE_KEY = 'batloung-farm-user';
const PAGE_PATHS = {
  Dashboard: '/dashboard',
  Fruits: '/fruits',
  Suppliers: '/suppliers',
  Vendors: '/vendors',
  Purchases: '/purchases',
  Sales: '/sales',
  Stock: '/stock'
};
const PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape'
];
const getGoogleMapsDirectionsUrl = (location) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    location
  )}&travelmode=driving`;

const getMonthKey = (dateValue) => {
  if (!dateValue) return '';

  const value = String(dateValue);
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value
  );

  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};
const getPageFromPath = (path) =>
  Object.entries(PAGE_PATHS).find(
    ([, pagePath]) => pagePath === path.toLowerCase()
  )?.[0] || 'Dashboard';

function App() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(AUTH_STORAGE_KEY) === 'admin'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [stats, setStats] = useState(null);
  const [fruits, setFruits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [stock, setStock] = useState([]);

  const activePage = getPageFromPath(pathname);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [message, setMessage] = useState('');

  const navigate = (path, replace = false) => {
    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    setPathname(window.location.pathname);
  };

  // Fruit form fields
  const [fruitName, setFruitName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Available');

  // Supplier form fields
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [supplierProvinceFilter, setSupplierProvinceFilter] = useState('');
  const [address, setAddress] = useState('');

  // Vendor form fields
  const [vendorName, setVendorName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorLocation, setVendorLocation] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');

  // Purchase form fields
  const [purchaseSupplier, setPurchaseSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseItems, setPurchaseItems] = useState([
    {
      fruit_id: '',
      quantity: '',
      unit_cost: '',
      packaging_size: 'Small'
    }
  ]);
  const [savingPurchase, setSavingPurchase] = useState(false);

  // Sale form fields
  const [saleVendor, setSaleVendor] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [salePaymentMethod, setSalePaymentMethod] = useState('Cash');
  const [saleAmountPaid, setSaleAmountPaid] = useState('');
  const [saleItems, setSaleItems] = useState([
    {
      fruit_id: '',
      quantity: '',
      unit_price: '',
      packaging_size: 'Small'
    }
  ]);
  const [savingSale, setSavingSale] = useState(false);

  const formatDate = (dateValue) => {
    if (!dateValue) return '';

    const date = new Date(dateValue);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // FETCH ALL FARM DATA
  const fetchData = async () => {
    try {
      const [
        fruitResponse,
        statsResponse,
        supplierResponse,
        vendorResponse,
        purchaseResponse,
        saleResponse,
        stockResponse
      ] = await Promise.all([
        axios.get(`${API}/fruits`),
        axios.get(`${API}/dashboard`),
        axios.get(`${API}/suppliers`),
        axios.get(`${API}/vendors`),
        axios.get(`${API}/purchases`),
        axios.get(`${API}/sales`),
        axios.get(`${API}/stock`)
      ]);

      setFruits(fruitResponse.data.data);
      setStats(statsResponse.data.data);
      setSuppliers(supplierResponse.data.data);
      setVendors(vendorResponse.data.data);
      setPurchases(purchaseResponse.data.data);
      setSales(saleResponse.data.data);
      setStock(stockResponse.data.data);

      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load farm data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/login') {
      const returnTo = encodeURIComponent(window.location.pathname);
      window.history.replaceState({}, '', `/login?returnTo=${returnTo}`);
      return;
    }

    if (isAuthenticated && pathname === '/login') {
      window.history.replaceState({}, '', PAGE_PATHS.Dashboard);
    }
  }, [isAuthenticated, pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.resolve().then(fetchData);
    }
  }, [isAuthenticated]);

  const handleLogin = (event) => {
    event.preventDefault();

    if (username !== 'admin' || password !== 'admin123') {
      setLoginError('Incorrect username or password.');
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, 'admin');
    setIsAuthenticated(true);
    setLoginError('');

    const requestedPath = new URLSearchParams(window.location.search).get('returnTo');
    const returnPath = Object.values(PAGE_PATHS).find(
      (pagePath) => pagePath === requestedPath?.toLowerCase()
    );
    navigate(returnPath || PAGE_PATHS.Dashboard);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    navigate('/login');
  };

  // =========================
  // FRUIT FUNCTIONS
  // =========================

  const openAddFruitForm = () => {
    setEditingItem(null);
    setFruitName('');
    setDescription('');
    setStatus('Available');
    setMessage('');
    setShowForm(true);
  };

  const openEditFruitForm = (fruit) => {
    setEditingItem(fruit);
    setFruitName(fruit.fruit_name);
    setDescription(fruit.description);
    setStatus(fruit.status);
    setMessage('');
    setShowForm(true);
  };

  const saveFruit = async (e) => {
    e.preventDefault();

    const fruitData = {
      fruit_name: fruitName,
      description,
      status
    };

    try {
      if (editingItem) {
        await axios.put(
          `${API}/fruits/${editingItem.fruit_id}`,
          fruitData
        );

        setMessage('Fruit updated successfully!');
      } else {
        await axios.post(`${API}/fruits`, fruitData);
        setMessage('Fruit added successfully!');
      }

      setShowForm(false);
      await fetchData();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || 'Unable to save fruit.'
      );
    }
  };

  const deleteFruit = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fruit?')) {
      return;
    }

    try {
      await axios.delete(`${API}/fruits/${id}`);
      setMessage('Fruit deleted successfully!');
      await fetchData();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || 'Unable to delete fruit.'
      );
    }
  };

  // =========================
  // SUPPLIER FUNCTIONS
  // =========================

  const openAddSupplierForm = () => {
    setEditingItem(null);
    setBusinessName('');
    setContactPerson('');
    setPhone('');
    setProvince('');
    setAddress('');
    setMessage('');
    setShowForm(true);
  };

  const openEditSupplierForm = (supplier) => {
    setEditingItem(supplier);
    setBusinessName(supplier.business_name);
    setContactPerson(supplier.contact_person);
    setPhone(supplier.phone);
    setProvince(supplier.province);
    setAddress(supplier.address);
    setMessage('');
    setShowForm(true);
  };

  const saveSupplier = async (e) => {
    e.preventDefault();

    const supplierData = {
      business_name: businessName,
      contact_person: contactPerson,
      phone,
      province,
      address
    };

    try {
      if (editingItem) {
        await axios.put(
          `${API}/suppliers/${editingItem.supplier_id}`,
          supplierData
        );

        setMessage('Supplier updated successfully!');
      } else {
        await axios.post(`${API}/suppliers`, supplierData);
        setMessage('Supplier added successfully!');
      }

      setShowForm(false);
      await fetchData();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || 'Unable to save supplier.'
      );
    }
  };

  const deleteSupplier = async (id) => {
    if (!window.confirm(
      'Delete this supplier and permanently delete all of its purchase records? Current stock quantities will not change.'
    )) {
      return;
    }

    try {
      await axios.delete(`${API}/suppliers/${id}`);
      setMessage('Supplier and its purchase history deleted successfully!');
      await fetchData();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || 'Unable to delete supplier.'
      );
    }
  };

  // =========================
  // VENDOR FUNCTIONS
  // =========================

  const openAddVendorForm = () => {
    setEditingItem(null);
    setVendorName('');
    setVendorPhone('');
    setVendorLocation('');
    setRegistrationDate('');
    setMessage('');
    setShowForm(true);
  };

  const openEditVendorForm = (vendor) => {
    setEditingItem(vendor);
    setVendorName(vendor.vendor_name);
    setVendorPhone(vendor.phone_number);
    setVendorLocation(vendor.location);
    setRegistrationDate(formatDate(vendor.registration_date));
    setMessage('');
    setShowForm(true);
  };

  const saveVendor = async (e) => {
    e.preventDefault();

    const vendorData = {
      vendor_name: vendorName,
      phone_number: vendorPhone,
      location: vendorLocation,
      registration_date: registrationDate
    };

    try {
      if (editingItem) {
        await axios.put(
          `${API}/vendors/${editingItem.vendor_id}`,
          vendorData
        );

        setMessage('Vendor updated successfully!');
      } else {
        await axios.post(`${API}/vendors`, vendorData);
        setMessage('Vendor added successfully!');
      }

      setShowForm(false);
      await fetchData();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || 'Unable to save vendor.'
      );
    }
  };

  const deleteVendor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      await axios.delete(`${API}/vendors/${id}`);
      setMessage('Vendor deleted successfully!');
      await fetchData();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || 'Unable to delete vendor.'
      );
    }
  };

  const openRecordView = (title, details, items = []) => {
    setViewingRecord({ title, details, items });
  };

  // =========================
  // PURCHASE FUNCTIONS
  // =========================

  const openPurchaseForm = () => {
    setPurchaseSupplier('');
    setPurchaseDate(formatDate(new Date()));
    setPurchaseItems([
      {
        fruit_id: '',
        quantity: '',
        unit_cost: '',
        packaging_size: 'Small'
      }
    ]);
    setMessage('');
    setShowForm(true);
  };

  const updatePurchaseItem = (index, field, value) => {
    setPurchaseItems((previousItems) =>
      previousItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addPurchaseItem = () => {
    setPurchaseItems((previousItems) => [
      ...previousItems,
      {
        fruit_id: '',
        quantity: '',
        unit_cost: '',
        packaging_size: 'Small'
      }
    ]);
  };

  const removePurchaseItem = (index) => {
    setPurchaseItems((previousItems) =>
      previousItems.filter((_, i) => i !== index)
    );
  };

  const purchaseTotal = purchaseItems.reduce((total, item) => {
    return total +
      (Number(item.quantity) || 0) *
      (Number(item.unit_cost) || 0);
  }, 0);

  const savePurchase = async (e) => {
    e.preventDefault();

    if (!purchaseSupplier || !purchaseDate) {
      setMessage('Please select a supplier and purchase date.');
      return;
    }

    if (purchaseItems.length === 0) {
      setMessage('Please add at least one fruit.');
      return;
    }

    const invalidItem = purchaseItems.some((item) =>
      !item.fruit_id ||
      !item.quantity ||
      Number(item.quantity) <= 0 ||
      item.unit_cost === '' ||
      Number(item.unit_cost) < 0 ||
      !item.packaging_size
    );

    if (invalidItem) {
      setMessage('Please complete all fruit details correctly.');
      return;
    }

    const purchaseData = {
      supplier_id: Number(purchaseSupplier),
      purchase_date: purchaseDate,
      items: purchaseItems.map((item) => ({
        fruit_id: Number(item.fruit_id),
        quantity: Number(item.quantity),
        unit_cost: Number(item.unit_cost),
        packaging_size: item.packaging_size
      }))
    };

    try {
      setSavingPurchase(true);
      setMessage('');

      await axios.post(`${API}/purchases`, purchaseData);

      setMessage('Purchase recorded successfully!');
      setShowForm(false);

      await fetchData();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || 'Unable to record purchase.'
      );
    } finally {
      setSavingPurchase(false);
    }
  };

  // =========================
  // SALE FUNCTIONS
  // =========================

  const openSaleForm = () => {
    setSaleVendor('');
    setSaleDate(formatDate(new Date()));
    setSalePaymentMethod('Cash');
    setSaleAmountPaid('');
    setSaleItems([
      {
        fruit_id: '',
        quantity: '',
        unit_price: '',
        packaging_size: 'Small'
      }
    ]);
    setMessage('');
    setShowForm(true);
  };

  const updateSaleItem = (index, field, value) => {
    setSaleItems((previousItems) =>
      previousItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addSaleItem = () => {
    setSaleItems((previousItems) => [
      ...previousItems,
      {
        fruit_id: '',
        quantity: '',
        unit_price: '',
        packaging_size: 'Small'
      }
    ]);
  };

  const removeSaleItem = (index) => {
    setSaleItems((previousItems) =>
      previousItems.filter((_, i) => i !== index)
    );
  };

  const saleTotal = saleItems.reduce((total, item) => {
    return total +
      (Number(item.quantity) || 0) *
      (Number(item.unit_price) || 0);
  }, 0);

  const saveSale = async (e) => {
    e.preventDefault();

    if (!saleVendor || !saleDate) {
      setMessage('Please select a vendor and sale date.');
      return;
    }

    if (saleItems.length === 0) {
      setMessage('Please add at least one fruit.');
      return;
    }

    if (saleAmountPaid === '' || Number(saleAmountPaid) < 0) {
      setMessage('Please enter a valid amount paid.');
      return;
    }

    if (Number(saleAmountPaid) > saleTotal) {
      setMessage('Amount paid cannot exceed the sale total.');
      return;
    }

    const invalidItem = saleItems.some((item) =>
      !item.fruit_id ||
      !item.quantity ||
      Number(item.quantity) <= 0 ||
      item.unit_price === '' ||
      Number(item.unit_price) <= 0 ||
      !item.packaging_size
    );

    if (invalidItem) {
      setMessage('Please complete all fruit details correctly.');
      return;
    }

    const saleData = {
      vendor_id: Number(saleVendor),
      sale_date: saleDate,
      payment_method: salePaymentMethod,
      amount_paid: Number(saleAmountPaid),
      items: saleItems.map((item) => ({
        fruit_id: Number(item.fruit_id),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        packaging_size: item.packaging_size
      }))
    };

    try {
      setSavingSale(true);
      setMessage('');

      await axios.post(`${API}/sales`, saleData);

      setMessage('Sale recorded successfully!');
      setShowForm(false);

      await fetchData();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || 'Unable to record sale.'
      );
    } finally {
      setSavingSale(false);
    }
  };

  // Group sale detail rows into individual sales
  const groupedSales = Object.values(
    sales.reduce((groups, item) => {
      if (!groups[item.sale_id]) {
        groups[item.sale_id] = {
          sale_id: item.sale_id,
          vendor_id: item.vendor_id,
          vendor_name: item.vendor_name,
          sale_date: item.sale_date,
          payment_method: item.payment_method,
          payment_status: item.payment_status,
          total_amount: item.total_amount,
          amount_paid: item.amount_paid,
          items: []
        };
      }

      if (item.sales_detail_id) {
        groups[item.sale_id].items.push(item);
      }

      return groups;
    }, {})
  );

  // Group purchase detail rows into individual purchases
  const groupedPurchases = Object.values(
    purchases.reduce((groups, item) => {
      if (!groups[item.purchase_id]) {
        groups[item.purchase_id] = {
          purchase_id: item.purchase_id,
          supplier_id: item.supplier_id,
          business_name: item.business_name,
          purchase_date: item.purchase_date,
          total_amount: item.total_amount,
          items: []
        };
      }

      if (item.purchase_detail_id) {
        groups[item.purchase_id].items.push(item);
      }

      return groups;
    }, {})
  );

  // =========================
  // DASHBOARD CARDS
  // =========================

  const cards = stats ? [
    { title: 'Total Fruits', value: stats.totalFruits, icon: '🍎' },
    { title: 'Suppliers', value: stats.totalSuppliers, icon: '🚚' },
    { title: 'Vendors', value: stats.totalVendors, icon: '🏪' },
    { title: 'Purchases', value: stats.totalPurchases, icon: '🛒' },
    { title: 'Sales', value: stats.totalSales, icon: '💰' },
    { title: 'Stock Records', value: stats.totalStockRecords, icon: '📦' }
  ] : [];

  const currentMonthKey = getMonthKey(new Date());
  const totalSalesRevenue = groupedSales.reduce(
    (total, sale) => total + (Number(sale.total_amount) || 0),
    0
  );
  const totalPurchaseSpend = groupedPurchases.reduce(
    (total, purchase) => total + (Number(purchase.total_amount) || 0),
    0
  );
  const outstandingBalance = groupedSales.reduce(
    (total, sale) =>
      total + Math.max(
        (Number(sale.total_amount) || 0) - (Number(sale.amount_paid) || 0),
        0
      ),
    0
  );
  const currentMonthSales = groupedSales
    .filter((sale) => getMonthKey(sale.sale_date) === currentMonthKey)
    .reduce((total, sale) => total + (Number(sale.total_amount) || 0), 0);
  const stockUnits = stock.reduce(
    (total, item) => total + (Number(item.available_quantity) || 0),
    0
  );
  const formatMoney = (amount) =>
    `M${amount.toLocaleString('en-LS', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  const performanceMetrics = [
    {
      title: 'Sales Revenue',
      value: formatMoney(totalSalesRevenue),
      detail: 'Total value of recorded sales',
      icon: '💰'
    },
    {
      title: 'Purchase Spend',
      value: formatMoney(totalPurchaseSpend),
      detail: 'Total value of recorded purchases',
      icon: '🛒'
    },
    {
      title: 'Trading Balance',
      value: formatMoney(totalSalesRevenue - totalPurchaseSpend),
      detail: 'Sales minus purchases; not net profit',
      icon: '📈'
    },
    {
      title: 'Outstanding Sales',
      value: formatMoney(outstandingBalance),
      detail: 'Remaining customer balances',
      icon: '⏳'
    },
    {
      title: 'Sales This Month',
      value: formatMoney(currentMonthSales),
      detail: 'Revenue recorded this month',
      icon: '📅'
    },
    {
      title: 'Units in Stock',
      value: stockUnits.toLocaleString(),
      detail: 'Available units across all packaging',
      icon: '📦'
    }
  ];
  const monthlySales = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    const key = getMonthKey(date);

    return {
      key,
      label: date.toLocaleDateString('en', { month: 'short' }),
      revenue: groupedSales
        .filter((sale) => getMonthKey(sale.sale_date) === key)
        .reduce((total, sale) => total + (Number(sale.total_amount) || 0), 0)
    };
  });
  const highestMonthlySales = Math.max(
    ...monthlySales.map((month) => month.revenue),
    0
  );

  const menuItems = [
    'Dashboard',
    'Fruits',
    'Suppliers',
    'Vendors',
    'Purchases',
    'Sales',
    'Stock'
  ];

  const filteredSuppliers = supplierProvinceFilter
    ? suppliers.filter(
        (supplier) =>
          supplier.province?.toLowerCase() ===
          supplierProvinceFilter.toLowerCase()
      )
    : suppliers;

  if (pathname === '/login' || !isAuthenticated) {
    return (
      <main className="login-page">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="login-brand">🍃</div>
          <h1>Batloung Farm</h1>
          <p className="login-subtitle">Sign in to your farm management system</p>

          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {loginError && <p className="login-error" role="alert">{loginError}</p>}

          <button type="submit" className="login-button">Log in</button>
          <aside className="lecturer-demo" aria-label="Lecturer demo login details">
            <strong>LECTURER DEMO</strong>
            <span>Username: admin | Password: admin123</span>
            <span>Use this to login and test the system</span>
          </aside>
        </form>
      </main>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================

  return (
    <div className="dashboard">

      <aside className="sidebar">
        <h2>🍃 Batloung Farm</h2>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item}
              className={activePage === item ? 'active' : ''}
              onClick={() => {
                navigate(PAGE_PATHS[item]);
                setMessage('');
                setShowForm(false);
              }}
            >
              {item === 'Dashboard' ? '📊' :
                item === 'Fruits' ? '🍎' :
                  item === 'Suppliers' ? '🚚' :
                    item === 'Vendors' ? '🏪' :
                      item === 'Purchases' ? '🛒' :
                        item === 'Sales' ? '💰' : '📦'} {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">

        <header className="topbar">
          <div>
            <h1>
              {activePage === 'Dashboard'
                ? 'Dashboard Overview'
                : `Manage ${activePage}`}
            </h1>

            <p>Welcome to your farm management system.</p>
          </div>

          <div className="admin-actions">
            <span className="admin">Administrator</span>
            <button type="button" className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {loading && <p>Loading farm data...</p>}

        {error && <p className="error">{error}</p>}

        {/* DASHBOARD PAGE */}

        {!loading && !error && activePage === 'Dashboard' && (
          <>
            <section className="welcome">
              <h2>Welcome to Batloung Farm Management</h2>

              <p>
                Monitor your fruits, suppliers, purchases, sales
                and stock in one place.
              </p>
            </section>

            <section className="stats-grid">
              {cards.map((card) => (
                <div className="stat-card" key={card.title}>
                  <div className="stat-icon">{card.icon}</div>

                  <div>
                    <p>{card.title}</p>
                    <h2>{card.value}</h2>
                  </div>
                </div>
              ))}
            </section>

            <section className="performance-section">
              <div className="performance-heading">
                <div>
                  <h2>Business performance</h2>
                  <p>Key figures based on your recorded farm activity.</p>
                </div>
              </div>

              <div className="performance-grid">
                {performanceMetrics.map((metric) => (
                  <article className="performance-card" key={metric.title}>
                    <div className="performance-card-heading">
                      <span className="performance-icon" aria-hidden="true">
                        {metric.icon}
                      </span>
                      <p>{metric.title}</p>
                    </div>
                    <h3>{metric.value}</h3>
                    <p className="performance-detail">{metric.detail}</p>
                  </article>
                ))}
              </div>

              <div className="sales-trend">
                <div className="sales-trend-heading">
                  <div>
                    <h3>Sales revenue trend</h3>
                    <p>Monthly revenue over the last six months</p>
                  </div>
                </div>
                <div
                  className="sales-chart"
                  role="img"
                  aria-label={`Monthly sales revenue: ${monthlySales
                    .map((month) => `${month.label} ${formatMoney(month.revenue)}`)
                    .join(', ')}`}
                >
                  {monthlySales.map((month) => (
                    <div className="sales-chart-column" key={month.key}>
                      <span className="sales-chart-value">
                        {formatMoney(month.revenue)}
                      </span>
                      <div className="sales-chart-track">
                        <div
                          className="sales-chart-bar"
                          style={{
                            height: highestMonthlySales
                              ? `${(month.revenue / highestMonthlySales) * 100}%`
                              : '0%'
                          }}
                        />
                      </div>
                      <span className="sales-chart-label">{month.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* FRUITS PAGE */}

        {!loading && !error && activePage === 'Fruits' && (
          <section className="fruit-section">

            <div className="section-heading">
              <div>
                <h2>Fruit Inventory</h2>
                <p>Manage all fruits registered in your farm.</p>
              </div>

              <button className="add-button" onClick={openAddFruitForm}>
                + Add New Fruit
              </button>
            </div>

            {message && <p className="success-message">{message}</p>}

            {showForm && (
              <form className="fruit-form" onSubmit={saveFruit}>
                <h3>{editingItem ? 'Edit Fruit' : 'Add New Fruit'}</h3>

                <label>Fruit Name</label>
                <input
                  type="text"
                  value={fruitName}
                  onChange={(e) => setFruitName(e.target.value)}
                  placeholder="Enter fruit name"
                  required
                />

                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter fruit description"
                  required
                />

                <label>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>

                <div className="form-actions">
                  <button type="submit" className="add-button">
                    {editingItem ? 'Update Fruit' : 'Save Fruit'}
                  </button>

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fruit Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {fruits.map((fruit) => (
                    <tr key={fruit.fruit_id}>
                      <td>{fruit.fruit_id}</td>
                      <td>{fruit.fruit_name}</td>
                      <td>{fruit.description}</td>
                      <td>
                        <span className="status-badge">
                          {fruit.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="view-button"
                          onClick={() =>
                            openRecordView('Fruit Details', [
                              { label: 'Fruit ID', value: fruit.fruit_id },
                              { label: 'Fruit Name', value: fruit.fruit_name },
                              { label: 'Description', value: fruit.description },
                              { label: 'Status', value: fruit.status }
                            ])
                          }
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => openEditFruitForm(fruit)}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => deleteFruit(fruit.fruit_id)}
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {fruits.length === 0 && (
                    <tr>
                      <td colSpan="5">No fruits found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SUPPLIERS PAGE */}

        {!loading && !error && activePage === 'Suppliers' && (
          <section className="fruit-section">

            <div className="section-heading">
              <div>
                <h2>Suppliers Management</h2>
                <p>Manage businesses that supply fruits to your farm.</p>
              </div>

              <button className="add-button" onClick={openAddSupplierForm}>
                + Add New Supplier
              </button>
            </div>

            {message && <p className="success-message">{message}</p>}

            {showForm && (
              <form className="fruit-form" onSubmit={saveSupplier}>
                <h3>{editingItem ? 'Edit Supplier' : 'Add New Supplier'}</h3>

                <label>Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter business name"
                  required
                />

                <label>Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Enter contact person"
                  required
                />

                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                />

                <label>Province</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                >
                  <option value="">Select province</option>
                  {province && !PROVINCES.includes(province) && (
                    <option value={province}>{province}</option>
                  )}
                  {PROVINCES.map((provinceOption) => (
                    <option key={provinceOption} value={provinceOption}>
                      {provinceOption}
                    </option>
                  ))}
                </select>

                <label>Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter physical address"
                  required
                />

                <div className="form-actions">
                  <button type="submit" className="add-button">
                    {editingItem ? 'Update Supplier' : 'Save Supplier'}
                  </button>

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="province-filter">
              <label htmlFor="supplier-province-filter">Filter by province</label>
              <select
                id="supplier-province-filter"
                value={supplierProvinceFilter}
                onChange={(e) => setSupplierProvinceFilter(e.target.value)}
              >
                <option value="">All Provinces</option>
                {PROVINCES.map((provinceOption) => (
                  <option key={provinceOption} value={provinceOption}>
                    {provinceOption}
                  </option>
                ))}
              </select>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Business Name</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Province</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.supplier_id}>
                      <td>{supplier.supplier_id}</td>
                      <td>{supplier.business_name}</td>
                      <td>{supplier.contact_person}</td>
                      <td>{supplier.phone}</td>
                      <td>{supplier.province}</td>
                      <td>{supplier.address}</td>
                      <td>
                        <button
                          type="button"
                          className="view-button"
                          onClick={() =>
                            openRecordView('Supplier Details', [
                              { label: 'Supplier ID', value: supplier.supplier_id },
                              { label: 'Business Name', value: supplier.business_name },
                              { label: 'Contact Person', value: supplier.contact_person },
                              { label: 'Phone', value: supplier.phone },
                              { label: 'Province', value: supplier.province },
                              { label: 'Address', value: supplier.address }
                            ])
                          }
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => openEditSupplierForm(supplier)}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => deleteSupplier(supplier.supplier_id)}
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredSuppliers.length === 0 && (
                    <tr>
                      <td colSpan="7">
                        {suppliers.length === 0
                          ? 'No suppliers found.'
                          : 'No suppliers found in this province.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* VENDORS PAGE */}

        {!loading && !error && activePage === 'Vendors' && (
          <section className="fruit-section">

            <div className="section-heading">
              <div>
                <h2>Vendors Management</h2>
                <p>Manage all registered farm vendors.</p>
              </div>

              <button className="add-button" onClick={openAddVendorForm}>
                + Add New Vendor
              </button>
            </div>

            {message && <p className="success-message">{message}</p>}

            {showForm && (
              <form className="fruit-form" onSubmit={saveVendor}>
                <h3>{editingItem ? 'Edit Vendor' : 'Add New Vendor'}</h3>

                <label>Vendor Name</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="Enter vendor name"
                  required
                />

                <label>Phone Number</label>
                <input
                  type="tel"
                  value={vendorPhone}
                  onChange={(e) => setVendorPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                />

                <label>Location</label>
                <div className="location-picker">
                  <input
                    className="location-picker-input"
                    type="text"
                    value={vendorLocation}
                    onChange={(e) => setVendorLocation(e.target.value)}
                    placeholder="Enter vendor location or coordinates"
                    aria-describedby="vendor-location-help"
                    required
                  />
                  <a
                    className="add-button location-map-link"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      vendorLocation.trim() || 'South Africa'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Google Maps
                  </a>
                </div>
                <p id="vendor-location-help" className="location-picker-help">
                  Find the location in Google Maps, then paste its address or
                  coordinates here.
                </p>

                <label>Registration Date</label>
                <input
                  type="date"
                  value={registrationDate}
                  onChange={(e) => setRegistrationDate(e.target.value)}
                  required
                />

                <div className="form-actions">
                  <button type="submit" className="add-button">
                    {editingItem ? 'Update Vendor' : 'Save Vendor'}
                  </button>

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Vendor Name</th>
                    <th>Phone Number</th>
                    <th>Location</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor.vendor_id}>
                      <td>{vendor.vendor_id}</td>
                      <td>{vendor.vendor_name}</td>
                      <td>{vendor.phone_number}</td>
                      <td>
                        <span>{vendor.location}</span>
                        <a
                          className="maps-direction-link"
                          href={getGoogleMapsDirectionsUrl(vendor.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Get Directions
                        </a>
                      </td>
                      <td>{formatDate(vendor.registration_date)}</td>
                      <td>
                        <button
                          type="button"
                          className="view-button"
                          onClick={() =>
                            openRecordView('Vendor Details', [
                              { label: 'Vendor ID', value: vendor.vendor_id },
                              { label: 'Vendor Name', value: vendor.vendor_name },
                              { label: 'Phone', value: vendor.phone_number },
                              { label: 'Location', value: vendor.location },
                              {
                                label: 'Directions',
                                value: (
                                  <a
                                    className="maps-direction-link"
                                    href={getGoogleMapsDirectionsUrl(vendor.location)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Get Directions
                                  </a>
                                )
                              },
                              {
                                label: 'Registration Date',
                                value: formatDate(vendor.registration_date)
                              }
                            ])
                          }
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => openEditVendorForm(vendor)}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => deleteVendor(vendor.vendor_id)}
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {vendors.length === 0 && (
                    <tr>
                      <td colSpan="6">No vendors found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* PURCHASES PAGE */}

        {!loading && !error && activePage === 'Purchases' && (
          <section className="fruit-section">

            <div className="section-heading">
              <div>
                <h2>Purchase Management</h2>
                <p>Record fruit purchases and monitor your suppliers.</p>
              </div>

              <button className="add-button" onClick={openPurchaseForm}>
                + Record New Purchase
              </button>
            </div>

            {message && (
              <p className="success-message">{message}</p>
            )}

            {showForm && (
              <form className="fruit-form" onSubmit={savePurchase}>
                <h3>Record New Purchase</h3>

                <label>Supplier</label>
                <select
                  value={purchaseSupplier}
                  onChange={(e) => setPurchaseSupplier(e.target.value)}
                  required
                >
                  <option value="">Select supplier</option>

                  {suppliers.map((supplier) => (
                    <option
                      key={supplier.supplier_id}
                      value={supplier.supplier_id}
                    >
                      {supplier.business_name}
                    </option>
                  ))}
                </select>

                <label>Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  required
                />

                <h3>Fruit Details</h3>

                {purchaseItems.map((item, index) => (
                  <div
                    key={index}
                    className="purchase-item"
                    style={{
                      border: '1px solid #ddd',
                      padding: '15px',
                      marginBottom: '15px',
                      borderRadius: '8px'
                    }}
                  >
                    <h4>Fruit {index + 1}</h4>

                    <label>Fruit</label>
                    <select
                      value={item.fruit_id}
                      onChange={(e) =>
                        updatePurchaseItem(index, 'fruit_id', e.target.value)
                      }
                      required
                    >
                      <option value="">Select fruit</option>

                      {fruits.map((fruit) => (
                        <option
                          key={fruit.fruit_id}
                          value={fruit.fruit_id}
                        >
                          {fruit.fruit_name}
                        </option>
                      ))}
                    </select>

                    <label>Packaging Size</label>
                    <select
                      value={item.packaging_size}
                      onChange={(e) =>
                        updatePurchaseItem(
                          index,
                          'packaging_size',
                          e.target.value
                        )
                      }
                      required
                    >
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                    </select>

                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updatePurchaseItem(index, 'quantity', e.target.value)
                      }
                      placeholder="Enter quantity"
                      required
                    />

                    <label>Unit Cost (M)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_cost}
                      onChange={(e) =>
                        updatePurchaseItem(index, 'unit_cost', e.target.value)
                      }
                      placeholder="Enter cost per unit"
                      required
                    />

                    <p>
                      Subtotal: M
                      {(
                        (Number(item.quantity) || 0) *
                        (Number(item.unit_cost) || 0)
                      ).toFixed(2)}
                    </p>

                    {purchaseItems.length > 1 && (
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => removePurchaseItem(index)}
                      >
                        Remove Fruit
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="edit-button"
                  onClick={addPurchaseItem}
                >
                  + Add Another Fruit
                </button>

                <h3>
                  Purchase Total: M{purchaseTotal.toFixed(2)}
                </h3>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="add-button"
                    disabled={savingPurchase}
                  >
                    {savingPurchase ? 'Saving...' : 'Save Purchase'}
                  </button>

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowForm(false)}
                    disabled={savingPurchase}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <h3>Purchase History</h3>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Purchase ID</th>
                    <th>Supplier</th>
                    <th>Date</th>
                    <th>Fruit Details</th>
                    <th>Total Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {groupedPurchases.map((purchase) => (
                    <tr key={purchase.purchase_id}>
                      <td>{purchase.purchase_id}</td>
                      <td>{purchase.business_name}</td>
                      <td>{formatDate(purchase.purchase_date)}</td>
                      <td>
                        {purchase.items.map((item) => (
                          <div key={item.purchase_detail_id}>
                            {item.fruit_name} - {item.quantity} (
                            {item.packaging_size})
                          </div>
                        ))}
                      </td>
                      <td>
                        M{Number(purchase.total_amount).toFixed(2)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="view-button"
                          onClick={() =>
                            openRecordView(
                              'Purchase Details',
                              [
                                { label: 'Purchase ID', value: purchase.purchase_id },
                                { label: 'Supplier', value: purchase.business_name },
                                { label: 'Supplier ID', value: purchase.supplier_id },
                                {
                                  label: 'Purchase Date',
                                  value: formatDate(purchase.purchase_date)
                                },
                                {
                                  label: 'Total Amount',
                                  value: `M${Number(purchase.total_amount).toFixed(2)}`
                                }
                              ],
                              purchase.items.map((item, index) => ({
                                title: `Fruit ${index + 1}`,
                                details: [
                                  { label: 'Fruit', value: item.fruit_name },
                                  { label: 'Quantity', value: item.quantity },
                                  {
                                    label: 'Unit Cost',
                                    value: `M${Number(item.unit_cost).toFixed(2)}`
                                  },
                                  {
                                    label: 'Packaging Size',
                                    value: item.packaging_size
                                  },
                                  {
                                    label: 'Subtotal',
                                    value: `M${(
                                      Number(item.quantity) *
                                      Number(item.unit_cost)
                                    ).toFixed(2)}`
                                  }
                                ]
                              }))
                            )
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  {groupedPurchases.length === 0 && (
                    <tr>
                      <td colSpan="6">No purchases recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SALES PAGE */}

        {!loading && !error && activePage === 'Sales' && (
          <section className="fruit-section">
            <div className="section-heading">
              <div>
                <h2>Sales Management</h2>
                <p>Record fruit sales and monitor vendor payments.</p>
              </div>

              <button className="add-button" onClick={openSaleForm}>
                + Record New Sale
              </button>
            </div>

            {message && (
              <p className="success-message">{message}</p>
            )}

            {showForm && (
              <form className="fruit-form" onSubmit={saveSale}>
                <h3>Record New Sale</h3>

                <label>Vendor</label>
                <select
                  value={saleVendor}
                  onChange={(e) => setSaleVendor(e.target.value)}
                  required
                >
                  <option value="">Select vendor</option>
                  {vendors.map((vendor) => (
                    <option
                      key={vendor.vendor_id}
                      value={vendor.vendor_id}
                    >
                      {vendor.vendor_name}
                    </option>
                  ))}
                </select>

                <label>Sale Date</label>
                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  required
                />

                <label>Payment Method</label>
                <select
                  value={salePaymentMethod}
                  onChange={(e) => setSalePaymentMethod(e.target.value)}
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Credit">Credit</option>
                </select>

                <label>Amount Paid (M)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={saleAmountPaid}
                  onChange={(e) => setSaleAmountPaid(e.target.value)}
                  placeholder="Enter amount paid"
                  required
                />

                <h3>Fruit Details</h3>

                {saleItems.map((item, index) => (
                  <div
                    key={index}
                    className="sale-item"
                    style={{
                      border: '1px solid #ddd',
                      padding: '15px',
                      marginBottom: '15px',
                      borderRadius: '8px'
                    }}
                  >
                    <h4>Fruit {index + 1}</h4>

                    <label>Fruit</label>
                    <select
                      value={item.fruit_id}
                      onChange={(e) =>
                        updateSaleItem(index, 'fruit_id', e.target.value)
                      }
                      required
                    >
                      <option value="">Select fruit</option>
                      {fruits.map((fruit) => (
                        <option
                          key={fruit.fruit_id}
                          value={fruit.fruit_id}
                        >
                          {fruit.fruit_name}
                        </option>
                      ))}
                    </select>

                    <label>Packaging Size</label>
                    <select
                      value={item.packaging_size}
                      onChange={(e) =>
                        updateSaleItem(
                          index,
                          'packaging_size',
                          e.target.value
                        )
                      }
                      required
                    >
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                    </select>

                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateSaleItem(index, 'quantity', e.target.value)
                      }
                      placeholder="Enter quantity"
                      required
                    />
                    <label>Unit Price (M)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateSaleItem(index, 'unit_price', e.target.value)
                      }
                      placeholder="Enter price per unit"
                      required
                    />

                    <p>
                      Subtotal: M
                      {(
                        (Number(item.quantity) || 0) *
                        (Number(item.unit_price) || 0)
                      ).toFixed(2)}
                    </p>

                    {saleItems.length > 1 && (
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => removeSaleItem(index)}
                      >
                        Remove Fruit
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="edit-button"
                  onClick={addSaleItem}
                >
                  + Add Another Fruit
                </button>

                <h3>Sale Total: M{saleTotal.toFixed(2)}</h3>
                <p>
                  Balance:
                  M{Math.max(saleTotal - (Number(saleAmountPaid) || 0), 0).toFixed(2)}
                </p>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="add-button"
                    disabled={savingSale}
                  >
                    {savingSale ? 'Saving...' : 'Save Sale'}
                  </button>

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowForm(false)}
                    disabled={savingSale}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <h3>Sales History</h3>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Sale ID</th>
                    <th>Vendor</th>
                    <th>Date</th>
                    <th>Fruit Details</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Total Amount</th>
                    <th>Amount Paid</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {groupedSales.map((sale) => (
                    <tr key={sale.sale_id}>
                      <td>{sale.sale_id}</td>
                      <td>{sale.vendor_name}</td>
                      <td>{formatDate(sale.sale_date)}</td>
                      <td>
                        {sale.items.map((item) => (
                          <div key={item.sales_detail_id}>
                            {item.fruit_name} - {item.quantity} (
                            {item.packaging_size})
                          </div>
                        ))}
                      </td>
                      <td>{sale.payment_method}</td>
                      <td>
                        <span className="status-badge">
                          {sale.payment_status}
                        </span>
                      </td>
                      <td>M{Number(sale.total_amount).toFixed(2)}</td>
                      <td>M{Number(sale.amount_paid).toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          className="view-button"
                          onClick={() =>
                            openRecordView(
                              'Sale Details',
                              [
                                { label: 'Sale ID', value: sale.sale_id },
                                { label: 'Vendor', value: sale.vendor_name },
                                { label: 'Vendor ID', value: sale.vendor_id },
                                {
                                  label: 'Sale Date',
                                  value: formatDate(sale.sale_date)
                                },
                                { label: 'Payment Method', value: sale.payment_method },
                                { label: 'Payment Status', value: sale.payment_status },
                                {
                                  label: 'Total Amount',
                                  value: `M${Number(sale.total_amount).toFixed(2)}`
                                },
                                {
                                  label: 'Amount Paid',
                                  value: `M${Number(sale.amount_paid).toFixed(2)}`
                                },
                                {
                                  label: 'Balance',
                                  value: `M${Math.max(
                                    Number(sale.total_amount) -
                                      Number(sale.amount_paid),
                                    0
                                  ).toFixed(2)}`
                                }
                              ],
                              sale.items.map((item, index) => ({
                                title: `Fruit ${index + 1}`,
                                details: [
                                  { label: 'Fruit', value: item.fruit_name },
                                  { label: 'Quantity', value: item.quantity },
                                  {
                                    label: 'Unit Price',
                                    value: `M${Number(item.unit_price).toFixed(2)}`
                                  },
                                  {
                                    label: 'Packaging Size',
                                    value: item.packaging_size
                                  },
                                  {
                                    label: 'Subtotal',
                                    value: `M${(
                                      Number(item.quantity) *
                                      Number(item.unit_price)
                                    ).toFixed(2)}`
                                  }
                                ]
                              }))
                            )
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  {groupedSales.length === 0 && (
                    <tr>
                      <td colSpan="9">No sales recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* STOCK PAGE */}

        {!loading && !error && activePage === 'Stock' && (
          <section className="fruit-section">
            <div className="section-heading">
              <div>
                <h2>Stock Management</h2>
                <p>Monitor available fruit quantities by packaging size.</p>
              </div>
            </div>

            {message && (
              <p className="success-message">{message}</p>
            )}

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div>
                  <p>Stock Records</p>
                  <h2>{stock.length}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div>
                  <p>Available Units</p>
                  <h2>
                    {stock.reduce(
                      (total, item) =>
                        total + (Number(item.available_quantity) || 0),
                      0
                    )}
                  </h2>
                </div>
              </div>
            </div>

            <div className="table-container" style={{ marginTop: '25px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Stock ID</th>
                    <th>Fruit</th>
                    <th>Packaging Size</th>
                    <th>Available Quantity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {stock.map((item) => (
                    <tr key={item.stock_id}>
                      <td>{item.stock_id}</td>
                      <td>{item.fruit_name}</td>
                      <td>{item.packaging_size}</td>
                      <td>{item.available_quantity}</td>
                      <td>
                        <span className="status-badge">
                          {Number(item.available_quantity) > 0
                            ? 'Available'
                            : 'Unavailable'}
                        </span>
                      </td>
                      <td>
                        <button
                            type="button"
                            className="view-button"
                            onClick={() =>
                              openRecordView('Stock Details', [
                                { label: 'Stock ID', value: item.stock_id },
                                { label: 'Fruit', value: item.fruit_name },
                                {
                                  label: 'Packaging Size',
                                  value: item.packaging_size
                                },
                                {
                                  label: 'Available Quantity',
                                  value: item.available_quantity
                                },
                                {
                                  label: 'Status',
                                  value: Number(item.available_quantity) > 0
                                    ? 'Available'
                                    : 'Unavailable'
                                }
                              ])
                            }
                        >
                            View
                        </button>
                      </td>
                    </tr>
                  ))}

                  {stock.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        No stock records available. Purchases will add stock here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>

      {viewingRecord && (
        <div className="view-modal-backdrop">
          <section
            className="view-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="record-view-title"
          >
            <div className="view-modal-heading">
              <h2 id="record-view-title">{viewingRecord.title}</h2>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setViewingRecord(null)}
                aria-label="Close details"
              >
                Close
              </button>
            </div>

            <dl className="view-details">
              {viewingRecord.details.map((detail) => (
                <div key={detail.label}>
                  <dt>{detail.label}</dt>
                  <dd>{detail.value ?? '—'}</dd>
                </div>
              ))}
            </dl>

            {viewingRecord.items.length > 0 && (
              <div className="view-modal-items">
                <h3>Items</h3>
                {viewingRecord.items.map((item) => (
                  <section className="view-modal-item" key={item.title}>
                    <h4>{item.title}</h4>
                    <dl className="view-details">
                      {item.details.map((detail) => (
                        <div key={detail.label}>
                          <dt>{detail.label}</dt>
                          <dd>{detail.value ?? '—'}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
