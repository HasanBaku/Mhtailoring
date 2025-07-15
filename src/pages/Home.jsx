import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <>
      <div className="hero-section d-flex align-items-center justify-content-center text-center">
        <div className="text-white">
          <h1 className="hero-title display-3 fw-bold">Tailoring Made Personal</h1>
          <p className="lead">Discover timeless elegance tailored to you.</p>
          <Link to="/login" className="btn btn-outline-light mt-3 px-4 py-2">Vendor Login</Link>
        </div>
      </div>

      <div className="container py-5">
        <div className="row text-center">
          <div className="col-md-4">
            <h3>Custom Suits</h3>
            <p>Luxury menswear tailored to perfection.</p>
          </div>
          <div className="col-md-4">
            <h3>Wedding Dresses</h3>
            <p>Graceful gowns designed for your special day.</p>
          </div>
          <div className="col-md-4">
            <h3>Corporate Uniforms</h3>
            <p>Professional styles for hospitality, service, and business.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
