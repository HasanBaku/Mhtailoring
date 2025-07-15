import React, { useEffect, useState } from 'react';
import api from '../../api/axios'; // make sure this is the custom axios instance

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('authToken');
  const [loading, setLoading] = useState(true);


  // Fetch user profile
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setProfile(res.data);
      setFormData(res.data);
      setLoading(false);
      console.log("✅ Profile loaded:", res.data);
      console.log("✅ Profile loaded:", JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.error("❌ Failed to load profile:", err.response?.data || err.message);
      setError("Failed to load profile");
      setLoading(false);
    }
  };

  fetchProfile();
}, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

const handleSave = async () => {
  try {
    console.log("📤 Sending update:", formData);
    const res = await api.put('/users/me', formData);

    const updated = res.data || formData;
    console.log("✅ Update response:", updated);

    setProfile(updated);
    setEditing(false);
  } catch (err) {
    console.error("❌ Failed to update profile:", err.response?.data || err.message);
    setError("Failed to update profile");
  }
};


  if (error) return <div className="container mt-5 text-danger">{error}</div>;
  if (!profile) return <div className="container mt-5">Loading profile...</div>;

  const fields = [
    { label: 'Company Name', name: 'company_name' },
    { label: 'Contact Name', name: 'contact_name' },
    { label: 'Phone', name: 'phone' },
    { label: 'Address', name: 'address' },
    { label: 'Industry', name: 'industry' },
    { label: 'Website URL', name: 'website_url' },
    { label: 'Description', name: 'company_description' }
  ];

  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4">
        <h3 className="mb-4">Company Profile</h3>

        {fields.map(field => (
          <div className="mb-3 row" key={field.name}>
            <label className="col-sm-4 col-form-label fw-semibold">{field.label}</label>
            <div className="col-sm-8">
              <input
                type="text"
                className="form-control"
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>
          </div>
        ))}

        <div className="text-end mt-4">
          {editing ? (
            <button className="btn btn-success" onClick={handleSave}>Save Changes</button>
          ) : (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
