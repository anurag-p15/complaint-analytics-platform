import './form.css';
function RegisterComplaint() {
  return (
    <>
      <div className="card p-4 shadow-sm border-0" style={{backgroundColor:' rgb(0, 96, 106)'}}>
        <h4 className="mb-3 text-light">Register a New Complaint</h4>
        <p style={{color:'white',fontSize:'22px'}}>
          Please provide accurate details so we can analyze and resolve your
          complaint effectively.
        </p>

        <form>

          {/* USER */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">User Name</label>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="Enter your name"
                required
              />
            </div>
          </div>

          {/* PRODUCT */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Product</label>
              <select name="product" className="form-select" required>
                <option value="">Select product</option>
                <option value="">Select product</option> <option>Debt Collection</option> <option>Checking or Savings Account</option> <option>Credit Card</option> <option>Credit reporting or other personal consumer reports</option> <option>Debt or credit management</option> <option>Money transfer, virtual currency, or money service</option> <option>Mortgage</option> <option>Prepaid Card</option> <option>Student loan</option> <option>Vehicle loan or lease</option> <option>Payday loan, title loan, personal loan, or advance loan</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Sub-Product</label>
              <select name="subproduct" className="form-select" required>
                <option value="">Select sub-product</option>
                <option value="">Select sub-product</option> <option>Medical debt</option> <option>Checking account</option> <option>Rental debt</option> <option>Installment loan</option> <option>General-purpose credit card or charge card</option> <option>Conventional home mortgage</option> <option>General-purpose prepaid card</option> <option>Lease</option> <option>Payday loan</option> <option>Telecommunications debt</option> <option>VA mortgage</option> <option>Federal student loan servicing</option> <option>Credit repair services</option> <option>International money transfer</option> <option>Credit card debt</option> <option>Store credit card</option> <option>FHA mortgage</option> <option>Mobile or digital wallet</option> <option>Domestic (US) money transfer</option> <option>Loan</option> <option>Auto debt</option> <option>Savings account</option> <option>Private student loan</option> <option>Personal line of credit</option> <option>Check cashing service</option> <option>Home equity loan or line of credit (HELOC)</option> <option>Manufactured home loan</option> <option>CD (Certificate of Deposit)</option> <option>Mortgage debt</option> <option>Foreign currency exchange</option> <option>Payroll card</option> <option>Virtual currency</option> <option>Debt settlement</option> <option>Government benefit card</option> <option>Tax refund anticipation loan or check</option> <option>Money order, traveler's check or cashier's check</option> <option>Payday loan debt</option> <option>Gift card</option> <option>Private student loan debt</option> <option>USDA mortgage</option> <option>Mortgage modification or foreclosure avoidance</option> <option>Title loan</option> <option>Federal student loan debt</option> <option>Credit reporting</option>
              </select>
            </div>
          </div>

          {/* ISSUE */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Issue</label>
              <select name="issue" className="form-select" required>
                <option value="">Select issue</option> <option>Communication tactics</option> <option>Managing an account</option> <option>Attempts to collect debt not owed</option> <option>Charged fees or interest you didn't expect</option> <option>Problem with customer service</option> <option>Fraud or scam</option> <option>Incorrect information on your report</option> <option>Unauthorized withdrawals or charges</option> <option>Struggling to pay your loan</option> <option>Problem with a purchase or transfer</option> <option>Repossession</option> <option>Other service problem</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">State / Territory</label>
              <select name="state" className="form-select" required>
                <option value="">Select state</option> <option>AL</option><option>AK</option><option>AZ</option><option>AR</option> <option>CA</option><option>CO</option><option>CT</option><option>DE</option> <option>DC</option><option>FL</option><option>GA</option><option>HI</option> <option>ID</option><option>IL</option><option>IN</option><option>IA</option> <option>KS</option><option>KY</option><option>LA</option><option>ME</option> <option>MD</option><option>MA</option><option>MI</option><option>MN</option> <option>MS</option><option>MO</option><option>MT</option><option>NE</option> <option>NV</option><option>NH</option><option>NJ</option><option>NM</option> <option>NY</option><option>NC</option><option>ND</option><option>OH</option> <option>OK</option><option>OR</option><option>PA</option><option>RI</option> <option>SC</option><option>SD</option><option>TN</option><option>TX</option> <option>UT</option><option>VT</option><option>VA</option><option>WA</option> <option>WV</option><option>WI</option><option>WY</option> <option>AE</option><option>PR</option>
              </select>
            </div>
          </div>

          {/* ZIP */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Zip Code</label>
              <input
                type="text"
                name="zipcode"
                pattern="[0-9]{5}"
                placeholder="12345"
                className="form-control"
                required
              />
            </div>
          </div>

          {/* SUBMIT */}
          <div className="mt-4">
            <button className="btn btn-primary px-4">
              Submit Complaint
            </button>
          </div>

        </form>
        </div>
    </>
  );
}

export default RegisterComplaint;
