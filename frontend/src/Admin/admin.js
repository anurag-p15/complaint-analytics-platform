import { useState, useMemo } from "react";
import Navbar from "../Components/navbar";
import Footer from "../Components/footer";

/* ===== PRODUCT DROPDOWN OPTIONS ===== */
const productOptions = [
  "",
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

/* ===== INITIAL DATA ===== */
const initialComplaints = [
  {
    id: "90001",
    product: "Credit Card",
    subProduct: "Billing",
    issue: "Unauthorized charge",
    text: "Charged twice for the same transaction.",
    status: "Pending",
    rating: null,
    feedback: null,
  },
  {
    id: "90002",
    product: "Mortgage",
    subProduct: "Loan servicing",
    issue: "Delay",
    text: "Loan processing taking too long.",
    status: "Resolved",
    rating: 4,
    feedback: "Resolved quickly by support team.",
  },
  {
    id: "90003",
    product: "Student loan",
    subProduct: "Servicing",
    issue: "Payment issue",
    text: "Payment not reflected.",
    status: "Pending",
    rating: null,
    feedback: null,
  },
  {
    id: "90004",
    product: "Credit Card",
    subProduct: "Fraud",
    issue: "Scam transaction",
    text: "Unknown merchant charged me.",
    status: "Resolved",
    rating: 5,
    feedback: "Fraud reversed and card replaced.",
  },
];

function Admin() {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [activeTab, setActiveTab] = useState("Pending");
  const [selectedProduct, setSelectedProduct] = useState("");

  /* ===== FILTERED DATA ===== */
  const filteredData = useMemo(() => {
    return complaints.filter(
      c =>
        c.status === activeTab &&
        (selectedProduct === "" || c.product === selectedProduct)
    );
  }, [complaints, activeTab, selectedProduct]);

  /* ===== MARK AS RESOLVED ===== */
  const markAsResolved = id => {
    setComplaints(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              status: "Resolved",
              rating: 5,
              feedback: "Issue resolved successfully.",
            }
          : c
      )
    );
  };

  return (
    <>
      <Navbar />

      <div className="container my-4">
        <div
          className="card p-4 shadow"
          style={{ backgroundColor: "rgb(0, 96, 106)" }}
        >
          {/* ===== HEADER ===== */}
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
              {productOptions
                .filter(p => p !== "")
                .map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
            </select>
          </div>

          {/* ===== TABLE ===== */}
          <div className="card shadow-sm">
            <table className="table table-hover" style={{ marginBottom: 0 }}>
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Sub-Product</th>
                  <th>Issue</th>
                  <th>Complaint</th>

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
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={activeTab === "Resolved" ? 8 : 6}
                      className="text-center text-muted py-4"
                    >
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map(c => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.product}</td>
                      <td>{c.subProduct}</td>
                      <td>{c.issue}</td>
                      <td>{c.text}</td>

                      {activeTab === "Resolved" && (
                        <>
                          <td>{c.rating}</td>
                          <td>{c.feedback}</td>
                        </>
                      )}

                      <td>
                        {activeTab === "Pending" ? (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => markAsResolved(c.id)}
                          >
                            Mark as Resolved
                          </button>
                        ) : (
                          <span className="badge bg-success">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Admin;
