import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaPills, FaBell, FaUser } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <NavLink
        to="/"
        className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
      >
        <FaHome size={24} />
        <span className="nav-text">خانه</span>
      </NavLink>

      <NavLink
        to="/medications"
        className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
      >
        <FaPills size={24} />
        <span className="nav-text">داروها</span>
      </NavLink>

      <NavLink
        to="/reminders"
        className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
      >
        <FaBell size={24} />
        <span className="nav-text">یادآوری‌ها</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
      >
        <FaUser size={24} />
        <span className="nav-text">پروفایل</span>
      </NavLink>
    </nav>
  );
};

export default Navbar;
