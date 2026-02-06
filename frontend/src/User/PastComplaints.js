import { useState } from "react";
import "./table.css";

function PastComplaints() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="card p-4 shadow" style={{backgroundColor:' rgb(0, 96, 106)'}}>

        <h4 style={{color:'white'}}>Your Past Complaints</h4>

        <table className="table table-hover mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Sub-Product</th>
              <th>Issue</th>
              <th>Complaint Text</th>
              <th>Status</th>
              <th>Feedback</th>
            </tr>
          </thead>

          <tbody>

            {/* ---- PENDING COMPLAINT ---- */}
            <tr>
              <td>22221</td>
              <td>Mortgage</td>
              <td>Loan servicing</td>
              <td>Delay</td>
              <td>Bank is not responding.</td>
              <td>
                <span className="badge bg-warning text-dark">
                  Pending
                </span>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-secondary"
                  disabled
                >
                  Awaiting Resolution
                </button>
              </td>
            </tr>

            {/* ---- RESOLVED BUT NO FEEDBACK ---- */}
            <tr>
              <td>33331</td>
              <td>Credit Card</td>
              <td>Billing</td>
              <td>Unauthorized charge</td>
              <td>Money deducted incorrectly.</td>
              <td>
                <span className="badge bg-success">
                  Resolved
                </span>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => setShowModal(true)}
                >
                  Give Feedback
                </button>
              </td>
            </tr>

            {/* ---- RESOLVED + FEEDBACK GIVEN ---- */}
            <tr>
              <td>44441</td>
              <td>Student Loan</td>
              <td>Servicing</td>
              <td>Payment issue</td>
              <td>Resolved quickly after complaint.</td>
              <td>
                <span className="badge bg-success">
                  Resolved
                </span>
              </td>
              <td>
                <span className="text-success fw-semibold">
                  Feedback Submitted ✔
                </span>
              </td>
            </tr>

          </tbody>
        </table>

      </div>

      {/* ===== MODAL ===== */}

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
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label">Rating</label>
                <select className="form-select">
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

              <button className="btn btn-primary">
                Submit Feedback
              </button>
            </div>

          </div>

        </div>
      )}
    </>
  );
}

export default PastComplaints;
