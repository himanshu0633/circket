import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate } from "react-router-dom";
import QR from "../assets/qrcode.png";

const CricketPlayerRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '', 
    profileLink: '',
    role: 'Batsman',
    paymentMethod: 'qr',
    utrNumber: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    qrCodeUrl: null,
    upiId: '',
    bankDetails: null
  });
  const [isMobile, setIsMobile] = useState(false);
  
  // NEW STATE for screenshot upload
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotUploading, setScreenshotUploading] = useState(false);

  const roles = [
    "Batsman",
    "Bowler", 
    "Wicket Keeper",
    "Allrounder",
    "Batsman (WC)"
  ];

  // ✅ styleTag variable को define करें
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
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    input:focus, select:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
    }
    
    .backButton:hover:not(:disabled) {
      box-shadow: 0 10px 25px rgba(100, 116, 139, 0.2);
    }
    
    .nextButton:hover:not(:disabled) {
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
    }
    
    /* Mobile-specific optimizations */
    @media (max-width: 768px) {
      input, select, button {
        font-size: 16px !important;
      }
      
      .step-line-mobile {
        display: none !important;
      }
    }
    
    * {
      max-width: 100%;
      box-sizing: border-box;
    }
  `;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    fetchPaymentInfo();
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const fetchPaymentInfo = async () => {
    try {
      const response = await API.get('/player/payment-details');
      if (response.data.success) {
        setPaymentInfo({
          qrCodeUrl: response.data.qrCodeUrl || null,
          upiId: response.data.upiId || 'example@upi',
          bankDetails: response.data.bankDetails || null
        });
      }
    } catch (error) {
      console.error("Failed to fetch payment info:", error);
      setPaymentInfo({
        qrCodeUrl: null,
        upiId: 'cricket.tournament@upi',
        bankDetails: {
          bankName: 'Example Bank',
          accountNumber: '1234567890',
          ifsc: 'EXAMPLE123'
        }
      });
    }
  };

  // ✅ styles object को यहाँ define करें (या component के अंदर कहीं भी)
  const styles = {
    // ... (all existing styles remain the same) ...
    appContainer: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: isMobile ? '10px' : '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: isMobile ? '20px' : '40px',
      paddingBottom: isMobile ? '20px' : '40px'
    },
    registrationContainer: {
      background: 'white',
      borderRadius: isMobile ? '15px' : '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      width: '100%',
      maxWidth: isMobile ? '100%' : '1000px',
      overflow: 'hidden',
      margin: isMobile ? '0 10px' : '0'
    },
    headerSection: {
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      color: 'white',
      padding: isMobile ? '20px 15px' : '40px',
      textAlign: 'center',
      position: 'relative',
      paddingTop: isMobile ? '60px' : '40px'
    },
    logoContainer: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isMobile ? '10px' : '20px',
      marginBottom: isMobile ? '5px' : '10px'
    },
    cricketLogo: {
      fontSize: isMobile ? '36px' : '48px',
      animation: 'bounce 2s infinite'
    },
    dashboardButton: {
      position: 'absolute',
      left: isMobile ? '15px' : '30px',
      top: isMobile ? '15px' : '30px',
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      padding: isMobile ? '8px 16px' : '12px 24px',
      borderRadius: '50px',
      fontSize: isMobile ? '0.85rem' : '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
      whiteSpace: 'nowrap'
    },
    title: {
      fontSize: isMobile ? '1.5rem' : '2.5rem',
      fontWeight: '700',
      margin: '0',
      textAlign: 'center'
    },
    subtitle: {
      fontSize: isMobile ? '0.9rem' : '1.1rem',
      opacity: '0.9',
      marginTop: isMobile ? '8px' : '10px',
      padding: isMobile ? '0 10px' : '0'
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: isMobile ? '20px' : '40px',
      padding: isMobile ? '15px 20px' : '20px 40px',
      background: '#f1f5f9',
      borderBottom: '1px solid #e2e8f0',
      flexWrap: 'wrap'
    },
    step: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '6px' : '10px',
      fontSize: isMobile ? '0.85rem' : '1rem',
      fontWeight: '600',
      color: '#64748b',
      position: 'relative',
      minWidth: isMobile ? 'auto' : '150px'
    },
    stepActive: {
      color: '#4f46e5'
    },
    stepCompleted: {
      color: '#10b981'
    },
    stepNumber: {
      width: isMobile ? '28px' : '36px',
      height: isMobile ? '28px' : '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#e2e8f0',
      fontWeight: '700',
      fontSize: isMobile ? '0.85rem' : '1rem',
      flexShrink: 0
    },
    stepNumberActive: {
      background: '#4f46e5',
      color: 'white'
    },
    stepNumberCompleted: {
      background: '#10b981',
      color: 'white'
    },
    stepLine: {
      width: isMobile ? '20px' : '40px',
      height: '3px',
      background: '#e2e8f0',
      position: 'absolute',
      right: isMobile ? '-23px' : '-45px',
      display: isMobile ? 'block' : 'block'
    },
    stepLineActive: {
      background: '#4f46e5'
    },
    stepLineCompleted: {
      background: '#10b981'
    },
    contentWrapper: {
      padding: isMobile ? '20px 15px' : '40px'
    },
    formSection: {
      background: '#f8fafc',
      padding: isMobile ? '20px' : '30px',
      borderRadius: isMobile ? '12px' : '15px',
      border: '1px solid #e2e8f0'
    },
    registrationForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '15px' : '20px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '6px' : '8px'
    },
    label: {
      fontWeight: '600',
      color: '#334155',
      fontSize: isMobile ? '0.85rem' : '0.95rem'
    },
    required: {
      color: '#ef4444',
      marginLeft: '4px'
    },
    input: {
      padding: isMobile ? '12px 14px' : '14px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: isMobile ? '8px' : '10px',
      fontSize: isMobile ? '0.95rem' : '1rem',
      transition: 'all 0.3s ease',
      background: 'white',
      width: '100%'
    },
    select: {
      padding: isMobile ? '12px 14px' : '14px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: isMobile ? '8px' : '10px',
      fontSize: isMobile ? '0.95rem' : '1rem',
      transition: 'all 0.3s ease',
      background: 'white',
      cursor: 'pointer',
      width: '100%'
    },
    paymentSection: {
      textAlign: 'center',
      padding: isMobile ? '0' : '20px'
    },
    qrCodeContainer: {
      maxWidth: isMobile ? '100%' : '400px',
      margin: '0 auto 30px',
      padding: isMobile ? '15px' : '20px',
      background: 'white',
      borderRadius: isMobile ? '12px' : '15px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      border: '2px solid #e2e8f0'
    },
    qrImage: {
      width: isMobile ? '200px' : '250px',
      height: isMobile ? '200px' : '250px',
      margin: '0 auto 20px',
      display: 'block',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '10px',
      background: 'white',
      maxWidth: '100%'
    },
    qrPlaceholder: {
      width: isMobile ? '200px' : '250px',
      height: isMobile ? '200px' : '250px',
      margin: '0 auto 20px',
      background: 'linear-gradient(45deg, #f3f4f6 25%, #e5e7eb 25%, #e5e7eb 50%, #f3f4f6 50%, #f3f4f6 75%, #e5e7eb 75%, #e5e7eb)',
      backgroundSize: '20px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '1rem' : '1.2rem',
      color: '#9ca3af',
      border: '2px dashed #d1d5db',
      borderRadius: '10px',
      maxWidth: '100%'
    },
    paymentInstructions: {
      background: '#f0f9ff',
      padding: isMobile ? '15px' : '20px',
      borderRadius: isMobile ? '8px' : '10px',
      border: '2px solid #bae6fd',
      marginBottom: '30px',
      textAlign: 'left'
    },
    instructionTitle: {
      color: '#0369a1',
      marginBottom: '15px',
      fontSize: isMobile ? '1rem' : '1.2rem'
    },
    instructionList: {
      listStyle: 'none',
      paddingLeft: '0',
      margin: '0'
    },
    instructionItem: {
      padding: '6px 0',
      paddingLeft: '25px',
      position: 'relative',
      textAlign: 'left',
      fontSize: isMobile ? '0.85rem' : '1rem',
      '&:before': {
        content: '"✓"',
        position: 'absolute',
        left: '0',
        color: '#10b981',
        fontWeight: 'bold'
      }
    },
    amountBadge: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      padding: isMobile ? '8px 16px' : '8px 20px',
      borderRadius: '20px',
      fontSize: isMobile ? '1.1rem' : '1.3rem',
      fontWeight: 'bold',
      display: 'inline-block',
      marginBottom: '20px',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
      width: isMobile ? '90%' : 'auto'
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      marginTop: isMobile ? '30px' : '40px',
      gap: isMobile ? '15px' : '20px'
    },
    navButton: {
      padding: isMobile ? '12px 20px' : '14px 30px',
      borderRadius: isMobile ? '8px' : '10px',
      fontSize: isMobile ? '0.9rem' : '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      minWidth: isMobile ? '100%' : '150px',
      width: isMobile ? '100%' : 'auto'
    },
    backButton: {
      background: '#f1f5f9',
      color: '#475569',
      border: '2px solid #e2e8f0'
    },
    nextButton: {
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      color: 'white'
    },
    submitBtn: {
      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      color: 'white',
      border: 'none',
      padding: isMobile ? '14px 30px' : '16px 40px',
      borderRadius: isMobile ? '8px' : '10px',
      fontSize: isMobile ? '1rem' : '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: isMobile ? '20px' : '30px',
      width: isMobile ? '100%' : 'auto'
    },
    submitBtnDisabled: {
      opacity: '0.6',
      cursor: 'not-allowed'
    },
    statusMessage: {
      marginTop: '20px',
      padding: isMobile ? '15px' : '20px',
      borderRadius: isMobile ? '10px' : '12px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      animation: 'slideIn 0.5s ease',
      flexDirection: isMobile ? 'column' : 'row'
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
      fontSize: isMobile ? '20px' : '24px',
      flexShrink: 0
    },
    statusContent: {
      flex: '1'
    },
    statusTitle: {
      marginBottom: '5px',
      color: '#1f2937',
      fontWeight: '600',
      fontSize: isMobile ? '1rem' : '1.1rem'
    },
    statusText: {
      color: '#4b5563',
      fontSize: isMobile ? '0.85rem' : '0.95rem',
      lineHeight: '1.5'
    },
    infoBox: {
      background: '#fef3c7',
      border: '2px solid #f59e0b',
      borderRadius: isMobile ? '8px' : '10px',
      padding: isMobile ? '12px' : '15px',
      marginTop: '20px',
      textAlign: 'left'
    },
    infoTitle: {
      color: '#d97706',
      fontWeight: '600',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: isMobile ? '0.9rem' : '1rem'
    },
    infoText: {
      color: '#92400e',
      fontSize: isMobile ? '0.8rem' : '0.9rem',
      lineHeight: '1.5'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '15px'
    },
    modalBox: {
      background: '#fff',
      borderRadius: isMobile ? '14px' : '18px',
      width: '100%',
      maxWidth: '500px',
      padding: isMobile ? '20px' : '30px',
      animation: 'slideIn 0.4s ease',
      boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
    },
    closeBtn: {
      position: 'absolute',
      top: '12px',
      right: '16px',
      background: 'transparent',
      border: 'none',
      fontSize: '22px',
      cursor: 'pointer'
    },
    // NEW STYLES for screenshot upload
    fileUploadContainer: {
      border: '2px dashed #cbd5e1',
      borderRadius: isMobile ? '8px' : '10px',
      padding: isMobile ? '20px' : '25px',
      textAlign: 'center',
      backgroundColor: '#f8fafc',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '10px'
    },
    fileUploadContainerHover: {
      borderColor: '#4f46e5',
      backgroundColor: '#eef2ff'
    },
    fileUploadLabel: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer'
    },
    uploadIcon: {
      fontSize: isMobile ? '28px' : '32px',
      color: '#4f46e5'
    },
    uploadText: {
      fontWeight: '600',
      color: '#475569',
      fontSize: isMobile ? '0.9rem' : '1rem'
    },
    uploadSubtext: {
      color: '#64748b',
      fontSize: isMobile ? '0.8rem' : '0.85rem',
      marginTop: '4px'
    },
    fileInput: {
      display: 'none'
    },
    previewContainer: {
      marginTop: '15px',
      position: 'relative'
    },
    previewImage: {
      maxWidth: '100%',
      maxHeight: '200px',
      borderRadius: '8px',
      border: '2px solid #e2e8f0'
    },
    removeButton: {
      position: 'absolute',
      top: '-10px',
      right: '-10px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '28px',
      height: '28px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold'
    },
    optionalText: {
      color: '#6b7280',
      fontSize: isMobile ? '0.8rem' : '0.85rem',
      marginLeft: '4px',
      fontWeight: 'normal'
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // NEW: Handle screenshot file selection
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setRegistrationStatus({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please upload only image files (JPG, PNG, GIF, WebP)'
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setRegistrationStatus({
        type: 'error',
        title: 'File Too Large',
        message: 'Maximum file size is 5MB. Please upload a smaller image.'
      });
      return;
    }

    setPaymentScreenshot(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // NEW: Remove screenshot
  const handleRemoveScreenshot = () => {
    setPaymentScreenshot(null);
    setScreenshotPreview(null);
    // Reset file input
    const fileInput = document.getElementById('paymentScreenshot');
    if (fileInput) fileInput.value = '';
  };

  // Validate CricHeroes profile link format
  const validateCricHeroesLink = (link) => {
    // Check if link contains cricheroes.com
    if (!link.includes('cricheroes.com')) {
      throw new Error('Profile link must be a valid CricHeroes URL');
    }
    
    // Check for specific pattern: https://cricheroes.com/player-profile/{numbers}/{name}
    const pattern = /^https:\/\/cricheroes\.com\/player-profile\/\d+\/[A-Za-z0-9_-]+$/;
    if (!pattern.test(link)) {
      throw new Error('CricHeroes profile link must be in format: https://cricheroes.com/player-profile/1572929/Pepsi');
    }
    
    return true;
  };

  // Validate date of birth
  const validateDOB = (dob) => {
    if (!dob) {
      throw new Error('Date of Birth is required');
    }
    
    const dobDate = new Date(dob);
    const today = new Date();
    
    // Check if date is valid
    if (isNaN(dobDate.getTime())) {
      throw new Error('Please enter a valid date of birth');
    }
    
    // Check if date is not in future
    if (dobDate > today) {
      throw new Error('Date of Birth cannot be in the future');
    }
    
    // Check minimum age (e.g., 10 years)
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 10);
    if (dobDate > minAgeDate) {
      throw new Error('Player must be at least 10 years old');
    }
    
    // Check maximum age (e.g., 60 years)
    const maxAgeDate = new Date();
    maxAgeDate.setFullYear(today.getFullYear() - 60);
    if (dobDate < maxAgeDate) {
      throw new Error('Player age cannot exceed 60 years');
    }
    
    return true;
  };

  const validateStep1 = () => {
    const { name, email, phone, dob, profileLink } = formData;
    
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
    
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanedPhone = phone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      throw new Error('Please enter a valid 10-digit Indian phone number');
    }
    
    // Validate Date of Birth
    validateDOB(dob);
    
    // Validate CricHeroes Profile Link
    if (!profileLink.trim()) {
      throw new Error('CricHeroes profile link is required');
    }
    
    validateCricHeroesLink(profileLink.trim());
    
    return true;
  };

  const validateStep2 = () => {
    const { utrNumber } = formData;
    
    if (!utrNumber.trim()) {
      throw new Error('UTR number is required');
    }
    
    if (utrNumber.trim().length < 8) {
      throw new Error('Please enter a valid UTR number (minimum 8 characters)');
    }
    
    return true;
  };

  const handleNextStep = () => {
    try {
      validateStep1();
      setCurrentStep(2);
      setRegistrationStatus(null);
    } catch (error) {
      setRegistrationStatus({
        type: 'error',
        message: error.message
      });
      
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setRegistrationStatus(null);
    
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setRegistrationStatus(null);

    try {
      validateStep2();

      // Create FormData to handle file upload
      const submitData = new FormData();
      
      // Add all form data
      Object.keys(formData).forEach(key => {
        if (key === 'phone') {
          submitData.append(key, formData[key].replace(/\D/g, ''));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add registration metadata
      submitData.append('registrationDate', new Date().toISOString());
      submitData.append('paymentStatus', 'pending');
      submitData.append('verificationStatus', 'pending');
      
      // Add screenshot if exists
      if (paymentScreenshot) {
        submitData.append('paymentProof', paymentScreenshot);
      }

      const response = await API.post('/player/register', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setRegistrationStatus({
          type: 'success',
          title: 'Registration Submitted Successfully!',
          message: 'Your registration has been submitted for verification.',
          playerId: response.data.playerId || 'REG-' + Date.now(),
          utrNumber: formData.utrNumber,
          registrationDate: new Date().toLocaleDateString()
        });
        
        // Reset form and screenshot
        setFormData({
          name: '',
          email: '',
          phone: '',
          dob: '',
          profileLink: '',
          role: 'Batsman',
          paymentMethod: 'qr',
          utrNumber: ''
        });
        setPaymentScreenshot(null);
        setScreenshotPreview(null);
        
        // Go back to step 1 after successful submission
        setTimeout(() => {
          setCurrentStep(1);
          if (isMobile) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 5000);
        
      } else {
        throw new Error(response.data.message || 'Registration failed. Please try again.');
      }

    } catch (error) {
      let userMessage = error.message;
      
      if (error.response?.data?.message) {
        userMessage = error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        userMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        userMessage = 'Request timeout. Please try again.';
      }
      
      setRegistrationStatus({
        type: 'error',
        title: 'Registration Failed',
        message: userMessage
      });
      
      if (isMobile) {
        setTimeout(() => {
          const statusElement = document.querySelector('[style*="statusMessage"]');
          if (statusElement) {
            statusElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styleTag}</style>
      <div style={styles.appContainer}>
        <div style={styles.registrationContainer}>
          
          <div style={styles.headerSection}>
            <button 
              style={styles.dashboardButton}
              onClick={() => navigate("/")}
              aria-label="Go back to dashboard"
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
              <h1 style={styles.title}>CDS Champions Trophy</h1>
            </div>
            <p style={styles.subtitle}>Complete registration in 2 simple steps</p>
          </div>

          <div style={styles.stepIndicator}>
            <div style={{
              ...styles.step,
              ...(currentStep === 1 ? styles.stepActive : currentStep === 2 ? styles.stepCompleted : {})
            }}>
              <div style={{
                ...styles.stepNumber,
                ...(currentStep === 1 ? styles.stepNumberActive : currentStep === 2 ? styles.stepNumberCompleted : {})
              }}>
                1
              </div>
              <span>{isMobile ? 'Details' : 'Player Details'}</span>
              <div style={{
                ...styles.stepLine,
                ...(currentStep === 2 ? styles.stepLineCompleted : {}),
                display: isMobile ? 'none' : 'block'
              }}></div>
            </div>
            
            <div style={{
              ...styles.step,
              ...(currentStep === 2 ? styles.stepActive : {})
            }}>
              <div style={{
                ...styles.stepNumber,
                ...(currentStep === 2 ? styles.stepNumberActive : {})
              }}>
                2
              </div>
              <span>{isMobile ? 'Payment' : 'Payment & UTR'}</span>
            </div>
          </div>

          <div style={styles.contentWrapper}>
            {currentStep === 1 ? (
              <div style={styles.formSection}>
                <form style={styles.registrationForm}>
                  <div style={styles.formGroup}>
                    <label htmlFor="name" style={styles.label}>
                      Full Name <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      style={styles.input}
                      aria-required="true"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="email" style={styles.label}>
                      Email Address <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      style={styles.input}
                      aria-required="true"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="phone" style={styles.label}>
                      Phone Number <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter 10-digit phone number"
                      required
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      style={styles.input}
                      aria-required="true"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="dob" style={styles.label}>
                      Date of Birth <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                      style={styles.input}
                      aria-required="true"
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <small style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                      Player must be between 10 and 60 years old
                    </small>
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="profileLink" style={styles.label}>
                      CricHeroes Profile Link <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="url"
                      id="profileLink"
                      name="profileLink"
                      value={formData.profileLink}
                      onChange={handleChange}
                      placeholder="https://cricheroes.com/player-profile/000000000/xyz"
                      required
                      style={styles.input}
                      aria-required="true"
                    />
                    <small style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                      Format: https://cricheroes.com/player-profile/0000000/Abcde
                    </small>
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="role" style={styles.label}>
                      Playing Role <span style={styles.required}>*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      style={styles.select}
                      aria-required="true"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  {registrationStatus && registrationStatus.type === 'error' && (
                    <div style={{
                      ...styles.statusMessage,
                      ...styles.errorStatus
                    }}>
                      <div style={styles.statusIcon}>❌</div>
                      <div style={styles.statusContent}>
                        <h4 style={styles.statusTitle}>{registrationStatus.title}</h4>
                        <p style={styles.statusText}>{registrationStatus.message}</p>
                      </div>
                    </div>
                  )}

                  <div style={styles.buttonContainer}>
                    <button 
                      type="button"
                      style={{...styles.navButton, ...styles.backButton}}
                      onClick={() => navigate("/")}
                      aria-label="Cancel registration"
                    >
                      <span>←</span>
                      <span>Cancel</span>
                    </button>
                    
                    <button 
                      type="button"
                      style={{...styles.navButton, ...styles.nextButton}}
                      onClick={handleNextStep}
                      aria-label="Proceed to payment step"
                    >
                      <span>{isMobile ? 'Next' : 'Next: Payment'}</span>
                      <span>→</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div style={styles.formSection}>
                <div style={styles.paymentSection}>
                  <div style={styles.amountBadge}>
                    Registration Fee: ₹500
                  </div>
                  
                  <div style={styles.qrCodeContainer}>
                    <h3 style={{color: '#1e293b', marginBottom: '20px', fontSize: isMobile ? '1.1rem' : '1.2rem'}}>
                      Scan QR Code to Pay
                    </h3>
                    
                    {/* QR Code Image */}
                    {paymentInfo.qrCodeUrl ? (
                      <img 
                        src={paymentInfo.qrCodeUrl} 
                        alt="Payment QR Code"
                        style={styles.qrImage}
                        onError={(e) => {
                          console.error("Failed to load QR from URL");
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <>
                        <img 
                          src={QR} 
                          alt="Payment QR Code"
                          style={styles.qrImage}
                          onError={(e) => {
                            console.error("Failed to load local QR image");
                            e.target.style.display = 'none';
                          }}
                        />
                      </>
                    )}
                    
                    {/* Fallback QR Placeholder */}
                    {(!paymentInfo.qrCodeUrl && (!QR || QR.includes('undefined'))) && (
                      <div style={styles.qrPlaceholder}>
                        <div>QR Code</div>
                        <div style={{fontSize: '2rem', marginTop: '10px'}}>₹500</div>
                      </div>
                    )}
                    
                    <div style={styles.paymentInstructions}>
                      <h4 style={styles.instructionTitle}>How to Pay:</h4>
                      <ul style={styles.instructionList}>
                        <li style={styles.instructionItem}>
                          Open any UPI app (Google Pay, PhonePe, Paytm, etc.)
                        </li>
                        <li style={styles.instructionItem}>
                          Scan the QR code above
                        </li>
                        <li style={styles.instructionItem}>
                          Enter amount: ₹500
                        </li>
                        <li style={styles.instructionItem}>
                          Complete the payment
                        </li>
                        <li style={styles.instructionItem}>
                          Save the UTR/Reference number
                        </li>
                      </ul>
                    </div>
                    
                  </div>

                  <form onSubmit={handleSubmit} style={styles.registrationForm}>
                    <div style={styles.formGroup}>
                      <label htmlFor="utrNumber" style={styles.label}>
                        Enter UTR/Reference Number <span style={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        id="utrNumber"
                        name="utrNumber"
                        value={formData.utrNumber}
                        onChange={handleChange}
                        placeholder="Enter UTR number from your payment"
                        inputMode="numeric"
                        maxLength={16}
                        required
                        style={styles.input}
                        disabled={loading}
                        aria-required="true"
                      />
                      <small style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                        Enter the UTR/Reference number you received after payment
                      </small>
                    </div>

                    {/* NEW: Screenshot Upload Section */}
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        Upload Payment Screenshot <span style={styles.optionalText}>(Optional)</span>
                      </label>
                      <div 
                        style={{
                          ...styles.fileUploadContainer,
                          ...(paymentScreenshot ? styles.fileUploadContainerHover : {})
                        }}
                        onMouseEnter={(e) => {
                          if (!paymentScreenshot) {
                            e.currentTarget.style.borderColor = '#4f46e5';
                            e.currentTarget.style.backgroundColor = '#eef2ff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!paymentScreenshot) {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                          }
                        }}
                      >
                        <label htmlFor="paymentScreenshot" style={styles.fileUploadLabel}>
                          <div style={styles.uploadIcon}>📱</div>
                          <div>
                            <div style={styles.uploadText}>
                              {paymentScreenshot ? 'Change Screenshot' : 'Upload Payment Screenshot'}
                            </div>
                            <div style={styles.uploadSubtext}>
                              {paymentScreenshot 
                                ? `Selected: ${paymentScreenshot.name}`
                                : 'Click to upload or drag and drop'
                              }
                            </div>
                            <div style={styles.uploadSubtext}>
                              Supports: JPG, PNG, GIF, WebP (Max 5MB)
                            </div>
                          </div>
                          <input
                            type="file"
                            id="paymentScreenshot"
                            accept="image/*"
                            onChange={handleScreenshotChange}
                            style={styles.fileInput}
                            disabled={loading}
                          />
                        </label>
                        
                        {/* Screenshot Preview */}
                        {screenshotPreview && (
                          <div style={styles.previewContainer}>
                            <img 
                              src={screenshotPreview} 
                              alt="Payment screenshot preview" 
                              style={styles.previewImage}
                            />
                            <button
                              type="button"
                              onClick={handleRemoveScreenshot}
                              style={styles.removeButton}
                              disabled={loading}
                              aria-label="Remove screenshot"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                      <small style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '0.85rem', marginTop: '8px' }}>
                        Uploading a screenshot of your payment receipt helps in faster verification
                      </small>
                    </div>

                    <div style={styles.infoBox}>
                      <div style={styles.infoTitle}>
                        <span>ℹ️</span>
                        <span>Important Information</span>
                      </div>
                      <p style={styles.infoText}>
                        • Keep your UTR number safe for future reference.
                        <br />
                        • Screenshot upload is optional but recommended for faster verification.
                        <br />
                        • Make sure the screenshot clearly shows payment details and UTR number.
                      </p>
                    </div>

                    <div style={styles.buttonContainer}>
                      <button 
                        type="button"
                        style={{...styles.navButton, ...styles.backButton}}
                        onClick={handlePrevStep}
                        disabled={loading}
                        aria-label="Go back to player details"
                      >
                        <span>←</span>
                        <span>Back</span>
                      </button>
                      
                      <button 
                        type="submit" 
                        style={{
                          ...styles.submitBtn,
                          ...(loading ? styles.submitBtnDisabled : {})
                        }}
                        disabled={loading}
                        aria-label="Complete registration"
                      >
                        {loading ? (
                          <>
                            <span>Processing...</span>
                            <span style={{
                              width: '20px',
                              height: '20px',
                              border: '2px solid rgba(255,255,255,0.3)',
                              borderRadius: '50%',
                              borderTopColor: '#fff',
                              animation: 'spin 1s linear infinite'
                            }}></span>
                          </>
                        ) : (
                          <>
                            <span>{isMobile ? 'Submit' : 'Complete Registration'}</span>
                            <span style={{fontSize: '18px'}}>✅</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
             {registrationStatus && (
               <div style={styles.modalOverlay}>
                      <div style={{ ...styles.modalBox, position: 'relative' }}>
      
                       <button
                      style={styles.closeBtn}
                  onClick={() => setRegistrationStatus(null)}
                 >
                 ✖
                   </button>

      <div style={{
        ...styles.statusMessage,
        ...(registrationStatus.type === 'success'
          ? styles.successStatus
          : styles.errorStatus)
      }}>
        <div style={styles.statusIcon}>
          {registrationStatus.type === 'success' ? '✅' : '❌'}
        </div>

        <div style={styles.statusContent}>
          <h4 style={styles.statusTitle}>
            {registrationStatus.title}
          </h4>

          <p style={styles.statusText}>
            {registrationStatus.message}

            {registrationStatus.playerId && (
              <><br /><strong>Player ID:</strong> {registrationStatus.playerId}</>
            )}

            {registrationStatus.utrNumber && (
              <><br /><strong>UTR Number:</strong> {registrationStatus.utrNumber}</>
            )}

            {registrationStatus.registrationDate && (
              <><br /><strong>Date:</strong> {registrationStatus.registrationDate}</>
            )}
            </p>
           </div>
          </div>
         </div>
           </div>
              )}

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CricketPlayerRegistration;