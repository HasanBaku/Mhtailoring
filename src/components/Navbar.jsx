import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
  <div className="container-fluid px-4">
    <Link className="navbar-brand fw-bold" to="/">TailorPro</Link>
    <ul className="navbar-nav ms-auto"><li className="nav-item"><Link className="nav-link" to="/services">Services</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/portfolio">Portfolio</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/contact">Contact</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/login">Vendor Login</Link></li>
        </ul>
      </div>
    </nav>
  );
}
export default Navbar;