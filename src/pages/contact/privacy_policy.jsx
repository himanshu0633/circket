import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">Last updated: [DD/MM/YYYY]</p>

      <p className="mb-4">
        CDS Premier League ("we", "our", "us") operates a cricket competition
        website. This page informs users about our policies regarding the
        collection, use, and disclosure of personal information.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Name, phone number, email address</li>
        <li>Team and player registration details</li>
        <li>Payment details (processed securely via Razorpay)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Information</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>To manage tournament registrations</li>
        <li>To process payments and confirmations</li>
        <li>To communicate important updates</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Payments</h2>
      <p className="mb-4">
        We use Razorpay for payment processing. We do not store your card or UPI
        details on our servers.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Data Security</h2>
      <p className="mb-4">
        We value your trust and implement reasonable security measures to protect
        your personal data.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
      <p>Email: [your-email@example.com]</p>
      <p>Phone: [Your Contact Number]</p>
    </div>
  );
};

export default PrivacyPolicy;
