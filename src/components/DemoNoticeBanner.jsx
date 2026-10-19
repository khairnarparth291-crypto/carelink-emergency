import React from "react";
import { AlertCircle } from "lucide-react";

export default function DemoNoticeBanner() {
  return (
    <div className="demo-banner" role="alert">
      <span className="demo-tag">DEMO DATA</span>
      <AlertCircle size={15} />
      <span>
        CareLink Emergency is a prototype MVP. All hospital availability, beds, and costs are simulated demonstration data.
      </span>
    </div>
  );
}
