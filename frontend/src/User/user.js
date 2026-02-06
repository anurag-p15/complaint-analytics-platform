import { useState } from "react";
import Navbar from "../Components/navbar";
import Footer from "../Components/footer";
import "./user.css";

import RegisterComplaint from "../Components/RegisterComplaint";
import PastComplaints from "../Components/PastComplaints";

function User() {

  const [activeView, setActiveView] = useState("register");

  return (
    <>
      <Navbar />

      <div className="row" style={{ margin: "20px" }}>

        <div className="col-md-6">
          <div className="user-button">
            <button
              className={`btn w-100 ${
                activeView === "register"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setActiveView("register")}
            >
              Register New Complaint
            </button>
          </div>
        </div>

        <div className="col-md-6">
          <div className="user-button">
            <button
              className={`btn w-100 ${
                activeView === "history"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setActiveView("history")}
            >
              View Past Complaints
            </button>
          </div>
        </div>

      </div>

      {/* CONTENT AREA */}
      <div className="container-fluid px-5 my-4">
        {activeView === "register" && <RegisterComplaint />}
        {activeView === "history" && <PastComplaints />}
      </div>

      <Footer />
    </>
  );
}

export default User;
