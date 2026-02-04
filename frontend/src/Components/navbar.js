import React from 'react'

function Navbar() {
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
            <li className="nav-item">
              <a className="nav-link text-white mx-4" href="/login">Login</a>
            </li>
          </ul>
        </div>
      </nav>
    </>
  )
}

export default Navbar
