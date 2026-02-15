import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/navbar";
import Footer from "../Components/footer";
import "./login.css";

function Login() {
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [regName, setRegName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const navigate = useNavigate();

  // ===== LOGIN HANDLER (UNCHANGED) =====
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

  // ===== REGISTER HANDLER =====
  const handleRegister = async e => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:8000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: regName,
        age: Number(age),
        gender,
      }),
    });

    if (!res.ok) {
      alert("Registration failed");
      return;
    }

    const data = await res.json();

    localStorage.setItem("userName", data.User_name);
    localStorage.setItem("userEmail", data.User_email);
    localStorage.setItem("userRole", "user");

    //  required alert
    alert(
      `Registration Successful\n\nName: ${data.User_name}\nEmail: ${data.User_email}`
    );

    //  redirect to user dashboard
    navigate("/user");

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

              <h3 className="login-title">
                {isRegister ? "Register User" : "Login"}
              </h3>

              {/* LOGIN FORM */}
              {!isRegister && (
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
              )}

              {/* REGISTER FORM */}
              {isRegister && (
                <form onSubmit={handleRegister}>

                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Name"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    required
                  />

                  <input
                    type="number"
                    className="form-control mb-3"
                    placeholder="Age"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    required
                  />

                  <select
                    className="form-control mb-3"
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>

                  <button type="submit" className="btn btn-dark w-100">
                    Register
                  </button>
                </form>
              )}

              {/* TOGGLE BUTTON */}
              <button
                className="btn btn-outline-primary w-100 mt-3"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister
                  ? "Already a user? Login"
                  : "New user? Register"}
              </button>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Login;
