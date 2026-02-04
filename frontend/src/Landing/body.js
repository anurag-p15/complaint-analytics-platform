import './body.css';
import { ReactComponent as AnalyticsSVG } from "./20124657_6239051.svg";
import { ReactComponent as DashboardSVG } from "./11669148_20943767.svg";

function Body() {
  return (
    <div className="container body-container my-5">

      {/* Section 1 */}
      <div className="row align-items-center section section-light mb-5">
        <div className="col-md-6">
          <h2 className="section-title">
            Turn Customer Complaints Into Strategic Business Intelligence
          </h2>
          <p className="section-text">
            Customer complaints represent one of the richest yet most under-utilized
            sources of business intelligence. Every unresolved issue can lead to
            customer churn, reputational damage, and operational inefficiencies.
            This platform transforms raw complaints into structured insights.
          </p>
        </div>

        <div className="col-md-6 text-center">
          <AnalyticsSVG className="landing-svg primary-svg" />
        </div>
      </div>

      {/* Section 2 */}
      <div className="row align-items-center flex-md-row-reverse section section-accent">
        <div className="col-md-6">
          <h2 className="section-title">
            Analyze Faster. Act Smarter. Resolve With Confidence
          </h2>
          <p className="section-text">
            Advanced analytics and machine-learning models classify complaints,
            assess escalation risk, and surface actionable insights in real time.
            Teams respond faster with confidence.
          </p>
        </div>

        <div className="col-md-6 text-center">
          <DashboardSVG className="landing-svg accent-svg" />
        </div>
      </div>

    </div>
  );
}

export default Body;
