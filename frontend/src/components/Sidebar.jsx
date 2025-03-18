import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaCopy, FaGlobe, FaChartLine, FaFileAlt } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
    return (
        <aside className={`sidebar ${isOpen ? 'expanded' : 'collapsed'}`}>
            <NavLink to="/" className="nav-item">
                <FaTachometerAlt /> {isOpen && 'Dashboard'}
            </NavLink>
            <NavLink to="/cloning-detection" className="nav-item">
                <FaCopy /> {isOpen && 'Cloning Detection'}
            </NavLink>
            <NavLink to="/phishing-analyzer" className="nav-item">
                <FaGlobe /> {isOpen && 'Phishing Analyzer'}
            </NavLink>
            {/* <NavLink to="/ssl-mismatch-checker" className="nav-item">
                <FaChartLine /> {isOpen && 'SSL Mismatch Checker'}
            </NavLink> */}
            <NavLink to="/report-page" className="nav-item">
                <FaFileAlt /> {isOpen && 'Report Page'}
            </NavLink>
        </aside>
    );
};

export default Sidebar;
