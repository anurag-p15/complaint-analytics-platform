import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/navbar";
import Footer from "../Components/footer";
import RegisterComplaint from "../User/RegisterComplaint";
import "./login.css";

function Login() {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  // ===== SUBMIT HANDLER =====
  const handleLogin = async e => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });

      if (!res.ok) {
        alert("Invalid credentials");
        return;
      }
       const data = await res.json();

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", data.role);

    if (data.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/user";
    }
    
    } catch (err) {
      alert("Backend not reachable");
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container login-container d-flex align-items-center">
        <div className="row w-100 g-4 justify-content-center">
          <div className="col-md-6 d-flex justify-content-center">
            <div className="login-card w-100">
              <h3 className="login-title">Login</h3>

              <form onSubmit={handleLogin}>

                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />

                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />

                <button type="submit" className="btn btn-dark w-100">
                  Login
                </button>

              </form>
              {/* NEW USER BUTTON */}
              <button
                className="btn btn-outline-primary w-100 mt-3"
                onClick={() => setShowModal(true)}
              >
                New User? Register Complaint
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Register Complaint</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <RegisterComplaint showUserFields />
                </div>
              </div>
            </div>
          </div>

          {/* BACKDROP */}
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowModal(false)}
          />
        </>
      )}

      <Footer />
    </>
  );
}

export default Login;
