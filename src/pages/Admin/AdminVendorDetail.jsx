import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function AdminVendorDetail() {
  const { email } = useParams();
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    const vendors = JSON.parse(localStorage.getItem('vendors')) || [];
    const found = vendors.find(v => v.email === decodeURIComponent(email));
    setVendor(found);
  }, [email]);

  if (!vendor) return <p>Loading...</p>;

  return (
    <div>
      <h2>Vendor Details</h2>
      <p><strong>Company:</strong> {vendor.companyName}</p>
      <p><strong>Contact:</strong> {vendor.contactName}</p>
      <p><strong>Email:</strong> {vendor.email}</p>
      <p><strong>Phone:</strong> {vendor.phone}</p>
      <p><strong>Address:</strong> {vendor.address}</p>
      <p><strong>Industry:</strong> {vendor.industry}</p>
      <p><strong>Registered:</strong> {vendor.registeredAt}</p>
    </div>
  );
}

export default AdminVendorDetail;
