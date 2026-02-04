import Navbar from "../Components/navbar";
import Footer from "../Components/footer";
import './login.css';
function Login() {
    return (
    <>
        <Navbar />
        <div className="container login-container d-flex align-items-center">
        <div className="row w-100 g-4">

        {/* User Login */}
        <div className="col-md-6">
          <div className="login-card">
            <h3 className="login-title">User Login</h3>

            <input
              type="email"
              className="form-control mb-3"
              placeholder="Email"
            />

            <input
              type="name"
              className="form-control mb-3"
              placeholder="Name"
            />

            <button className="btn btn-primary w-100">
              Login as User
            </button>
          </div>
        </div>

        {/* Admin Login */}
        <div className="col-md-6">
          <div className="login-card admin">
            <h3 className="login-title">Admin Login</h3>

            <input
              type="email"
              className="form-control mb-3"
              placeholder="Admin Email"
            />

            <input
              type="password"
              className="form-control mb-3"
              placeholder="Password"
            />

            <button className="btn btn-dark w-100">
              Login as Admin
            </button>
          </div>
        </div>

          </div>
          </div>
            <Footer />
    </>
        )
    }
export default Login;
