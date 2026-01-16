import React, { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from "react-router-dom";

const CricketPlayerRegistration = () => {
  const navigate = useNavigate();
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
      textAlign: 'center',
      position: 'relative'
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
    dashboardButton: {
      position: 'absolute',
      left: '30px',
      top: '30px',
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '50px',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)'
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      
      script.onload = () => {
        resolve(true);
      };
      
      script.onerror = () => {
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  };

  const validateForm = () => {
    const { name, email, phone, profileLink } = formData;
    
    if (!name.trim()) {
      throw new Error('Full Name is required');
    }
    
    if (!email.trim()) {
      throw new Error('Email is required');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    if (!phone.trim()) {
      throw new Error('Phone number is required');
    }
    
    const phoneRegex = /^[0-9]{10}$/;
    const cleanedPhone = phone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      throw new Error('Please enter a valid 10-digit phone number');
    }
    
    if (!profileLink.trim()) {
      throw new Error('Profile link is required');
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setPaymentStatus(null);

    try {
      validateForm();

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway. Please check your internet connection.');
      }

      const orderResponse = await API.post('/player/create-order', {
        amount: 50000,
        currency: 'INR'
      });

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create payment order');
      }

      const orderData = orderResponse.data.order;
      setOrderId(orderData.id);

      const razorpayKey = import.meta.env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_RpQ1JwSJEy6yAw';

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Cricket Player Registration',
        description: `Registration for ${formData.role}`,
        order_id: orderData.id,
        handler: async (response) => {
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
            setLoading(false);
            setPaymentStatus({
              type: 'info',
              message: 'Payment was cancelled. You can try again.'
            });
          }
        }
      };

      if (!window.Razorpay) {
        throw new Error('Payment gateway initialization failed. Please refresh the page and try again.');
      }
      
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        setPaymentStatus({
          type: 'error',
          message: `Payment failed: ${response.error.description || 'Unknown error'}`
        });
        setLoading(false);
      });
      
      rzp.open();

    } catch (error) {
      let userMessage = error.message;
      
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
    }
  };

  const verifyPaymentAndSavePlayer = async (razorpayResponse) => {
    try {
      const verificationPayload = {
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature
      };
      
      const verificationResponse = await API.post('/player/verify-payment', verificationPayload);
      
      if (!verificationResponse.data.success) {
        throw new Error(verificationResponse.data.message || 'Payment verification failed');
      }

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
      
      const playerResponse = await API.post('/player/save-player', playerPayload);
      
      if (playerResponse.data.success) {
        const playerId = playerResponse.data.playerId || 'N/A';
        const successMessage = `🎉 Registration Successful! Payment verified and profile created. Your player ID: ${playerId}`;
        
        setPaymentStatus({
          type: 'success',
          message: successMessage
        });
        
        setFormData({
          name: '',
          email: '',
          phone: '',
          profileLink: '',
          role: 'Batsman'
        });
        
        setOrderId(null);
        
      } else {
        throw new Error(playerResponse.data.message || 'Profile creation failed');
      }

    } catch (error) {
      setPaymentStatus({
        type: 'error',
        message: error.message || 'Registration failed. Please contact support with your payment ID.'
      });
      
    } finally {
      setLoading(false);
    }
  };

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
    
    .dashboard-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
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
      
      .dashboard-btn {
        position: relative !important;
        left: auto !important;
        top: auto !important;
        margin-bottom: 20px !important;
        align-self: center !important;
      }
      
      .logo-container {
        flex-direction: column !important;
      }
    }
    
    @media (max-width: 576px) {
      body {
        padding: 10px !important;
      }
      
      .content-wrapper {
        padding: 20px !important;
      }
      
      .form-section, .info-card, .contact-info {
        padding: 20px !important;
      }
      
      .logo-container {
        flex-direction: column !important;
        text-align: center !important;
        gap: 10px !important;
      }
      
      .dashboard-btn {
        padding: 10px 20px !important;
        font-size: 0.9rem !important;
      }
    }
  `;

  return (
    <>
      <style>{styleTag}</style>
      <div style={styles.appContainer}>
        <div style={styles.registrationContainer}>
          
          <div style={styles.headerSection}>
            {/* Dashboard Button - Now positioned at top-left */}
            <button 
              className="dashboard-btn"
              style={styles.dashboardButton}
              onClick={() => navigate("/")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 70, 229, 0.3)';
              }}
            >
              <span>←</span>
              <span>Dashboard</span>
            </button>
            
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

              <div style={styles.contactInfo}>
                <h3 style={styles.contactTitle}>Need Assistance?</h3>
                <p style={styles.contactText}>
                  <strong>Email:</strong> cdspremierleague@gmail.com
                </p>
                <p style={styles.contactText}>
                  <strong>Phone:</strong> +91-98765 43210 (10 AM - 6 PM)
                </p>
                <p style={styles.contactText}>
                  <strong>WhatsApp:</strong> +91-98765 43210
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