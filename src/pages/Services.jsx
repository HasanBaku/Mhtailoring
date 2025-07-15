import React from 'react';
import './CommonSection.css';

function Services() {
  return (
    <section className="section-wrapper">
      <h2 className="section-title">Our Tailoring Services</h2>
      <div className="card-grid">
        <div className="service-card">
          <h4>Men’s Suits</h4>
          <p>Tailored elegance with modern cuts and fine fabrics.</p>
        </div>
        <div className="service-card">
          <h4>Women’s Dresses</h4>
          <p>Handcrafted gowns and dresses for every body and occasion.</p>
        </div>
        <div className="service-card">
          <h4>Uniforms</h4>
          <p>Corporate, hospitality, and performance wear with style.</p>
        </div>
      </div>
    </section>
  );
}

export default Services;
