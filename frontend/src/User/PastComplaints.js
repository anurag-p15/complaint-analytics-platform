import { useEffect, useState } from "react";
import "./table.css";

function PastComplaints() {
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const email = localStorage.getItem("userEmail");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState("");

const submitFeedback = async () => {
  if (!feedbackText || !rating || !selectedComplaint) return;

  try {
    console.log("Submitting to:", "http://localhost:8000/submit-feedback");
    console.log("Request body:", {
      complaint_id: selectedComplaint["Complaint ID"],
      feedback: feedbackText,
      rating: rating,
    });

    const res = await fetch("http://localhost:8000/submit-feedback", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        complaint_id: selectedComplaint["Complaint ID"],
        feedback: feedbackText,
        rating: rating,
      }),
    });

    console.log("Response status:", res.status);
    console.log("Response headers:", [...res.headers.entries()]);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error response:", errorText);
      throw new Error(`Failed: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    console.log("Success response:", data);

    setShowModal(false);
    setFeedbackText("");
    setRating("");

    // reload complaints
    const refreshed = await fetch(
      `http://localhost:8000/user-complaints/${email}`
    );
    setComplaints(await refreshed.json());

  } catch (err) {
    console.error("Fetch error:", err);
    alert("Error submitting feedback: " + err.message);
  }
};

useEffect(() => {
  if (!email) return;

  fetch(`http://127.0.0.1:8000/user-complaints/${email}`)
    .then(res => res.json())
    .then(data => {
      setComplaints(data);
      console.log("First row from backend:", data[0]);
    })
    .catch(err => console.error(err));

}, [email]);

  return (
    <div className="card p-4 shadow">

      <h4>Your Past Complaints</h4>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Complaint ID</th>
            <th>Product</th>
            <th>Sub Product</th>
            <th>Issue</th>
            <th>Sub-Issue</th>
            <th>Complaint Text</th>
            <th>Resolved</th>
            <th>Feedback</th>
          </tr>
        </thead>

        <tbody>

          {complaints.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center text-muted">
                No complaints found
              </td>
            </tr>
          )}

          {complaints.map(row => (
            <tr key={row["Complaint ID"]}>
              <td>{row["Date received"]}</td>
              <td>{row["Complaint ID"]}</td>
              <td>{row["Product"]}</td>
              <td>{row["Sub-product"]}</td>
              <td>{row["Issue"]}</td>
              <td>{row["Sub-issue"]}</td>
              <td>
  <button
    className="btn btn-sm btn-outline-primary"
    onClick={() => {
      setComplaintText(row["Consumer complaint narrative"]);
      setShowComplaintModal(true);
    }}
  >
    View Complaint
  </button>
</td>

              <td>{row["Resolved"]}</td>

     <td>
  {(() => {
    const feedbackRaw = row["Feedback Text"];

    const hasFeedback =
      feedbackRaw !== null &&
      feedbackRaw !== undefined &&
      feedbackRaw !== "" &&
      feedbackRaw !== "nan" &&
      feedbackRaw !== "NaN" &&
      feedbackRaw !== "None" &&
      feedbackRaw !== "null" &&
      String(feedbackRaw).trim() !== "";

    /* CASE 1 — Pending */
    if (row["Resolved"] !== "Yes") {
      return (
        <span className="badge bg-warning text-dark">
          Pending
        </span>
      );
    }

    /* CASE 2 — Resolved but NO feedback */
    if (row["Resolved"] === "Yes" && !hasFeedback) {
      return (
        <button
          className="btn btn-sm btn-success"
         onClick={() => {
  setSelectedComplaint(row);
  setShowModal(true);
}}

        >
          Give Feedback
        </button>
      );
    }

    /* CASE 3 — Resolved + feedback exists */
    return (
      <span className="text-success fw-semibold">
        Feedback Submitted
      </span>
    );
  })()}
</td>

            </tr>
          ))}

        </tbody>
      </table>
{showModal && (
        <div className="modal-overlay">

          <div className="feedback-modal">

            <div className="modal-header">
              <h5>Submit Feedback</h5>
              <button
                className="btn-close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>

            <div className="modal-body">

              <div className="mb-3">
                <label className="form-label">Feedback Text</label>
                <textarea
  className="form-control"
  rows="4"
  placeholder="Describe your experience..."
  value={feedbackText}
  onChange={e => setFeedbackText(e.target.value)}
  required
/>

              </div>

              <div className="mb-3">
                <label className="form-label">Rating</label>
                <select
  className="form-select"
  value={rating}
  onChange={e => setRating(e.target.value)}
>
                  <option value="">Select rating</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                </select>
              </div>

            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>

              <button
  className="btn btn-primary"
  onClick={submitFeedback}
>
  Submit Feedback</button>
            </div>

          </div>

        </div>
      )}
      {showComplaintModal && (
  <div className="modal-overlay">

    <div className="feedback-modal">

      <div className="modal-header">
        <h5>Complaint Details</h5>

        <button
          className="btn-close"
          onClick={() => setShowComplaintModal(false)}
        ></button>
      </div>

      <div className="modal-body">

        <p style={{ whiteSpace: "pre-wrap" }}>
          {complaintText || "No complaint text available."}
        </p>

      </div>

      <div className="modal-footer">
        <button
          className="btn btn-secondary"
          onClick={() => setShowComplaintModal(false)}
        >
          Close
        </button>
      </div>

    </div>

  </div>
)}

    </div>
  );
}

export default PastComplaints;
