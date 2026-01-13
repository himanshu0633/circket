import React, { useState } from 'react';
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
  const [playerId, setPlayerId] = useState(null);

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
    submitBtnHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)'
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setPaymentStatus(null);

  try {
    const response = await API.post('/player/user-create', formData);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Failed to create order');
    }

    setPlayerId(data.playerId);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // FIX: Use import.meta.env for Vite, or provide a fallback
    const razorpayKey = import.meta.env?.REACT_APP_RAZORPAY_KEY_ID || 
                       process.env?.REACT_APP_RAZORPAY_KEY_ID || 
                       'rzp_test_YOUR_KEY';

    const options = {
      key: razorpayKey, // Use the variable here
      amount: data.order.amount,
      currency: data.order.currency,
      name: 'Cricket Player Registration',
      description: `Registration for ${formData.role}`,
      order_id: data.order.id,
      handler: async (response) => {
        await verifyPayment(response);
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      },
      theme: { color: '#4f46e5' }
    };

    new window.Razorpay(options).open();

  } catch (error) {
    console.error(error);
    setPaymentStatus({
      type: 'error',
      message: error.message || 'Registration failed'
    });
  } finally {
    setLoading(false);
  }
};


  const verifyPayment = async (razorpayResponse) => {
    try {
      const verificationData = {
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
        playerId: playerId
      };

      const response = await fetch('/api/player/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData)
      });

      const data = await response.json();
      
      if (data.success) {
        setPaymentStatus({
          type: 'success',
          message: 'Registration successful! Payment verified.'
        });
        // Clear form
        setFormData({
          name: '',
          email: '',
          phone: '',
          profileLink: '',
          role: 'Batsman'
        });
      } else {
        setPaymentStatus({
          type: 'error',
          message: data.message || 'Payment verification failed'
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setPaymentStatus({
        type: 'error',
        message: 'Verification failed. Please contact support.'
      });
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
            <p style={styles.subtitle}>Register now for ₹500 and showcase your talent</p>
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
                    placeholder="Enter your phone number"
                    required
                    style={styles.input}
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
                    placeholder="Enter your profile/cricket stats link"
                    required
                    style={styles.input}
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
                    You will be redirected to Razorpay for secure payment after form submission
                  </p>
                </div>

                <button 
                  type="submit" 
                  style={{
                    ...styles.submitBtn,
                    ...(loading ? styles.submitBtnDisabled : {}),
                    ':hover': loading ? {} : styles.submitBtnHover
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
                  {loading ? 'Processing...' : 'Proceed to Payment (₹500)'}
                </button>
              </form>

              {paymentStatus && (
                <div style={{
                  ...styles.paymentStatus,
                  ...(paymentStatus.type === 'success' ? styles.successStatus : styles.errorStatus)
                }}>
                  <div style={styles.statusIcon}>
                    {paymentStatus.type === 'success' ? '✅' : '❌'}
                  </div>
                  <div style={styles.statusMessage}>
                    <h4 style={styles.statusTitle}>
                      {paymentStatus.type === 'success' ? 'Success!' : 'Error'}
                    </h4>
                    <p style={styles.statusText}>{paymentStatus.message}</p>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.infoSection}>
              <div style={styles.infoCard}>
                <h3 style={styles.infoTitle}>Why Register?</h3>
                <ul style={styles.infoList}>
                  <li style={styles.infoListItem}>Get scouted by teams</li>
                  <li style={styles.infoListItem}>Showcase your skills</li>
                  <li style={styles.infoListItem}>Professional profile creation</li>
                  <li style={styles.infoListItem}>Tournament opportunities</li>
                  <li style={styles.infoListItem}>Coaching recommendations</li>
                </ul>
              </div>

              <div style={styles.paymentSteps}>
                <h3 style={styles.stepsTitle}>Registration Process</h3>
                <div style={styles.step}>
                  <span style={styles.stepNumber}>1</span>
                  <p style={styles.stepText}>Fill registration form</p>
                </div>
                <div style={styles.step}>
                  <span style={styles.stepNumber}>2</span>
                  <p style={styles.stepText}>Pay ₹500 registration fee</p>
                </div>
                <div style={styles.step}>
                  <span style={styles.stepNumber}>3</span>
                  <p style={styles.stepText}>Get payment confirmation</p>
                </div>
                <div style={styles.step}>
                  <span style={styles.stepNumber}>4</span>
                  <p style={styles.stepText}>Profile activated within 10 minute</p>
                </div>
              </div>

              <div style={styles.contactInfo}>
                <h3 style={styles.contactTitle}>Need Help?</h3>
                <p style={styles.contactText}>Email: cricket@cdsleague.com</p>
                <p style={styles.contactText}>Phone: +91-9876543210</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CricketPlayerRegistration;