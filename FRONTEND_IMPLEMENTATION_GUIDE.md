# BeBrand Frontend Implementation Guide

## 📋 Overview

This guide explains all the backend features we implemented and provides complete frontend integration examples for each feature.

---

## 🎯 What We Built

### 1. **Advanced Order Filtering**
- Filter orders by status (pending, processing, shipped, delivered, cancelled)
- Date range filtering (startDate and endDate)
- Search by customer email or order ID
- Pagination support

### 2. **CSV Export for Orders**
- Export all orders or filtered orders to CSV
- Download functionality for admin panel
- Includes all order details (customer info, items, shipping, payment status)

### 3. **Product Stock Status**
- Automatic stock status calculation
- Three levels: In Stock, Low Stock (≤10 items), Out of Stock (0 items)
- Real-time status in product listings

### 4. **Newsletter Subscription System**
- Public subscribe/unsubscribe endpoints
- Admin view of all subscribers
- Duplicate email prevention
- Reactivation of previously unsubscribed emails

### 5. **Enhanced Analytics**
- Revenue analytics with 30-day history
- Order status distribution
- Average order value calculation
- Growth metrics for dashboard

---

## 🚀 Frontend Implementation

### 1. Admin Orders Page with Filtering

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orders Management - BeBrand Admin</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: #F5E6D3;
            color: #000000;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: #8B6F47;
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .filters {
            background: white;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .filter-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .filter-group {
            display: flex;
            flex-direction: column;
        }
        
        .filter-group label {
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 5px;
            color: #333;
        }
        
        .filter-group input,
        .filter-group select {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .filter-group input:focus,
        .filter-group select:focus {
            outline: none;
            border-color: #8B6F47;
        }
        
        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: #8B6F47;
            color: white;
        }
        
        .btn-primary:hover {
            background: #6d5738;
        }
        
        .btn-secondary {
            background: white;
            color: #8B6F47;
            border: 2px solid #8B6F47;
        }
        
        .btn-secondary:hover {
            background: #f5f5f5;
        }
        
        .btn-export {
            background: #2ECC71;
            color: white;
        }
        
        .btn-export:hover {
            background: #27ae60;
        }
        
        .status-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .status-tab {
            padding: 10px 20px;
            background: white;
            border: 2px solid #ddd;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .status-tab.active {
            background: #8B6F47;
            color: white;
            border-color: #8B6F47;
        }
        
        .orders-table {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th {
            background: #f8f9fa;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            color: #555;
            border-bottom: 2px solid #ddd;
        }
        
        td {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
        }
        
        tr:hover {
            background: #f9f9f9;
        }
        
        .status-badge {
            padding: 5px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
        }
        
        .status-pending {
            background: #FFF3CD;
            color: #856404;
        }
        
        .status-processing {
            background: #D1ECF1;
            color: #0C5460;
        }
        
        .status-shipped {
            background: #D4EDDA;
            color: #155724;
        }
        
        .status-delivered {
            background: #28A745;
            color: white;
        }
        
        .status-cancelled {
            background: #F8D7DA;
            color: #721C24;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin-top: 20px;
            padding: 20px;
            background: white;
            border-radius: 8px;
        }
        
        .pagination button {
            padding: 8px 15px;
            border: 1px solid #ddd;
            background: white;
            cursor: pointer;
            border-radius: 4px;
        }
        
        .pagination button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .pagination span {
            font-size: 14px;
            color: #555;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            font-size: 16px;
            color: #555;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #999;
        }
        
        .empty-state h3 {
            font-size: 20px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Orders Management</h1>
            <p>Manage and track all customer orders</p>
        </div>

        <!-- Status Filter Tabs -->
        <div class="status-tabs">
            <div class="status-tab active" data-status="">All Orders</div>
            <div class="status-tab" data-status="pending">Pending</div>
            <div class="status-tab" data-status="processing">Processing</div>
            <div class="status-tab" data-status="shipped">Shipped</div>
            <div class="status-tab" data-status="delivered">Delivered</div>
            <div class="status-tab" data-status="cancelled">Cancelled</div>
        </div>

        <!-- Advanced Filters -->
        <div class="filters">
            <div class="filter-row">
                <div class="filter-group">
                    <label>Start Date</label>
                    <input type="date" id="startDate">
                </div>
                <div class="filter-group">
                    <label>End Date</label>
                    <input type="date" id="endDate">
                </div>
                <div class="filter-group">
                    <label>Search</label>
                    <input type="text" id="search" placeholder="Email or Order ID">
                </div>
                <div class="filter-group">
                    <label>Items Per Page</label>
                    <select id="limit">
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
            </div>
            
            <div class="button-group">
                <button class="btn btn-primary" onclick="applyFilters()">Apply Filters</button>
                <button class="btn btn-secondary" onclick="resetFilters()">Reset</button>
                <button class="btn btn-export" onclick="exportToCSV()">📥 Export to CSV</button>
            </div>
        </div>

        <!-- Orders Table -->
        <div id="ordersContainer">
            <div class="loading">Loading orders...</div>
        </div>
    </div>

    <script>
        const API_BASE = 'https://bebrand-eoo2.onrender.com';
        let currentPage = 1;
        let currentStatus = '';
        let adminToken = localStorage.getItem('adminToken'); // Store token after login

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // Check if admin is logged in
            if (!adminToken) {
                alert('Please login as admin first');
                window.location.href = '/login.html';
                return;
            }

            loadOrders();
            setupStatusTabs();
        });

        // Setup status tab clicks
        function setupStatusTabs() {
            document.querySelectorAll('.status-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    currentStatus = tab.dataset.status;
                    currentPage = 1;
                    loadOrders();
                });
            });
        }

        // Load orders with filters
        async function loadOrders() {
            const startDate = document.getElementById('startDate')?.value;
            const endDate = document.getElementById('endDate')?.value;
            const search = document.getElementById('search')?.value;
            const limit = document.getElementById('limit')?.value || 10;

            // Build query parameters
            const params = new URLSearchParams({
                page: currentPage,
                limit: limit
            });

            if (currentStatus) params.append('status', currentStatus);
            if (startDate) params.append('startDate', new Date(startDate).toISOString());
            if (endDate) params.append('endDate', new Date(endDate).toISOString());
            if (search) params.append('search', search);

            try {
                const response = await fetch(`${API_BASE}/admin/orders?${params}`, {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        alert('Session expired. Please login again.');
                        window.location.href = '/login.html';
                        return;
                    }
                    throw new Error('Failed to load orders');
                }

                const data = await response.json();
                displayOrders(data.orders, data.pagination);
            } catch (error) {
                console.error('Error loading orders:', error);
                document.getElementById('ordersContainer').innerHTML = `
                    <div class="empty-state">
                        <h3>❌ Error Loading Orders</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }

        // Display orders in table
        function displayOrders(orders, pagination) {
            if (!orders || orders.length === 0) {
                document.getElementById('ordersContainer').innerHTML = `
                    <div class="empty-state">
                        <h3>📭 No Orders Found</h3>
                        <p>No orders match your current filters</p>
                    </div>
                `;
                return;
            }

            const html = `
                <div class="orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.map(order => `
                                <tr>
                                    <td><strong>${order._id.substring(0, 8)}...</strong></td>
                                    <td>${getCustomerName(order)}</td>
                                    <td>${getCustomerEmail(order)}</td>
                                    <td><strong>₦${order.totalAmount.toFixed(2)}</strong></td>
                                    <td><span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></td>
                                    <td>${order.paymentStatus || 'pending'}</td>
                                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button class="btn btn-primary" style="padding: 5px 10px; font-size: 12px;" onclick="viewOrder('${order._id}')">View</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="pagination">
                    <button onclick="changePage(${pagination.page - 1})" ${pagination.page === 1 ? 'disabled' : ''}>Previous</button>
                    <span>Page ${pagination.page} of ${pagination.pages} (${pagination.total} total orders)</span>
                    <button onclick="changePage(${pagination.page + 1})" ${pagination.page === pagination.pages ? 'disabled' : ''}>Next</button>
                </div>
            `;

            document.getElementById('ordersContainer').innerHTML = html;
        }

        // Helper functions
        function getCustomerName(order) {
            if (order.guestInfo) {
                return `${order.guestInfo.firstName || ''} ${order.guestInfo.lastName || ''}`.trim() || 'Guest';
            }
            return order.customerFirstName && order.customerLastName 
                ? `${order.customerFirstName} ${order.customerLastName}`
                : 'Guest';
        }

        function getCustomerEmail(order) {
            return order.guestInfo?.email || order.customerEmail || 'N/A';
        }

        function changePage(page) {
            currentPage = page;
            loadOrders();
        }

        function applyFilters() {
            currentPage = 1;
            loadOrders();
        }

        function resetFilters() {
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
            document.getElementById('search').value = '';
            document.getElementById('limit').value = '10';
            currentStatus = '';
            currentPage = 1;
            
            document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
            document.querySelector('.status-tab[data-status=""]').classList.add('active');
            
            loadOrders();
        }

        // Export to CSV
        async function exportToCSV() {
            const startDate = document.getElementById('startDate')?.value;
            const endDate = document.getElementById('endDate')?.value;

            const params = new URLSearchParams();
            if (currentStatus) params.append('status', currentStatus);
            if (startDate) params.append('startDate', new Date(startDate).toISOString());
            if (endDate) params.append('endDate', new Date(endDate).toISOString());

            try {
                const response = await fetch(`${API_BASE}/admin/orders/export/csv?${params}`, {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });

                if (!response.ok) throw new Error('Export failed');

                const result = await response.json();

                // Create and download CSV file
                const blob = new Blob([result.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = result.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                alert('✅ Orders exported successfully!');
            } catch (error) {
                console.error('Export error:', error);
                alert('❌ Failed to export orders');
            }
        }

        // View order details
        function viewOrder(orderId) {
            window.location.href = `/admin/order-details.html?id=${orderId}`;
        }
    </script>
</body>
</html>
```

---

### 2. Newsletter Subscription Component

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Newsletter - BeBrand</title>
    <style>
        .newsletter-section {
            background: #8B6F47;
            padding: 60px 20px;
            text-align: center;
            color: white;
        }
        
        .newsletter-section h2 {
            font-size: 32px;
            margin-bottom: 10px;
        }
        
        .newsletter-section p {
            font-size: 16px;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        
        .newsletter-form {
            max-width: 500px;
            margin: 0 auto;
            display: flex;
            gap: 10px;
        }
        
        .newsletter-input {
            flex: 1;
            padding: 15px 20px;
            border: none;
            border-radius: 4px;
            font-size: 16px;
        }
        
        .newsletter-button {
            padding: 15px 30px;
            background: #000000;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .newsletter-button:hover {
            background: #333;
        }
        
        .newsletter-button:disabled {
            background: #666;
            cursor: not-allowed;
        }
        
        .message {
            margin-top: 15px;
            padding: 10px;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .message.success {
            background: #D4EDDA;
            color: #155724;
        }
        
        .message.error {
            background: #F8D7DA;
            color: #721C24;
        }
    </style>
</head>
<body>
    <!-- Newsletter Section -->
    <section class="newsletter-section">
        <h2>📧 Subscribe to Our Newsletter</h2>
        <p>Get the latest updates on new products, exclusive offers, and style tips delivered to your inbox</p>
        
        <form id="newsletterForm" class="newsletter-form">
            <input 
                type="email" 
                id="emailInput" 
                class="newsletter-input" 
                placeholder="Enter your email address" 
                required
            >
            <button type="submit" class="newsletter-button" id="subscribeBtn">
                Subscribe
            </button>
        </form>
        
        <div id="message"></div>
    </section>

    <script>
        const API_BASE = 'https://bebrand-eoo2.onrender.com';

        document.getElementById('newsletterForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('emailInput');
            const subscribeBtn = document.getElementById('subscribeBtn');
            const messageDiv = document.getElementById('message');
            const email = emailInput.value.trim();
            
            // Disable button during submission
            subscribeBtn.disabled = true;
            subscribeBtn.textContent = 'Subscribing...';
            messageDiv.innerHTML = '';
            
            try {
                const response = await fetch(`${API_BASE}/newsletter/subscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    messageDiv.innerHTML = `<div class="message success">✅ ${result.message}</div>`;
                    emailInput.value = '';
                } else if (response.status === 409) {
                    messageDiv.innerHTML = `<div class="message error">⚠️ This email is already subscribed</div>`;
                } else {
                    messageDiv.innerHTML = `<div class="message error">❌ ${result.message || 'Subscription failed'}</div>`;
                }
            } catch (error) {
                console.error('Newsletter error:', error);
                messageDiv.innerHTML = `<div class="message error">❌ Network error. Please try again.</div>`;
            } finally {
                subscribeBtn.disabled = false;
                subscribeBtn.textContent = 'Subscribe';
            }
        });
    </script>
</body>
</html>
```

---

### 3. Product Listing with Stock Status

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products - BeBrand</title>
    <style>
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 25px;
            padding: 20px;
        }
        
        .product-card {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        
        .product-card:hover {
            transform: translateY(-5px);
        }
        
        .product-image {
            width: 100%;
            height: 300px;
            object-fit: cover;
            background: #f5f5f5;
        }
        
        .product-info {
            padding: 20px;
        }
        
        .product-name {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .product-brand {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        
        .product-price {
            font-size: 22px;
            font-weight: 700;
            color: #8B6F47;
            margin-bottom: 10px;
        }
        
        .stock-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .stock-in-stock {
            background: #D4EDDA;
            color: #155724;
        }
        
        .stock-low-stock {
            background: #FFF3CD;
            color: #856404;
        }
        
        .stock-out-of-stock {
            background: #F8D7DA;
            color: #721C24;
        }
        
        .add-to-cart-btn {
            width: 100%;
            padding: 12px;
            background: #8B6F47;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .add-to-cart-btn:hover:not(:disabled) {
            background: #6d5738;
        }
        
        .add-to-cart-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
    </style>
</head>
<body>
    <div class="products-grid" id="productsGrid">
        <p style="text-align: center; padding: 40px;">Loading products...</p>
    </div>

    <script>
        const API_BASE = 'https://bebrand-eoo2.onrender.com';

        async function loadProducts() {
            try {
                const response = await fetch(`${API_BASE}/products`);
                const products = await response.json();
                displayProducts(products);
            } catch (error) {
                console.error('Error loading products:', error);
                document.getElementById('productsGrid').innerHTML = 
                    '<p style="text-align: center; color: red;">Error loading products</p>';
            }
        }

        function displayProducts(products) {
            const grid = document.getElementById('productsGrid');
            
            if (!products || products.length === 0) {
                grid.innerHTML = '<p style="text-align: center;">No products available</p>';
                return;
            }
            
            grid.innerHTML = products.map(product => {
                const stockStatus = getStockStatus(product.stock);
                const stockClass = stockStatus.replace(/_/g, '-');
                const isOutOfStock = product.stock === 0;
                
                return `
                    <div class="product-card">
                        <img 
                            src="${product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'}" 
                            alt="${product.name}" 
                            class="product-image"
                        >
                        <div class="product-info">
                            <div class="product-name">${product.name}</div>
                            <div class="product-brand">${product.brand}</div>
                            <div class="product-price">₦${product.price.toFixed(2)}</div>
                            <div class="stock-badge stock-${stockClass}">
                                ${getStockLabel(stockStatus, product.stock)}
                            </div>
                            <button 
                                class="add-to-cart-btn" 
                                onclick="addToCart('${product._id}')"
                                ${isOutOfStock ? 'disabled' : ''}
                            >
                                ${isOutOfStock ? '❌ Out of Stock' : '🛒 Add to Cart'}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function getStockStatus(stock) {
            if (stock === 0) return 'out_of_stock';
            if (stock <= 10) return 'low_stock';
            return 'in_stock';
        }

        function getStockLabel(status, stock) {
            if (status === 'out_of_stock') return '❌ Out of Stock';
            if (status === 'low_stock') return `⚠️ Low Stock (${stock} left)`;
            return `✅ In Stock (${stock} available)`;
        }

        function addToCart(productId) {
            // Get existing cart from localStorage
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            // Check if product already in cart
            const existingItem = cart.find(item => item.productId === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ productId, quantity: 1 });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            alert('✅ Product added to cart!');
        }

        // Load products on page load
        document.addEventListener('DOMContentLoaded', loadProducts);
    </script>
</body>
</html>
```

---

### 4. Admin Dashboard with Analytics

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - BeBrand</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #F5E6D3;
            color: #000;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: #8B6F47;
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .stat-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        
        .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #8B6F47;
            margin-bottom: 5px;
        }
        
        .stat-change {
            font-size: 13px;
            color: #28A745;
        }
        
        .chart-container {
            background: white;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .chart-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Admin Dashboard</h1>
            <p>Welcome back! Here's what's happening with your store today.</p>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid" id="statsGrid">
            <div class="stat-card">
                <div class="stat-label">Total Revenue</div>
                <div class="stat-value" id="totalRevenue">₦0.00</div>
                <div class="stat-change">+8.7% from last month</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">Total Orders</div>
                <div class="stat-value" id="totalOrders">0</div>
                <div class="stat-change">+41.6% from last month</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">New Customers</div>
                <div class="stat-value" id="totalUsers">0</div>
                <div class="stat-change">+12.5% from last month</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">Products in Stock</div>
                <div class="stat-value" id="productsInStock">0</div>
                <div class="stat-change">Across all categories</div>
            </div>
        </div>

        <!-- Revenue Chart -->
        <div class="chart-container">
            <div class="chart-title">📈 Revenue Overview (Last 30 Days)</div>
            <canvas id="revenueChart"></canvas>
        </div>

        <!-- Order Status Chart -->
        <div class="chart-container">
            <div class="chart-title">📦 Order Status Distribution</div>
            <canvas id="orderStatusChart"></canvas>
        </div>
    </div>

    <script>
        const API_BASE = 'https://bebrand-eoo2.onrender.com';
        const adminToken = localStorage.getItem('adminToken');

        let revenueChart, orderStatusChart;

        async function loadDashboard() {
            if (!adminToken) {
                alert('Please login first');
                window.location.href = '/login.html';
                return;
            }

            try {
                // Load dashboard stats
                const dashResponse = await fetch(`${API_BASE}/admin/dashboard`, {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });
                const dashData = await dashResponse.json();

                // Update stat cards
                document.getElementById('totalRevenue').textContent = 
                    `₦${dashData.stats.totalRevenue.toFixed(2).toLocaleString()}`;
                document.getElementById('totalOrders').textContent = 
                    dashData.stats.totalOrders.toLocaleString();
                document.getElementById('totalUsers').textContent = 
                    dashData.stats.totalUsers.toLocaleString();

                // Load revenue analytics
                const revenueResponse = await fetch(`${API_BASE}/admin/analytics/revenue`, {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });
                const revenueData = await revenueResponse.json();

                // Create revenue chart
                createRevenueChart(revenueData.dailyRevenue);

                // Load order analytics
                const orderResponse = await fetch(`${API_BASE}/admin/analytics/orders`, {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });
                const orderData = await orderResponse.json();

                // Create order status chart
                createOrderStatusChart(orderData.ordersByStatus);

            } catch (error) {
                console.error('Dashboard error:', error);
                alert('Error loading dashboard');
            }
        }

        function createRevenueChart(dailyRevenue) {
            const ctx = document.getElementById('revenueChart');
            
            if (revenueChart) revenueChart.destroy();
            
            revenueChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dailyRevenue.map(d => new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                    datasets: [{
                        label: 'Daily Revenue (₦)',
                        data: dailyRevenue.map(d => d.revenue),
                        borderColor: '#8B6F47',
                        backgroundColor: 'rgba(139, 111, 71, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: value => `₦${value.toLocaleString()}`
                            }
                        }
                    }
                }
            });
        }

        function createOrderStatusChart(ordersByStatus) {
            const ctx = document.getElementById('orderStatusChart');
            
            if (orderStatusChart) orderStatusChart.destroy();
            
            const colors = {
                pending: '#FFB84D',
                processing: '#4DABF5',
                shipped: '#9B59B6',
                delivered: '#2ECC71',
                cancelled: '#E74C3C'
            };
            
            orderStatusChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ordersByStatus.map(s => s._id.toUpperCase()),
                    datasets: [{
                        data: ordersByStatus.map(s => s.count),
                        backgroundColor: ordersByStatus.map(s => colors[s._id] || '#999')
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }

        document.addEventListener('DOMContentLoaded', loadDashboard);
    </script>
</body>
</html>
```

---

## 🔑 Authentication Flow

### Admin Login Example

```javascript
async function loginAdmin(email, password) {
    try {
        const response = await fetch('https://bebrand-eoo2.onrender.com/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok) {
            // Store token in localStorage
            localStorage.setItem('adminToken', result.access_token);
            
            // Store user info
            localStorage.setItem('userRole', result.user.role);
            localStorage.setItem('userEmail', result.user.email);
            
            // Redirect to admin dashboard
            window.location.href = '/admin/dashboard.html';
        } else {
            alert('Login failed: ' + result.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Network error. Please try again.');
    }
}

// Admin credentials:
// Email: admin@bebrand.com
// Password: Admin123!
```

---

## 📊 Summary of Features

### ✅ Completed Features

1. **Advanced Order Filtering**
   - Status-based filtering (5 statuses)
   - Date range filtering
   - Email/Order ID search
   - Pagination with customizable limit

2. **CSV Export**
   - Download filtered orders as CSV
   - Includes all order details
   - Auto-generated filename with date

3. **Stock Status System**
   - Automatic calculation (In Stock/Low Stock/Out of Stock)
   - Real-time display on products
   - Low stock threshold at 10 items

4. **Newsletter System**
   - Public subscription endpoint
   - Unsubscribe functionality
   - Admin view of subscribers
   - Duplicate prevention

5. **Analytics Endpoints**
   - Revenue overview (30-day history)
   - Order status distribution
   - Average order value
   - Growth metrics

---

## 🎨 Design System

### Colors
- **Primary**: `#8B6F47` (Brown)
- **Background**: `#F5E6D3` (Cream)
- **Text**: `#000000` (Black)
- **Success**: `#2ECC71`
- **Warning**: `#FFB84D`
- **Error**: `#E74C3C`

### Typography
- **Font**: Inter, -apple-system, BlinkMacSystemFont, Segoe UI
- **Headings**: 600-700 weight
- **Body**: 400-500 weight

---

## 🔐 API Authentication

All admin endpoints require JWT token in Authorization header:

```javascript
headers: {
    'Authorization': `Bearer ${adminToken}`
}
```

Public endpoints (no auth required):
- `POST /newsletter/subscribe`
- `DELETE /newsletter/unsubscribe`
- `GET /products`
- `POST /orders/guest`

---

## 📱 Responsive Design Tips

```css
/* Mobile First Approach */
@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .filter-row {
        grid-template-columns: 1fr;
    }
    
    .newsletter-form {
        flex-direction: column;
    }
}
```

---

## 🚀 Deployment

### Frontend Hosting Options
1. **Vercel** (Recommended for static sites)
2. **Netlify** (Free tier available)
3. **GitHub Pages** (Free)

### Environment Variables for Frontend
```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bebrand-eoo2.onrender.com';
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_...';
```

---

## 📞 Support

- **Backend API**: https://bebrand-eoo2.onrender.com
- **API Docs**: https://bebrand-eoo2.onrender.com/api/docs
- **Email**: ogunseitangold105@gmail.com
- **GitHub**: github.com/Goldexcool/bebrand

---

## ✨ Next Steps

1. Implement the HTML templates in your frontend framework (React, Vue, etc.)
2. Add error boundaries and loading states
3. Implement cart functionality
4. Add checkout flow with Paystack integration
5. Create admin product management interface
6. Add image upload for products
7. Implement order tracking page
8. Add user profile page

**All backend features are ready to use! Just integrate with these frontend examples.** 🎉
