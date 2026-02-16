  import './form.css';
  import { useState } from 'react';

  function RegisterComplaint() {
    console.log("User ID from sessionStorage:", sessionStorage.getItem("userId"));
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);

      const payload = {
        product: formData.get("product"),
        subproduct: formData.get("subproduct"),
        issue: formData.get("issue"),
        company: formData.get("company"),
        state: formData.get("state"),
        zipcode: formData.get("zipcode"),
        complaint: formData.get("complaint"),

        // 🔥 FROM SESSION STORAGE
        userId: sessionStorage.getItem("userId")
      };

      try {
        const res = await fetch("http://localhost:8000/register-complaint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        setMessage(
          `Complaint Registered | ID: ${data.complaint_id} | Escalation: ${data.escalation}`
        );

        e.target.reset();

        // 🔥 Simple success alert (OK button only)
  window.alert("Complaint registered successfully !! ");

// Refresh automatically after user clicks OK
  window.location.reload();

      } catch (err) {
        console.error(err);
        setMessage(" Error registering complaint");
      }
    };

    return (
      <>
        <div className="card p-4 shadow-sm border-0" style={{ backgroundColor: 'rgb(0, 96, 106)' }}>
          <h4 className="mb-3 text-light">Register a New Complaint</h4>

          <p style={{ color: 'white', fontSize: '22px' }}>
            Please provide accurate details so we can analyze and resolve your complaint effectively.
          </p>

          <form onSubmit={handleSubmit} >

            {/* PRODUCT */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Product</label>
                <select name="product" className="form-select" required>
                  <option value="">Select product</option>
                  <option>Debt Collection</option>
                  <option>Checking or Savings Account</option>
                  <option>Credit Card</option>
                  <option>Credit reporting or other personal consumer reports</option>
                  <option>Debt or credit management</option>
                  <option>Money transfer, virtual currency, or money service</option>
                  <option>Mortgage</option>
                  <option>Prepaid Card</option>
                  <option>Student loan</option>
                  <option>Vehicle loan or lease</option>
                  <option>Payday loan, title loan, personal loan, or advance loan</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Sub-Product</label>
                <select name="subproduct" className="form-select" required>
                  <option value="">Select sub-product</option>
                  <option>Medical debt</option>
                  <option>Checking account</option>
                  <option>Rental debt</option>
                  <option>Installment loan</option>
                  <option>General-purpose credit card or charge card</option>
                  <option>Conventional home mortgage</option>
                  <option>General-purpose prepaid card</option>
                  <option>Lease</option>
                  <option>Payday loan</option>
                  <option>Telecommunications debt</option>
                  <option>VA mortgage</option>
                  <option>Federal student loan servicing</option>
                  <option>Credit repair services</option>
                  <option>International money transfer</option>
                  <option>Credit card debt</option>
                  <option>Store credit card</option>
                  <option>FHA mortgage</option>
                  <option>Mobile or digital wallet</option>
                  <option>Domestic (US) money transfer</option>
                  <option>Loan</option>
                  <option>Auto debt</option>
                  <option>Savings account</option>
                  <option>Private student loan</option>
                  <option>Personal line of credit</option>
                  <option>Check cashing service</option>
                  <option>Home equity loan or line of credit (HELOC)</option>
                  <option>Manufactured home loan</option>
                  <option>CD (Certificate of Deposit)</option>
                  <option>Mortgage debt</option>
                  <option>Foreign currency exchange</option>
                  <option>Payroll card</option>
                  <option>Virtual currency</option>
                  <option>Debt settlement</option>
                  <option>Government benefit card</option>
                  <option>Tax refund anticipation loan or check</option>
                  <option>Money order, traveler's check or cashier's check</option>
                  <option>Payday loan debt</option>
                  <option>Gift card</option>
                  <option>Private student loan debt</option>
                  <option>USDA mortgage</option>
                  <option>Mortgage modification or foreclosure avoidance</option>
                  <option>Title loan</option>
                  <option>Federal student loan debt</option>
                  <option>Credit reporting</option>
                </select>
              </div>
            </div>

            {/* ISSUE */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Issue</label>
                <select name="issue" className="form-select" required>
                  <option value="">Select issue</option>
                  <option>Communication tactics</option>
                  <option>Managing an account</option>
                  <option>Attempts to collect debt not owed</option>
                  <option>Charged fees or interest you didn't expect</option>
                  <option>Problem with customer service</option>
                  <option>Fraud or scam</option>
                  <option>Information on Credit Card or Prepaid Card</option>
                  <option>Incorrect information on your report</option>
                  <option>Unauthorized withdrawals or charges</option>
                  <option>Struggling to pay your loan</option>
                  <option>Problem with a purchase or transfer</option>
                  <option>Repossession</option>
                  <option>Problem with a loan or credit</option>
                  <option>Problem with a credit reporting company's investigation into an existing issue</option>
                  <option>Billing Issue</option>
                  <option>Problem with a credit reporting company's handling of your dispute</option>
                  <option>Other service problem</option>
                </select>
              </div>

              {/* COMPANY NAME */}
              <div className="col-md-6">
                <label className="form-label">Company</label>
                <select name="company" className="form-select" required>
                  <option value="">Select company</option>
                  <option>Credit Service International Corp</option>
                  <option>Capital One</option>
                  <option>JPMorgan Chase & Co.</option>
                  <option>Navient Solutions, LLC</option>
                  <option>Experian Information Solutions, Inc.</option>
                  <option>Equifax, Inc.</option>
                  <option>TransUnion LLC</option>
                  <option>Encore Capital Group Inc.</option>
                  <option>Portfolio Recovery Associates, LLC</option>
                  <option>WELLS FARGO & COMPANY</option>
                  <option>M&T BANK CORPORATION</option>
                  <option>TRANSUNION INTERMEDIATE HOLDINGS, INC.</option>
                  <option>LDF Holdings, LLC</option>
                  <option>CITIBANK, N.A.</option>
                  <option>Shellpoint Partners, LLC</option>
                  <option>Atlanticus Services Corporation</option>
                  <option>UNITED SERVICES AUTOMOBILE ASSOCIATION</option>
                  <option>BANK OF AMERICA, NATIONAL ASSOCIATION</option>
                  <option>Netspend Corporation</option>
                  <option>U.S. BANCORP</option>
                  <option>CREDIT ACCEPTANCE CORPORATION</option>
                  <option>CreditNinja Lending, LLC</option>
                  <option>Credit Control, LLC</option>
                  <option>Southern Oregon Credit Service, Inc.</option>
                  <option>Freedom Mortgage Company</option>
                  <option>SYNCHRONY FINANCIAL</option>
                  <option>Army and Air Force Exchange Service</option>
                  <option>BARCLAYS BANK DELAWARE</option>
                  <option>BMO Bank, N.A.</option>
                  <option>Capital Management Services, LP</option>
                  <option>MIDFIRST BANK</option>
                  <option>FAIR COLLECTIONS & OUTSOURCING, INC.</option>
                  <option>Merchants' Credit Guide Company</option>
                  <option>LAKE MICHIGAN CREDIT UNION</option>
                  <option>Continental Finance Company, LLC</option>
                  <option>HYUNDAI CAPITAL AMERICA</option>
                  <option>EAST WEST BANK</option>
                  <option>Ability Recovery Services, LLC</option>
                  <option>Sunset Management, Inc.</option>
                  <option>SLM CORPORATION</option>
                  <option>Harris & Harris, Ltd.</option>
                  <option>I.C. System, Inc.</option>
                  <option>ECMC GROUP, INC.</option>
                  <option>January Technologies, Inc.</option>
                  <option>TRANSWORLD SYSTEMS INC</option>
                  <option>CashRepublic Holdings, Inc.</option>
                  <option>Valor Intelligent Processing, LLC</option>
                  <option>FIRST NATIONAL BANK OF OMAHA</option>
                  <option>SERVICEMAC, LLC</option>
                  <option>Diverse Funding Associates LLC</option>
                  <option>Prosper Marketplace, Inc.</option>
                  <option>NEW YORK COMMUNITY BANCORP INC</option>
                  <option>CCS Financial Services, Inc.</option>
                  <option>REGIONS FINANCIAL CORPORATION</option>
                  <option>FULTON FINANCIAL CORPORATION</option>
                  <option>American Financial Network Inc.</option>
                  <option>TRUIST FINANCIAL CORPORATION</option>
                  <option>Kind Holdings, LLC</option>
                  <option>MST Financial Services, L.L.C.</option>
                  <option>BROKER SOLUTIONS, INC.</option>
                  <option>Pressler & Pressler, LLP</option>
                  <option>ProCollect, Inc.</option>
                  <option>UNIVERSAL ACCEPTANCE CORPORATION (NE)</option>
                  <option>PENTAGON FEDERAL CREDIT UNION</option>
                  <option>Lockhart, Morris & Montgomery Inc.</option>
                  <option>ZIONS BANCORPORATION</option>
                  <option>SUNRISE CREDIT SERVICES, INC</option>
                  <option>Avid Acceptance, LLC</option>
                  <option>Northern Trust Company, The</option>
                  <option>Amsher Collection Services, Inc.</option>
                  <option>NAVFED CREDIT UNION</option>
                  <option>Rosebud Economic Development Corporation</option>
                  <option>Eastern Account Systems of Connecticut, Inc.</option>
                  <option>ALCAR INC.</option>
                  <option>GLA Collection Company, Inc.</option>
                  <option>Chrysalis Holdings LLC</option>
                  <option>Radius Global Solutions LLC</option>
                  <option>LAKEVIEW LOAN SERVICING, LLC</option>
                  <option>Fidelity National Information Services, Inc. (FNIS)</option>
                  <option>A&D Mortgage LLC</option>
                  <option>AMERISAVE MORTGAGE CORPORATION</option>
                  <option>Premier Auto Credit</option>
                  <option>Arivo Acceptance, LLC</option>
                  <option>Google Compare Credit Cards Inc.</option>
                  <option>BlueChip Financial</option>
                  <option>MoneyLion Inc.</option>
                  <option>UNITED COMMUNITY BANK</option>
                  <option>ARVEST BANK GROUP, INC.</option>
                  <option>ALLY FINANCIAL INC.</option>
                  <option>MOHELA</option>
                  <option>Aequitas Capital Opportunities Fund, LP</option>
                  <option>MRS BPO, LLC</option>
                  <option>Veros Credit, LLC</option>
                  <option>Burns Auto Credit, LLC</option>
                  <option>Tower Loan of Mississippi, Inc.</option>
                  <option>LJ Ross Associates</option>
                  <option>Firstsource Business Process Services, LLC</option>
                  <option>Mortgage Research Center, LLC</option>
                  <option>Mutual Management Services LLC</option>
                  <option>Mr. Cooper Group Inc.</option>
                  <option>eToro USA LLC</option>
                  <option>FISERV FINXACT CORE</option>
                  <option>TekCollect Inc.</option>
                  <option>TRUSTMARK CORPORATION</option>
                  <option>Tribal Lending Enterprise, Inc.</option>
                  <option>SANTANDER HOLDINGS USA, INC.</option>
                  <option>Stellantis Financial Services US Corp.</option>
                  <option>TrueAccord Corp.</option>
                  <option>LoanCare, LLC</option>
                  <option>Carter-Young, Inc.</option>
                  <option>Prince Parker & Associates</option>
                  <option>Monterey Financial Services LLC</option>
                  <option>Snap Recovery, Inc.</option>
                  <option>River Heights Capital LLC</option>
                  <option>Rosegate Mortgage, LLC</option>
                  <option>FC HoldCo LLC</option>
                  <option>SENTE MORTGAGE</option>
                  <option>MS SERVICES LLC</option>
                  <option>Nationwide Capital Services, LLC</option>
                  <option>FIRST PORTFOLIO SERVICING INC</option>
                  <option>Kopp Collection Service, Inc.</option>
                  <option>OLD NATIONAL BANCORP</option>
                  <option>Business Processing Solutions, LLC</option>
                  <option>Rausch Sturm LLP</option>
                  <option>The Savings Group, Inc.</option>
                  <option>Ocwen Financial Corporation</option>
                  <option>Kikoff Inc.</option>
                  <option>Hayt Hayt & Landau, P.L. (FL)</option>
                  <option>Zions Debt Holdings</option>
                  <option>Penn Credit Corporation</option>
                  <option>Fairway Collections, LLC</option>
                  <option>Collection Bureau of Walla Walla</option>
                  <option>Uprova Credit, LLC</option>
                  <option>National Enterprise Systems, Inc.</option>
                  <option>BC SERVICES, INC.</option>
                  <option>First National Collection Bureau, Inc.</option>
                  <option>FIRST TECHNOLOGY FEDERAL CREDIT UNION</option>
                  <option>B&B Hold Corp.</option>
                  <option>Aargon Agency, Inc.</option>
                  <option>CORELOGIC INC</option>
                  <option>CENTRAL BANCOMPANY, INC</option>
                  <option>PREMIUM MORTGAGE CORP</option>
                  <option>Rozlin Financial Group, Inc.</option>
                  <option>AUTOMOTIVE CREDIT CORPORATION</option>
                  <option>Cash Express, LLC</option>
                  <option>Lennar Financial Services, LLC</option>
                  <option>Atlantic Recovery Solutions LLC</option>
                  <option>GOLDEN 1 CREDIT UNION, THE</option>
                  <option>KBR INC DBA RASH CURTIS & ASSOCIATES</option>
                  <option>PASCO, Inc</option>
                  <option>Albert Corporation</option>
                  <option>Professional Credit Management, Inc</option>
                  <option>WESTSTAR MORTGAGE CORPORATION</option>
                  <option>M.A.R.S., Inc.</option>
                  <option>Klover Holdings, Inc.</option>
                  <option>Suttell, Hammer & White, P.S</option>
                  <option>BLINCLOANS, INC.</option>
                  <option>Reliable Credit Association, Inc.</option>
                  <option>NBT BANCORP INC.</option>
                  <option>Saint Services LLC</option>
                  <option>Possible Financial Inc</option>
                  <option>Quality Loan Service Corporation</option>
                  <option>LAND HOME FINANCIAL SERVICES</option>
                  <option>Ray Klein, Inc.</option>
                  <option>SCHOOLSFIRST FEDERAL CREDIT UNION</option>
                  <option>Waypoint Resource Group, LLC</option>
                  <option>Superior Holdings, LLC</option>
                  <option>Payward Ventures Inc. dba Kraken</option>
                  <option>Oklahoma Motor Credit Company</option>
                  <option>Parkway Financial Group, LLC</option>
                  <option>Professional Collection Service Inc (GA)</option>
                  <option>Credit Bureau Systems, Inc., Paducah, KY Branch</option>
                  <option>COLUMBIA BANKING SYSTEM, INC.</option>
                  <option>Summit A*R, Inc.</option>
                  <option>Lenmo Inc</option>
                  <option>CREDICO. INC</option>
                  <option>NETWORK CAPITAL FUNDING CORP</option>
                  <option>B9, Inc.</option>
                  <option>WEBULL PAY HOLDINGS (US) INC</option>
                  <option>KeyBridge Medical Revenue Management</option>
                  <option>Westlake Services, LLC</option>
                  <option>Midwest Fidelity Services, LLC</option>
                  <option>Lela Mae Portfolio Management Group</option>
                  <option>First Federal Credit Control, Inc.</option>
                  <option>Accredited Collection Service, Inc.</option>
                  <option>West Capital Lending, Inc.</option>
                  <option>Select Management Resources, LLC</option>
                  <option>Acra Intermediate Holdings, LLC</option>
                  <option>Johnson Mark LLC</option>
                  <option>Cash Time Title Loans, Inc.</option>
                  <option>Ascent Holding Co</option>
                  <option>Exodus Movement, Inc.</option>
                  <option>FCI Lender Services Inc.</option>
                  <option>Collection Professionals, Inc. (Macomb, IL)</option>
                  <option>Freeway Funding, Inc.</option>
                  <option>Strategic Alliances, Inc.</option>
                  <option>Americas Car-Mart, Inc.</option>
                  <option>Hollis Cobb Associates</option>
                  <option>PayTomorrow, LLC</option>
                  <option>BetterNOI, LLC</option>
                  <option>Merchants Adjustment Service, Inc.</option>
                  <option>Bridgecrest Acceptance Corporation</option>
                  <option>Bear Claw Lending dba Lucent Cash</option>
                  <option>Herbert P. Sears Co., Inc.</option>
                  <option>CMM Finance, Inc.</option>
                  <option>National Collection Systems, Inc.</option>
                  <option>FourLeaf Federal Credit Union</option>
                  <option>Rogers, Carter & Payne, LLC</option>
                  <option>Experian Information Solutions Inc.</option>
                  <option>Express Recovery Services, Inc.</option>
                  <option>American Profit Recovery, Inc., Marlborough, MA Branch</option>
                  <option>Fundo LLC</option>
                  <option>Quality Asset Recovery LLC</option>
                  <option>Merchants Acceptance Corp</option>
                  <option>MCMC Auto LTD</option>

                </select>
              </div>
            </div>

            {/* STATE + ZIP */}
            <div className="row mb-3">
              <div className="col-md-6">
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
                <div className="col-md-6">
                <label className="form-label">State / Territory</label>
                <select name="state" className="form-select" required>
                  <option value="">Select state</option> <option>AL</option><option>AK</option><option>AZ</option><option>AR</option> <option>CA</option><option>CO</option><option>CT</option><option>DE</option> <option>DC</option><option>FL</option><option>GA</option><option>HI</option> <option>ID</option><option>IL</option><option>IN</option><option>IA</option> <option>KS</option><option>KY</option><option>LA</option><option>ME</option> <option>MD</option><option>MA</option><option>MI</option><option>MN</option> <option>MS</option><option>MO</option><option>MT</option><option>NE</option> <option>NV</option><option>NH</option><option>NJ</option><option>NM</option> <option>NY</option><option>NC</option><option>ND</option><option>OH</option> <option>OK</option><option>OR</option><option>PA</option><option>RI</option> <option>SC</option><option>SD</option><option>TN</option><option>TX</option> <option>UT</option><option>VT</option><option>VA</option><option>WA</option> <option>WV</option><option>WI</option><option>WY</option> <option>AE</option><option>PR</option>
                </select>
              </div>
            </div>
            {/* COMPLAINT TEXT */}
            <div className="mb-3">
              <label className="form-label">Complaint</label>
              <textarea
                name="complaint"
                rows="4"
                className="form-control"
                placeholder="Describe your complaint..."
                required
              ></textarea>
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
