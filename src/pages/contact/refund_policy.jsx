import React from "react";

const RefundPolicy = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Refund & Cancellation Policy</h1>
      <p className="mb-4">Last updated: [DD/MM/YYYY]</p>

      <p className="mb-4">
        This policy outlines the rules for refunds and cancellations for CDS
        Premier League tournament registrations.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Cancellations</h2>
      <p className="mb-4">
        Once a team or player is registered and payment is completed, cancellation
        requests may not be accepted unless explicitly approved by the
        management.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Refunds</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>No refunds after tournament schedule is published</li>
        <li>Refunds, if applicable, will be processed within 7–10 working days</li>
        <li>Refunds will be credited to the original payment method</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Event Cancellation</h2>
      <p className="mb-4">
        If the tournament is cancelled by CDS Premier League, eligible refunds
        will be processed after deducting applicable charges.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p>Email: [your-email@example.com]</p>
    </div>
  );
};

export default RefundPolicy;
