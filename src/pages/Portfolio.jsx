import React from 'react';
import './CommonSection.css';
import img1 from '../assets/tailor3-gallery-pic1.jpg'; // replace with your real images
import img2 from '../assets/tailor3-gallery-pic5.jpg';
import img3 from '../assets/tailor3-gallery-pic6.jpg';

function Portfolio() {
  return (
    <section className="section-wrapper">
      <h2 className="section-title">Tailoring Portfolio</h2>
      <div className="portfolio-grid">
        <img src={img1} alt="Design 1" className="portfolio-img" />
        <img src={img2} alt="Design 2" className="portfolio-img" />
        <img src={img3} alt="Design 3" className="portfolio-img" />
      </div>
    </section>
  );
}

export default Portfolio;
