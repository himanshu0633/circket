import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Terms & Conditions</h1>
      <p className="mb-4">Last updated: [DD/MM/YYYY]</p>

      <p className="mb-4">
        By accessing or using the CDS Premier League website, you agree to be
        bound by these Terms and Conditions.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Eligibility</h2>
      <p className="mb-4">
        Participation is open to players and teams meeting the tournament rules
        and age criteria set by CDS Premier League.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Registrations & Payments</h2>
      <p className="mb-4">
        All registrations are confirmed only after successful payment through
        Razorpay. Fees once paid are subject to our Refund Policy.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">User Conduct</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>No false information during registration</li>
        <li>No misuse of the website</li>
        <li>Respect tournament officials and players</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Limitation of Liability</h2>
      <p className="mb-4">
        CDS Premier League is not liable for any indirect or incidental damages
        arising from participation in the tournament.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Changes</h2>
      <p className="mb-4">
        We reserve the right to update these terms at any time without prior
        notice.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p>Email: [your-email@example.com]</p>
    </div>
  );
};

export default TermsAndConditions;
