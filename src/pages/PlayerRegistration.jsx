import React, { useState, useEffect } from 'react';
import API from '../api/axios';

const CricketPlayerRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profileLink: '',
    role: 'Batsman'
  });
  
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const roles = [
    "Batsman",
    "Bowler", 
    "Wicket Keeper",
    "Allrounder",
    "Batsman (WC)"
  ];

  const styles = {
    appContainer: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    registrationContainer: {
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      width: '100%',
      maxWidth: '1200px',
      overflow: 'hidden'
    },
    headerSection: {
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      color: 'white',
      padding: '40px',
      textAlign: 'center'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      marginBottom: '10px'
    },
    cricketLogo: {
      fontSize: '48px',
      animation: 'bounce 2s infinite'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      margin: '0'
    },
    subtitle: {
      fontSize: '1.1rem',
      opacity: '0.9',
      marginTop: '10px'
    },
    contentWrapper: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '40px',
      padding: '40px'
    },
    formSection: {
      background: '#f8fafc',
      padding: '30px',
      borderRadius: '15px',
      border: '1px solid #e2e8f0'
    },
    registrationForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontWeight: '600',
      color: '#334155',
      fontSize: '0.95rem'
    },
    input: {
      padding: '14px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      background: 'white'
    },
    select: {
      padding: '14px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      background: 'white',
      cursor: 'pointer'
    },
    focused: {
      outline: 'none',
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)'
    },
    paymentInfo: {
      background: '#f1f5f9',
      padding: '20px',
      borderRadius: '10px',
      margin: '10px 0'
    },
    paymentAmount: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '1.2rem',
      fontWeight: '600',
      marginBottom: '10px'
    },
    amount: {
      color: '#059669',
      fontSize: '1.5rem'
    },
    paymentNote: {
      color: '#64748b',
      fontSize: '0.9rem',
      lineHeight: '1.5'
    },
    submitBtn: {
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      padding: '18px',
      borderRadius: '12px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    submitBtnDisabled: {
      opacity: '0.6',
      cursor: 'not-allowed'
    },
    paymentStatus: {
      marginTop: '30px',
      padding: '20px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      animation: 'slideIn 0.5s ease'
    },
    successStatus: {
      background: '#d1fae5',
      border: '2px solid #10b981'
    },
    errorStatus: {
      background: '#fee2e2',
      border: '2px solid #ef4444'
    },
    statusIcon: {
      fontSize: '24px'
    },
    statusMessage: {
      flex: '1'
    },
    statusTitle: {
      marginBottom: '5px',
      color: '#1f2937'
    },
    statusText: {
      color: '#4b5563',
      fontSize: '0.95rem'
    },
    infoSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '25px'
    },
    infoCard: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      padding: '30px',
      borderRadius: '15px'
    },
    infoTitle: {
      color: '#60a5fa',
      marginBottom: '20px',
      fontSize: '1.5rem'
    },
    infoList: {
      listStyle: 'none',
      paddingLeft: '0'
    },
    infoListItem: {
      padding: '10px 0',
      paddingLeft: '30px',
      position: 'relative',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      '&:last-child': {
        borderBottom: 'none'
      },
      '&:before': {
        content: '"✓"',
        position: 'absolute',
        left: '0',
        color: '#10b981',
        fontWeight: 'bold'
      }
    },
    paymentSteps: {
      background: 'white',
      border: '2px solid #e2e8f0',
      padding: '30px',
      borderRadius: '15px'
    },
    stepsTitle: {
      color: '#1e293b',
      marginBottom: '25px',
      fontSize: '1.5rem'
    },
    step: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginBottom: '20px',
      paddingBottom: '20px',
      borderBottom: '1px solid #f1f5f9',
      '&:last-child': {
        marginBottom: '0',
        paddingBottom: '0',
        borderBottom: 'none'
      }
    },
    stepNumber: {
      background: '#4f46e5',
      color: 'white',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      flexShrink: '0'
    },
    stepText: {
      color: '#475569',
      fontWeight: '500'
    },
    contactInfo: {
      background: '#f0f9ff',
      padding: '25px',
      borderRadius: '15px',
      border: '2px solid #bae6fd'
    },
    contactTitle: {
      color: '#0369a1',
      marginBottom: '15px',
      fontSize: '1.3rem'
    },
    contactText: {
      color: '#0c4a6e',
      marginBottom: '10px',
      fontWeight: '500',
      '&:last-child': {
        marginBottom: '0'
      }
    }
  };

  useEffect(() => {
    console.log("=== CRICKET PLAYER REGISTRATION COMPONENT MOUNTED ===");
    console.log("🔍 CHECKING ENVIRONMENT VARIABLES:");
    console.log("import.meta exists:", !!import.meta);
    if (import.meta) {
      console.log("import.meta.env exists:", !!import.meta.env);
      console.log("VITE_RAZORPAY_KEY_ID:", import.meta.env?.VITE_RAZORPAY_KEY_ID || "NOT FOUND");
      // Log all Vite env variables (they all start with VITE_)
      const viteEnvVars = Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'));
      console.log("All Vite env variables:", viteEnvVars);
    }
    console.log("=== END ENV CHECK ===\n");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Form field changed: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      console.log("📦 Loading Razorpay script...");
      
      if (window.Razorpay) {
        console.log("✅ Razorpay script already loaded in window.Razorpay");
        return resolve(true);
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      
      script.onload = () => {
        console.log("✅ Razorpay script loaded successfully");
        console.log("window.Razorpay now available:", !!window.Razorpay);
        console.log("window.Razorpay type:", typeof window.Razorpay);
        resolve(true);
      };
      
      script.onerror = (error) => {
        console.error("❌ Failed to load Razorpay script:", error);
        resolve(false);
      };
      
      document.body.appendChild(script);
      console.log("📦 Razorpay script tag appended to document.body");
    });
  };

  const validateForm = () => {
    console.log("🔍 Validating form data:", formData);
    const { name, email, phone, profileLink } = formData;
    
    if (!name.trim()) {
      console.error("❌ Validation failed: Full Name is required");
      throw new Error('Full Name is required');
    }
    
    if (!email.trim()) {
      console.error("❌ Validation failed: Email is required");
      throw new Error('Email is required');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("❌ Validation failed: Invalid email format");
      throw new Error('Please enter a valid email address');
    }
    
    if (!phone.trim()) {
      console.error("❌ Validation failed: Phone number is required");
      throw new Error('Phone number is required');
    }
    
    const phoneRegex = /^[0-9]{10}$/;
    const cleanedPhone = phone.replace(/\D/g, '');
    console.log("📱 Phone cleaned:", cleanedPhone);
    if (!phoneRegex.test(cleanedPhone)) {
      console.error("❌ Validation failed: Invalid phone number format");
      throw new Error('Please enter a valid 10-digit phone number');
    }
    
    if (!profileLink.trim()) {
      console.error("❌ Validation failed: Profile link is required");
      throw new Error('Profile link is required');
    }
    
    console.log("✅ All form validations passed");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("\n🚀 ===== SUBMIT FORM STARTED ===== 🚀");
    console.log("📋 Form Data:", formData);
    
    setLoading(true);
    setPaymentStatus(null);

    try {
      // 1. Validate form
      console.log("\n📝 STEP 1: FORM VALIDATION");
      validateForm();

      // 2. Load Razorpay script
      console.log("\n📦 STEP 2: LOAD RAZORPAY SCRIPT");
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        console.error("❌ Razorpay script failed to load");
        throw new Error('Failed to load payment gateway. Please check your internet connection.');
      }

      // 3. Create payment order
      console.log("\n💰 STEP 3: CREATE PAYMENT ORDER");
      console.log("Sending request to /player/create-order with amount: 50000 paise (₹500)");
      
      const orderResponse = await API.post('/player/create-order', {
        amount: 50000, // ₹500 in paise
        currency: 'INR'
      });

      console.log("Order API Response:", orderResponse.data);

      if (!orderResponse.data.success) {
        console.error("❌ Order creation failed:", orderResponse.data.message);
        throw new Error(orderResponse.data.message || 'Failed to create payment order');
      }

      const orderData = orderResponse.data.order;
      setOrderId(orderData.id);
      console.log("✅ Order created successfully");
      console.log("Order ID:", orderData.id);
      console.log("Order Amount:", orderData.amount);
      console.log("Order Currency:", orderData.currency);

      // 4. Get Razorpay key - FOR VITE ONLY
      console.log("\n🔑 STEP 4: GET RAZORPAY KEY");
      console.log("=== CHECKING VITE ENVIRONMENT VARIABLE ===");
      
      const viteKey = import.meta.env?.VITE_RAZORPAY_KEY_ID;
      const fallbackKey = 'rzp_test_RpQ1JwSJEy6yAw'; // Default test key
      
      console.log("1. Vite key (import.meta.env?.VITE_RAZORPAY_KEY_ID):", viteKey || "NOT FOUND");
      console.log("2. Fallback key:", fallbackKey);
      
      const razorpayKey = viteKey || fallbackKey;
      
      console.log("\n✅ FINAL KEY SELECTED:", razorpayKey);
      console.log("Key length:", razorpayKey.length);
      console.log("Key format check - starts with 'rzp_':", razorpayKey.startsWith('rzp_'));
      console.log("Key format check - contains 'test' or 'live':", 
        razorpayKey.includes('test') ? 'TEST KEY' : 
        razorpayKey.includes('live') ? 'LIVE KEY' : 'UNKNOWN FORMAT');
      
      if (!razorpayKey.startsWith('rzp_')) {
        console.warn("⚠️ WARNING: Razorpay key doesn't start with 'rzp_' - this may cause issues!");
      }

      // 5. Configure Razorpay options
      console.log("\n⚙️ STEP 5: CONFIGURE RAZORPAY OPTIONS");
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Cricket Player Registration',
        description: `Registration for ${formData.role}`,
        order_id: orderData.id,
        handler: async (response) => {
          console.log("\n🎯 RAZORPAY PAYMENT SUCCESS CALLBACK FIRED!");
          console.log("Payment Response:", response);
          console.log("razorpay_payment_id:", response.razorpay_payment_id);
          console.log("razorpay_order_id:", response.razorpay_order_id);
          console.log("razorpay_signature:", response.razorpay_signature ? "Present" : "Missing");
          
          // Payment successful, now verify and save
          await verifyPaymentAndSavePlayer(response);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#4f46e5'
        },
        modal: {
          ondismiss: () => {
            console.log("\n❌ RAZORPAY MODAL DISMISSED BY USER");
            setLoading(false);
            setPaymentStatus({
              type: 'info',
              message: 'Payment was cancelled. You can try again.'
            });
          }
        }
      };

      console.log("Razorpay Options Configured:");
      console.log("- Key:", options.key.substring(0, 10) + "..."); // Show only first 10 chars
      console.log("- Amount:", options.amount);
      console.log("- Currency:", options.currency);
      console.log("- Order ID:", options.order_id);
      console.log("- Description:", options.description);

      // 6. Open Razorpay checkout
      console.log("\n🪟 STEP 6: OPEN RAZORPAY CHECKOUT");
      
      if (!window.Razorpay) {
        console.error("❌ CRITICAL ERROR: window.Razorpay is not defined!");
        throw new Error('Payment gateway initialization failed. Please refresh the page and try again.');
      }
      
      console.log("window.Razorpay constructor available:", typeof window.Razorpay);
      
      try {
        const rzp = new window.Razorpay(options);
        console.log("✅ Razorpay instance created successfully");
        
        // Add error handler
        rzp.on('payment.failed', function (response) {
          console.error("\n❌ RAZORPAY PAYMENT FAILED:", response.error);
          console.log("Error code:", response.error.code);
          console.log("Error description:", response.error.description);
          console.log("Error source:", response.error.source);
          console.log("Error step:", response.error.step);
          console.log("Error reason:", response.error.reason);
          
          setPaymentStatus({
            type: 'error',
            message: `Payment failed: ${response.error.description || 'Unknown error'}`
          });
          setLoading(false);
        });
        
        console.log("🪟 Opening Razorpay checkout modal...");
        rzp.open();
        console.log("✅ Razorpay checkout opened successfully");
        
      } catch (rzpError) {
        console.error("❌ Error creating Razorpay instance:", rzpError);
        throw new Error(`Failed to initialize payment: ${rzpError.message}`);
      }

    } catch (error) {
      console.error('\n❌ ===== SUBMIT FORM ERROR ===== ❌');
      console.error("Error Type:", error.constructor.name);
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
      
      let userMessage = error.message;
      
      // Provide more user-friendly messages for common errors
      if (error.message.includes('Network Error')) {
        userMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('timeout')) {
        userMessage = 'Request timeout. Please try again.';
      } else if (error.message.includes('razorpay')) {
        userMessage = 'Payment gateway error. Please try again or contact support.';
      }
      
      setPaymentStatus({
        type: 'error',
        message: userMessage
      });
      setLoading(false);
      
      console.log("✅ Error handled, loading set to false");
    }
  };

  const verifyPaymentAndSavePlayer = async (razorpayResponse) => {
    console.log("\n🔍 ===== PAYMENT VERIFICATION STARTED ===== 🔍");
    console.log("Received Razorpay Response:", razorpayResponse);
    
    try {
      // 1. Verify payment first
      console.log("\n📡 STEP 1: VERIFY PAYMENT WITH BACKEND");
      console.log("Sending verification request to /player/verify-payment");
      
      const verificationPayload = {
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature
      };
      
      console.log("Verification Payload:", verificationPayload);
      
      const verificationResponse = await API.post('/player/verify-payment', verificationPayload);
      
      console.log("Verification API Response:", verificationResponse.data);

      if (!verificationResponse.data.success) {
        console.error("❌ Payment verification failed:", verificationResponse.data.message);
        throw new Error(verificationResponse.data.message || 'Payment verification failed');
      }

      console.log("✅ Payment verified successfully by backend");

      // 2. Save player data after successful payment
      console.log("\n💾 STEP 2: SAVE PLAYER DATA");
      console.log("Saving player data to /player/save-player");
      
      const playerPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        profileLink: formData.profileLink,
        role: formData.role,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature
      };
      
      console.log("Player Payload:", playerPayload);
      
      const playerResponse = await API.post('/player/save-player', playerPayload);
      
      console.log("Player Save API Response:", playerResponse.data);

      if (playerResponse.data.success) {
        const playerId = playerResponse.data.playerId || 'N/A';
        const successMessage = `🎉 Registration Successful! Payment verified and profile created. Your player ID: ${playerId}`;
        
        console.log("\n🎊 ===== REGISTRATION COMPLETE ===== 🎊");
        console.log("Player ID:", playerId);
        console.log("Success Message:", successMessage);
        
        setPaymentStatus({
          type: 'success',
          message: successMessage
        });
        
        // Clear form
        console.log("🧹 Clearing form data...");
        setFormData({
          name: '',
          email: '',
          phone: '',
          profileLink: '',
          role: 'Batsman'
        });
        
        // Reset order ID
        setOrderId(null);
        console.log("✅ Form cleared and order ID reset");
        
      } else {
        console.error("❌ Player save failed:", playerResponse.data.message);
        throw new Error(playerResponse.data.message || 'Profile creation failed');
      }

    } catch (error) {
      console.error('\n❌ ===== PAYMENT VERIFICATION ERROR ===== ❌');
      console.error("Error Type:", error.constructor.name);
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
      
      setPaymentStatus({
        type: 'error',
        message: error.message || 'Registration failed. Please contact support with your payment ID.'
      });
      
    } finally {
      setLoading(false);
      console.log("✅ Process completed, loading set to false");
    }
  };

  // Inline style tag for animations
  const styleTag = `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    input:focus, select:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    
    @media (max-width: 992px) {
      .content-wrapper {
        grid-template-columns: 1fr !important;
        gap: 30px !important;
      }
      
      .header-section {
        padding: 30px 20px !important;
      }
      
      h1 {
        font-size: 2rem !important;
      }
    }
    
    @media (max-width: 576px) {
      body {
        padding: 10px !important;
      }
      
      .content-wrapper {
        padding: 20px !important;
      }
      
      .form-section, .info-card, .payment-steps, .contact-info {
        padding: 20px !important;
      }
      
      .logo-container {
        flex-direction: column !important;
        text-align: center !important;
        gap: 10px !important;
      }
    }
  `;

  // Check if we're in development mode (Vite specific)
  const isDevelopment = import.meta.env?.MODE === 'development';

  return (
    <>
      <style>{styleTag}</style>
      <div style={styles.appContainer}>
        <div style={styles.registrationContainer}>
          <div style={styles.headerSection}>
            <div style={styles.logoContainer}>
              <div style={styles.cricketLogo}>🏏</div>
              <h1 style={styles.title}>Cricket Player Registration</h1>
            </div>
            <p style={styles.subtitle}>Complete payment first, then profile will be created</p>
          </div>

          <div style={styles.contentWrapper}>
            <div style={styles.formSection}>
              <form onSubmit={handleSubmit} style={styles.registrationForm}>
                <div style={styles.formGroup}>
                  <label htmlFor="name" style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    style={styles.input}
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="email" style={styles.label}>Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    style={styles.input}
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="phone" style={styles.label}>Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter 10-digit phone number"
                    required
                    style={styles.input}
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="profileLink" style={styles.label}>Profile Link *</label>
                  <input
                    type="url"
                    id="profileLink"
                    name="profileLink"
                    value={formData.profileLink}
                    onChange={handleChange}
                    placeholder="Enter your cricket profile/stats link"
                    required
                    style={styles.input}
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="role" style={styles.label}>Playing Role *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    style={styles.select}
                    disabled={loading}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.paymentInfo}>
                  <div style={styles.paymentAmount}>
                    <span>Registration Fee:</span>
                    <span style={styles.amount}>₹500</span>
                  </div>
                  <p style={styles.paymentNote}>
                    <strong>Important:</strong> First complete payment, then your profile will be automatically created. No payment = No registration.
                  </p>
                  {orderId && (
                    <p style={{...styles.paymentNote, color: '#4f46e5', fontWeight: 'bold'}}>
                      Order ID: {orderId}
                    </p>
                  )}
                  {isDevelopment && (
                    <div style={{marginTop: '10px', padding: '10px', background: '#fef3c7', borderRadius: '6px'}}>
                      <p style={{...styles.paymentNote, color: '#92400e', fontSize: '0.8rem', margin: 0}}>
                        <strong>🔧 Debug Mode:</strong> Check browser console for detailed logs
                      </p>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  style={{
                    ...styles.submitBtn,
                    ...(loading ? styles.submitBtnDisabled : {}),
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                  disabled={loading}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  onClick={() => console.log("🖱️ Submit button clicked - Starting payment process...")}
                >
                  {loading ? (
                    <>
                      <span>Opening Payment Gateway...</span>
                      <span style={{fontSize: '18px'}}>⏳</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Payment (₹500)</span>
                      <span style={{fontSize: '18px'}}>💰</span>
                    </>
                  )}
                </button>
              </form>

              {paymentStatus && (
                <div style={{
                  ...styles.paymentStatus,
                  ...(paymentStatus.type === 'success' ? styles.successStatus : 
                       paymentStatus.type === 'error' ? styles.errorStatus : 
                       { background: '#e0f2fe', border: '2px solid #0ea5e9' })
                }}>
                  <div style={styles.statusIcon}>
                    {paymentStatus.type === 'success' ? '✅' : 
                     paymentStatus.type === 'error' ? '❌' : 'ℹ️'}
                  </div>
                  <div style={styles.statusMessage}>
                    <h4 style={styles.statusTitle}>
                      {paymentStatus.type === 'success' ? 'Success!' : 
                       paymentStatus.type === 'error' ? 'Error' : 'Notice'}
                    </h4>
                    <p style={styles.statusText}>{paymentStatus.message}</p>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.infoSection}>
              <div style={styles.infoCard}>
                <h3 style={styles.infoTitle}>Registration Process</h3>
                <ul style={styles.infoList}>
                  <li style={styles.infoListItem}>
                    <strong>Step 1:</strong> Fill all details carefully
                  </li>
                  <li style={styles.infoListItem}>
                    <strong>Step 2:</strong> Click "Proceed to Payment"
                  </li>
                  <li style={styles.infoListItem}>
                    <strong>Step 3:</strong> Complete ₹500 payment via Razorpay
                  </li>
                  <li style={styles.infoListItem}>
                    <strong>Step 4:</strong> Payment automatically verified
                  </li>
                  <li style={styles.infoListItem}>
                    <strong>Step 5:</strong> Profile created instantly after payment
                  </li>
                  <li style={styles.infoListItem}>
                    <strong>Step 6:</strong> Get confirmation with Player ID
                  </li>
                </ul>
              </div>

              <div style={styles.paymentSteps}>
                <h3 style={styles.stepsTitle}>Payment Security</h3>
                <div style={styles.step}>
                  <span style={styles.stepNumber}>🔒</span>
                  <p style={styles.stepText}>
                    <strong>Secure Payment:</strong> Razorpay (PCI-DSS compliant)
                  </p>
                </div>
                <div style={styles.step}>
                  <span style={styles.stepNumber}>🛡️</span>
                  <p style={styles.stepText}>
                    <strong>Data Protection:</strong> Your information is encrypted
                  </p>
                </div>
                <div style={styles.step}>
                  <span style={styles.stepNumber}>💰</span>
                  <p style={styles.stepText}>
                    <strong>Refund Policy:</strong> 100% refund if registration fails
                  </p>
                </div>
                <div style={styles.step}>
                  <span style={styles.stepNumber}>⚡</span>
                  <p style={styles.stepText}>
                    <strong>Instant Activation:</strong> Profile ready in 2 minutes
                  </p>
                </div>
              </div>

              <div style={styles.contactInfo}>
                <h3 style={styles.contactTitle}>Need Assistance?</h3>
                <p style={styles.contactText}>
                  <strong>Email:</strong> cricket@cdsleague.com
                </p>
                <p style={styles.contactText}>
                  <strong>Phone:</strong> +91-9876543210 (10 AM - 6 PM)
                </p>
                <p style={styles.contactText}>
                  <strong>WhatsApp:</strong> +91-9876543210
                </p>
                <p style={{...styles.contactText, fontSize: '0.9rem', color: '#64748b'}}>
                  Response time: Within 30 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CricketPlayerRegistration;