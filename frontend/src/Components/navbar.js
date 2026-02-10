import React from 'react'
import { useEffect, useState } from "react";


function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
const [role, setRole] = useState(null);

useEffect(() => {
  const user = localStorage.getItem("userRole");

  if (user) {
    setIsLoggedIn(true);
    setRole(user);
  }
}, []);
  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-dark shadow py-0"
        style={{ backgroundColor: '#000000' }}
      >
        <a className="navbar-brand d-flex align-items-center py-0" href="/">
          <img
            src="https://i.postimg.cc/JHJ6bLJZ/your-image-name.png"
            alt="Navbar Logo"
            height="80"
            className="me-2"
          />
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto fs-5 align-items-center">
            <li className="nav-item">
              <a className="nav-link text-white mx-4" href="/">Home</a>
            </li>
            {isLoggedIn ? (
  <>
    <li className="nav-item">
      <a
        className="nav-link text-white mx-3"
        href={role === "admin" ? "/admin" : "/user"}
      >
        Dashboard
      </a>
    </li>

    <li className="nav-item">
      <button
        className="btn btn-link nav-link text-white mx-3"
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
      >
        Logout
      </button>
    </li>
  </>
) : (
  <li className="nav-item">
    <a className="nav-link text-white mx-4" href="/login">Login</a>
  </li>
)}
          </ul>
        </div>
      </nav>
    </>
  )
}

export default Navbar
