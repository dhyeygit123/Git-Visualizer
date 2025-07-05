import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2,
  IndianRupee,
  Heart
} from "lucide-react";

const RazorpayPayment = ({ onPageChange }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'INR',
    name: '',
    email: '',
    phone: '',
    description: 'Donation to GitFlow Visualizer',
    plan: 'custom'
  });
  
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  const suggestedAmounts = [
    { amount: 100, label: '₹100', description: 'Buy us a coffee' },
    { amount: 500, label: '₹500', description: 'Support development' },
    { amount: 1000, label: '₹1000', description: 'Make a difference' },
    { amount: 2000, label: '₹2000', description: 'Generous supporter' }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', name: 'Net Banking', icon: Building2, description: 'All major banks supported' },
    { id: 'upi', name: 'UPI', icon: Smartphone, description: 'PhonePe, Google Pay, Paytm' },
    { id: 'wallet', name: 'Wallets', icon: Wallet, description: 'Paytm, Mobikwik, Freecharge' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmountSelect = (amount) => {
    setFormData(prev => ({
      ...prev,
      amount: amount.toString()
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

  const initiatePayment = async () => {
    if (!formData.amount || !formData.name || !formData.email || !formData.phone) {
      setPaymentStatus({ type: 'error', message: 'Please fill all required fields' });
      return;
    }

    if (parseFloat(formData.amount) < 1) {
      setPaymentStatus({ type: 'error', message: 'Minimum donation amount is ₹1' });
      return;
    }

    setLoading(true);
    setPaymentStatus(null);
    const receiptID = Math.random().toString(36).substring(2, 10);
    try {
      const response = await fetch("http://localhost:3000/orders", {
        method : "POST",
        body : JSON.stringify({
          amount : formData.amount,
          currency : formData.currency,
          receipt : receiptID
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      const order = await response.json();
      
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const options = {
        key: 'rzp_test_lIugxGDVX7InEd',
        amount: formData.amount * 100,
        currency: formData.currency,
        name: 'GitFlow Visualizer',
        description: formData.description,
        image: 'https://your-logo-url.com/logo.png',
        order_id: `${order.id}`,
        handler: async function (response) {
          setPaymentStatus({
            type: 'success',
            message: 'Thank you for your generous donation!',
            paymentId: response.razorpay_payment_id
          });
          setLoading(false);
          
          const validateResponse = await fetch('http://localhost:3000/order/validate', {
            method : "POST",
            body : JSON.stringify(body),
            headers: {
              "Content-Type" : "application/json",
            }
          });
          const jsonResponse = await validateResponse.json();
          console.log(jsonResponse);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        method: {
          card: selectedPaymentMethod === 'card',
          netbanking: selectedPaymentMethod === 'netbanking',
          upi: selectedPaymentMethod === 'upi',
          wallet: selectedPaymentMethod === 'wallet'
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setPaymentStatus({ type: 'info', message: 'Donation cancelled by user' });
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        setPaymentStatus({
          type: 'error',
          message: `Payment failed: ${response.error.description}`
        });
        setLoading(false);
      });

      rzp.open();

    } catch (error) {
      setPaymentStatus({ type: 'error', message: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Heart className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">Support Our Work</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Help us continue developing and improving GitFlow Visualizer. Your donation, no matter the size, 
          makes a real difference in keeping this project alive and growing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donation Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Choose Donation Amount
              </CardTitle>
              <CardDescription>
                Select a suggested amount or enter your own
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {suggestedAmounts.map((suggestion) => (
                  <div
                    key={suggestion.amount}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                      formData.amount === suggestion.amount.toString()
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAmountSelect(suggestion.amount)}
                  >
                    <div className="text-lg font-bold text-blue-600">
                      {suggestion.label}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-amount">Or enter custom amount</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="custom-amount"
                    name="amount"
                    type="number"
                    min="1"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Donor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Donor Information</CardTitle>
              <CardDescription>
                We'd love to know who our supporters are!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose your preferred payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <method.icon className="h-6 w-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Donation Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Donation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Donation Amount:</span>
                  <span className="font-semibold">₹{formData.amount || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee:</span>
                  <span className="font-semibold">₹0</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₹{formData.amount || '0'}</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Heart className="inline h-4 w-4 mr-1" />
                  Your donation helps us maintain and improve GitFlow Visualizer for everyone.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Badge */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-green-600">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Secured by Razorpay</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Your payment information is encrypted and secure
              </p>
            </CardContent>
          </Card>

          {/* Payment Status */}
          {paymentStatus && (
            <Alert className={`${
              paymentStatus.type === 'success' ? 'border-green-500' : 
              paymentStatus.type === 'error' ? 'border-red-500' : 'border-blue-500'
            }`}>
              {paymentStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{paymentStatus.message}</AlertDescription>
            </Alert>
          )}

          {/* Donation Button */}
          <Button
            onClick={initiatePayment}
            disabled={loading || !formData.amount || parseFloat(formData.amount) < 1}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                Donate ₹{formData.amount || '0'}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => onPageChange('home')}
            className="w-full"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RazorpayPayment;