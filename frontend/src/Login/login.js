import Navbar from "../Components/navbar";
import Footer from "../Components/footer";
import './login.css';
function Login() {
    return (
    <>
        <Navbar />
        <div className="container login-container d-flex align-items-center">
        <div className="row w-100 g-4">

        {/* Login */}
        <div className="col-md-12 d-flex justify-content-center">
          <div className="login-card">
            <h3 className="login-title">Login</h3>
          <form>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Name"
              required
            />

            <input
              type="email"
              className="form-control mb-3"
              placeholder="Email"
              required
            />

            <button className="btn btn-dark w-100">
              Login
            </button>
          </form>
          </div>
        </div>

          </div>
          </div>
            <Footer />
    </>
        )
    }
export default Login;
