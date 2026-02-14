import { useState, useMemo, useEffect } from "react";
import Navbar from "../Components/navbar";
import Footer from "../Components/footer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,LineChart,
  Line,
} from "recharts";


/* ===== PRODUCT OPTIONS ===== */
const productOptions = [
  "Debt collection",
  "Checking or savings account",
  "Credit card",
  "Credit reporting or other personal consumer reports",
  "Debt or credit management",
  "Money transfer, virtual currency, or money service",
  "Mortgage",
  "Prepaid card",
  "Student loan",
  "Vehicle loan or lease",
  "Payday loan, title loan, personal loan, or advance loan",
];

function Admin() {
  /* ===== AUTH CHECK ===== */
  const role = localStorage.getItem("userRole");
  if (role !== "admin") {
    window.location.href = "/login";
  }

  /* ===== STATE ===== */
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("Pending");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedEscalation, setSelectedEscalation] = useState("");
  const [selectedComplaintText, setSelectedComplaintText] = useState("");
  const [selectedFeedbackText, setSelectedFeedbackText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const complaintsPerPage = 25;

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

  /* ===== FILTERED DATA ===== */
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

  /* ===== TOP KEYWORDS ===== */
  const topKeywords = useMemo(() => {
    const keywordCount = {};

    filteredData.forEach(c => {
      if (c["Complaint_Keywords"]) {
        try {
          const keywords = JSON.parse(
            c["Complaint_Keywords"].replace(/'/g, '"')
          );

          keywords.forEach(word => {
            keywordCount[word] =
              (keywordCount[word] || 0) + 1;
          });
        } catch (err) {
          console.error("Keyword parse error:", err);
        }
      }
    });

    return Object.entries(keywordCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredData]);

  /* ===== EMOTION DATA ===== */
  const emotionData = useMemo(() => {
    const emotionTotals = {};

    filteredData.forEach(c => {
      if (c["nrc_emotions"]) {
        try {
          const emotions = JSON.parse(
            c["nrc_emotions"].replace(/'/g, '"')
          );

          Object.entries(emotions).forEach(
            ([emotion, value]) => {
              emotionTotals[emotion] =
                (emotionTotals[emotion] || 0) + value;
            }
          );
        } catch (err) {
          console.error("Emotion parse error:", err);
        }
      }
    });

    return Object.entries(emotionTotals).map(
      ([name, value]) => ({
        name,
        value
      })
    );
  }, [filteredData]);


//Date filter chart
const [selectedYear, setSelectedYear] = useState("All");
 const complaintTrendData = useMemo(() => {
  const weekCounts = {};

  filteredData.forEach(c => {
    const rawDate = c["Date received"];
    if (!rawDate) return;

    // Convert dd-mm-yyyy → yyyy-mm-dd
    const [day, month, year] = rawDate.split("-");
    const dateObj = new Date(`${year}-${month}-${day}`);

    if (isNaN(dateObj.getTime())) return;

    const complaintYear = dateObj.getFullYear();

    if (
      selectedYear !== "All" &&
      complaintYear !== Number(selectedYear)
    ) return;

    // Week calculation
    const oneJan = new Date(complaintYear, 0, 1);
    const numberOfDays = Math.floor(
      (dateObj - oneJan) / (24 * 60 * 60 * 1000)
    );

    const week = Math.ceil(
      (numberOfDays + oneJan.getDay() + 1) / 7
    );

    const weekKey = `${complaintYear}-W${String(week).padStart(2, "0")}`;

    weekCounts[weekKey] =
      (weekCounts[weekKey] || 0) + 1;
  });

  return Object.entries(weekCounts)
    .map(([week, count]) => ({
      week,
      count
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
}, [filteredData, selectedYear]);


  /* ===== PAGINATION ===== */
  const totalPages = Math.ceil(
    filteredData.length / complaintsPerPage
  );

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

          {/* ===== FILTERS ===== */}
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
              onChange={e =>
                setSelectedProduct(e.target.value)
              }
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
              onChange={e =>
                setSelectedEscalation(e.target.value)
              }
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
                  <th>ID</th>
                  <th>User</th>
                  <th>Product</th>
                  <th>Issue</th>
                  <th>Escalation</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map(c => (
                    <tr key={c["Complaint ID"]}>
                      <td>{c["Complaint ID"]}</td>
                      <td>{c["UserId"]}</td>
                      <td>{c["Product"]}</td>
                      <td>{c["Issue"]}</td>
                      <td>
                        <span className={`badge ${
                          c["Escalation_label"] === "High"
                            ? "bg-danger"
                            : c["Escalation_label"] === "Medium"
                            ? "bg-warning text-dark"
                            : "bg-success"
                        }`}>
                          {c["Escalation_label"]}
                        </span>
                      </td>
                      <td>
                        {c["Resolved"] !== "Yes" ? (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              markAsResolved(
                                c["Complaint ID"]
                              )
                            }
                          >
                            Mark Resolved
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
            {totalPages > 1 && (
  <div className="d-flex justify-content-center mt-3 gap-2 flex-wrap">
    {Array.from({ length: totalPages }, (_, index) => (
      <button
        key={index}
        className={`btn btn-sm ${
          currentPage === index + 1
            ? "btn-dark"
            : "btn-outline-dark"
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
    </div>
      {/* ===== ANALYTICS ===== */}
      <div className="container-fluid" style={{borderTop:"5px solid black",marginBottom:"30px"}}>    
        <h2 style={{marginTop:"30px"}}>Visuals at a Snapshot !! </h2>
        {filteredData.length > 0 && (
          <div className="mt-5">
            <h4 className="text-white mb-4">
              Complaint Analytics
            </h4>

            <div className="row" style={{margin:"1% 2%"}}>
              <div className="col-md-12 mb-4">
                <div className="card p-3 shadow">
                  <h5 className="text-center mb-3">
                    Top Keywords
                  </h5>

                  <ResponsiveContainer
                    width="100%"
                    height={350}
                  >
                    <BarChart data={topKeywords}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="row" style={{margin:"1% 2%"}}>
              <div className="col-md-7 mb-4">
                <div className="card p-3 shadow">
                  <h5 className="text-center mb-3">
                    Emotion Distribution
                  </h5>

                  <ResponsiveContainer
                    width="100%"
                    height={350}
                  >
                    <BarChart data={emotionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-md-5 mb-4">
                <div className="card p-3 shadow">
                  <h5 className="text-center mb-3">
                    Summary of Complaints
                  </h5>
                </div>
              </div>
            </div>

            <div className="row" style={{margin:"1% 2%"}}>
              <div className="col-md-12 mb-4">
                <div className="card p-3 shadow">
                  <h5 className="text-center mb-3">
                    Complaint Trend
                  </h5>
                  <div className="d-flex justify-content-center mb-3 gap-2">
                      {["All", "2024", "2025", "2026"].map((year) => (
                        <button
                          key={year}
                          className={`btn btn-sm ${
                            selectedYear === year ? "btn-primary" : "btn-outline-primary"
                          }`}
                          onClick={() => setSelectedYear(year)}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={complaintTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <button className="btn btn-lg btn-primary disabled">Check PowerBi report</button>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Admin;
