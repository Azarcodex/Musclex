import { useLocation, useNavigate } from "react-router-dom";
import SalesReportPrint from "../../components/vendor/SalesreportPrint";


export default function SalesReportPrintPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Safety check (page refresh)
  if (!state) {
    return (
      <div className="p-6">
        <p>No report data found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-black text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <SalesReportPrint data={state} />;
}
