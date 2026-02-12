import { useState, useMemo, useEffect } from "react";
import Navbar from "../Components/navbar";
import Footer from "../Components/footer";

/* ===== PRODUCT OPTIONS ===== */
const productOptions = [
  "Debt Collection",
  "Checking or Savings Account",
  "Credit Card",
  "Credit reporting or other personal consumer reports",
  "Debt or credit management",
  "Money transfer, virtual currency, or money service",
  "Mortgage",
  "Prepaid Card",
  "Student loan",
  "Vehicle loan or lease",
  "Payday loan, title loan, personal loan, or advance loan",
];

function Admin() {
  const role = localStorage.getItem("userRole");
  if (role !== "admin") {
    window.location.href = "/login";
  }

  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("Pending");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedEscalation, setSelectedEscalation] = useState("");
  const [selectedComplaintText, setSelectedComplaintText] = useState("");

  /* ===== PAGINATION ===== */
  const [currentPage, setCurrentPage] = useState(1);
  const complaintsPerPage = 25;

  const [selectedFeedbackText, setSelectedFeedbackText] = useState("");

  /* ===== FETCH DATA ===== */
 const fetchComplaints = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/admin-complaints");
    const data = await res.json();
    setComplaints(data);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchComplaints();
}, []);

  /* Reset page when filters change */
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedProduct, selectedEscalation]);

  /* ===== FILTER LOGIC ===== */
  const filteredData = useMemo(() => {
    return complaints.filter(c =>
      (activeTab === "Pending"
        ? c["Resolved"] !== "Yes"
        : c["Resolved"] === "Yes") &&
      (selectedProduct === "" || c["Product"] === selectedProduct) &&
      (selectedEscalation === "" ||
        c["Escalation_label"] === selectedEscalation)
    );
  }, [complaints, activeTab, selectedProduct, selectedEscalation]);

  /* ===== PAGINATED DATA ===== */
  const totalPages = Math.ceil(filteredData.length / complaintsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * complaintsPerPage,
    currentPage * complaintsPerPage
  );

  /* ===== MARK AS RESOLVED ===== */
  const markAsResolved = async (complaintId) => {
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/mark-resolved/${complaintId}`,
      { method: "PUT" }
    );

    const data = await res.json();

    if (res.ok) {
      // 🔥 Refresh entire table from backend
      await fetchComplaints();
    } else {
      alert(data.detail);
    }
  } catch (err) {
    console.error(err);
  }
};

  return (
    <>
      <Navbar />

      <div className="container my-4">
        <div
          className="card p-4 shadow"
          style={{ backgroundColor: "rgb(0, 96, 106)" }}
        >
          <h3 className="text-white text-center mb-4">
            Admin Complaint Dashboard
          </h3>

          {/* ===== FILTER BAR ===== */}
          <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">

            <div className="btn-group">
              <button
                className={`btn ${
                  activeTab === "Pending"
                    ? "btn-warning text-dark"
                    : "btn-outline-light"
                }`}
                onClick={() => setActiveTab("Pending")}
              >
                Pending
              </button>

              <button
                className={`btn ${
                  activeTab === "Resolved"
                    ? "btn-success"
                    : "btn-outline-light"
                }`}
                onClick={() => setActiveTab("Resolved")}
              >
                Resolved
              </button>
            </div>

            <select
              className="form-select ms-auto"
              style={{ maxWidth: "420px" }}
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
            >
              <option value="">Select product</option>
              {productOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ maxWidth: "220px" }}
              value={selectedEscalation}
              onChange={e => setSelectedEscalation(e.target.value)}
            >
              <option value="">All Escalations</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* ===== TABLE ===== */}
          <div className="card shadow-sm">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Complaint ID</th>
                  <th>User ID</th>
                  <th>Product</th>
                  <th>Sub-Product</th>
                  <th>Issue</th>
                  <th>Complaint</th>
                  <th>Escalation</th>
                  {activeTab === "Resolved" && (
                    <>
                      <th>Rating</th>
                      <th>Feedback</th>
                    </>
                  )}
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={activeTab === "Resolved" ? 10 : 8}
                      className="text-center text-muted py-4"
                    >
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map(c => (
                    <tr key={c["Complaint ID"]}>
                      <td>{c["Complaint ID"]}</td>
                      <td>{c["UserId"]}</td>
                      <td>{c["Product"]}</td>
                      <td>{c["Sub-product"]}</td>
                      <td>{c["Issue"]}</td>

                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            setSelectedComplaintText(
                              c["Consumer complaint narrative"]
                            )
                          }
                          data-bs-toggle="modal"
                          data-bs-target="#complaintModal"
                        >
                          View
                        </button>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            c["Escalation_label"] === "High"
                              ? "bg-danger"
                              : c["Escalation_label"] === "Medium"
                              ? "bg-warning text-dark"
                              : "bg-success"
                          }`}
                        >
                          {c["Escalation_label"]}
                        </span>
                      </td>

                      {activeTab === "Resolved" && (
  <>
    <td>{c["Rating"]}</td>

    <td>
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={() =>
          setSelectedFeedbackText(c["Feedback Text"])
        }
        data-bs-toggle="modal"
        data-bs-target="#feedbackModal"
      >
        View
      </button>
    </td>
  </>
)}


                      <td>
                        {c["Resolved"] !== "Yes" ? (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              markAsResolved(c["Complaint ID"])
                            }
                          >
                            Mark as Resolved
                          </button>
                        ) : (
                          <span className="badge bg-success">
                            Resolved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ===== PAGINATION ===== */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3 gap-2 flex-wrap">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`btn btn-sm ${
                    currentPage === index + 1
                      ? "btn-dark"
                      : "btn-outline-light"
                  }`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== COMPLAINT MODAL ===== */}
      <div className="modal fade" id="complaintModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Complaint Details</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div
              className="modal-body"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              {selectedComplaintText}
            </div>
          </div>
        </div>
      </div>

      {/* ===== FEEDBACK MODAL ===== */}
      <div className="modal fade" id="feedbackModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Feedback Details</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div
              className="modal-body"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              {selectedFeedbackText}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Admin;
