import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import './AdminVendors.css';

function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [newVendor, setNewVendor] = useState({
    email: '',
    password: '',
    company_name: '',
    contact_name: '',
    phone: '',
    address: '',
    industry: ''
  });
  const [passwordUpdates, setPasswordUpdates] = useState({}); // key = vendor.id

  const fetchVendors = async () => {
  try {
    const res = await api.get('/users/vendors');
    if (Array.isArray(res.data)) {
      setVendors(res.data);
    } else {
      console.error("❌ Expected array, got:", res.data);
      setVendors([]); // fallback to empty
    }
  } catch (err) {
    console.error('Error: Failed to fetch vendors', err);
    setVendors([]); // fallback to avoid crash
  }
};


  useEffect(() => {
    fetchVendors();
  }, []);

  const handleInputChange = (e) => {
    setNewVendor({ ...newVendor, [e.target.name]: e.target.value });
  };

  const addVendor = async () => {
    try {
      const res = await api.post('/users/vendors', newVendor);
      setVendors([res.data, ...vendors]);
      setNewVendor({
        email: '',
        password: '',
        company_name: '',
        contact_name: '',
        phone: '',
        address: '',
        industry: ''
      });
    } catch (err) {
      console.error('Error creating vendor:', err);
    }
  };

  const deleteVendor = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/users/vendors/${id}`);
      setVendors(vendors.filter(v => v.id !== id));
    } catch (err) {
      console.error('Failed to delete vendor');
    }
  };

  const handlePasswordChange = (id, value) => {
    setPasswordUpdates({ ...passwordUpdates, [id]: value });
  };

  const updateVendorPassword = async (id) => {
    try {
      await api.put(`/users/vendors/${id}/password`, { newPassword: passwordUpdates[id]
      });
      alert("Password updated");
      setPasswordUpdates({ ...passwordUpdates, [id]: '' });
    } catch (err) {
      console.error("Failed to update password");
    }
  };

  return (
    <div className="container py-4">
      <h2>Vendors</h2>

      {/* Add Vendor Form */}
      <div className="card p-3 mb-4">
        <h5>Add Vendor</h5>
        <div className="row g-2">
          <input className="form-control" placeholder="Email" name="email" value={newVendor.email} onChange={handleInputChange} />
          <input className="form-control" placeholder="Password" name="password" value={newVendor.password} onChange={handleInputChange} />
          <input className="form-control" placeholder="Company Name" name="company_name" value={newVendor.company_name} onChange={handleInputChange} />
          <input className="form-control" placeholder="Contact Name" name="contact_name" value={newVendor.contact_name} onChange={handleInputChange} />
          <input className="form-control" placeholder="Phone" name="phone" value={newVendor.phone} onChange={handleInputChange} />
          <input className="form-control" placeholder="Address" name="address" value={newVendor.address} onChange={handleInputChange} />
          <input className="form-control" placeholder="Industry" name="industry" value={newVendor.industry} onChange={handleInputChange} />
          <button className="btn btn-primary mt-2" onClick={addVendor}>Add Vendor</button>
        </div>
      </div>

      {/* Vendor Table */}
      <div className="table-responsive">
        <table className="table table-bordered bg-white shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Company</th>
              <th>Contact</th>
              <th>Phone</th>
              <th>Industry</th>
              <th>Registered At</th>
              <th>Password</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>{vendor.id}</td>
                <td>{vendor.email}</td>
                <td>{vendor.company_name}</td>
                <td>{vendor.contact_name}</td>
                <td>{vendor.phone}</td>
                <td>{vendor.industry}</td>
                <td>{new Date(vendor.registered_at).toLocaleDateString()}</td>
                <td>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    placeholder="New Password"
                    value={passwordUpdates[vendor.id] || ''}
                    onChange={(e) => handlePasswordChange(vendor.id, e.target.value)}
                  />
                  <button
                    className="btn btn-sm btn-warning mt-1"
                    onClick={() => updateVendorPassword(vendor.id)}
                    disabled={!passwordUpdates[vendor.id]}
                  >
                    Update
                  </button>
                </td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteVendor(vendor.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminVendors;
