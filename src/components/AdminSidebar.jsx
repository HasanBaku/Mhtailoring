// src/components/AdminSidebar.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminSidebar.css';

function AdminSidebar() {
const { pathname } = useLocation();

const navItems = [
{ label: 'Dashboard', path: '/admin/dashboard' },
{ label: 'Orders', path: '/admin/orders' },
{ label: 'Invoices', path: '/admin/invoices' },
{ label: 'Vendors', path: '/admin/vendors' },
{ label: 'Settings', path: '/admin/settings' },
];

return (
<aside className="admin-sidebar">
<h3 className="admin-logo">Admin Panel</h3>
<nav>
<ul>
{navItems.map(item => (
<li key={item.path} className={pathname === item.path ? 'active' : ''}>
<Link to={item.path}>{item.label}</Link>
</li>
))}
</ul>
</nav>
</aside>
);
}

export default AdminSidebar;