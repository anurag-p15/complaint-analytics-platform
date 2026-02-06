import './table.css'
function PastComplaints() {
  return (
    <div className="card p-4 shadow">

      <h4>Your Past Complaints</h4>

      <table>
        <thead>
          <tr>
            <th sc>ID</th>
            <th>Product</th>
            <th>Sub-Product</th>
            <th>Issue</th>
            <th>Complaint Text</th>
            <th>Status</th>
            <th>Feedback</th>
          </tr>
        </thead>

        <tbody>
          <tr scope>
            <td>12345</td>
            <td>Credit Card</td>
            <td>Billing</td>
            <td>ABCDVFBJ</td>
            <td>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus.</td>
            <td>Resolved</td>
            <td>
              <button className="btn btn-sm btn-success">
                Give Feedback
              </button>
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  );
}

export default PastComplaints;
