import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
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
  IndianRupee
} from "lucide-react";

const RazorpayPayment = ({ onPageChange }) => {
  const [formData, setFormData] = useState({
    amount: 0,
    currency: 'INR',
    name: '',
    email: '',
    phone: '',
    description: 'GitFlow Visualizer Premium Subscription',
    plan: 'monthly'
  });
  
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  const plans = [
    { id: 'monthly', name: 'Monthly Premium', price: 299, description: 'Monthly access to all features' },
    { id: 'yearly', name: 'Yearly Premium', price: 2999, description: 'Yearly access with 2 months free' },
    { id: 'lifetime', name: 'Lifetime Access', price: 9999, description: 'One-time payment, lifetime access' }
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

  const handlePlanChange = (planId) => {
    const selectedPlan = plans.find(plan => plan.id === planId);
    setFormData(prev => ({
      ...prev,
      plan: planId,
      amount: selectedPlan.price.toString()
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
      // Load Razorpay script
      
      const order = await response.json();
      // console.log(order)
      
      
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // In a real application, you would create an order on your backend
      // For demo purposes, we're using test credentials
      const options = {
        key: 'rzp_test_lIugxGDVX7InEd', // Replace with your test key
        amount: formData.amount * 100, // Amount in paisa
        currency: formData.currency,
        name: 'GitFlow Visualizer',
        description: formData.description,
        image: 'https://your-logo-url.com/logo.png', // Optional logo
        order_id: `${order.id}`, // In real app, get from backend
        handler: async function (response) {
          // Payment successful
          setPaymentStatus({
            type: 'success',
            message: 'Payment completed successfully!',
            paymentId: response.razorpay_payment_id
          });
          setLoading(false);
          
          // Here you would typically verify the payment on your backend
          const validateResponse = await fetch('http://localhost:3000/order/validate', {
            method : "POST",
            body : JSON.stringify(body),
            headers: {
              "Content-Type" : "application/json",
            }
          }
        );
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
            setPaymentStatus({ type: 'info', message: 'Payment cancelled by user' });
          }
        }
      };
      console.log(options.amount)
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
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Upgrade to Premium</h1>
        <p className="text-gray-600">Choose your plan and complete payment securely</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Choose Your Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.plan === plan.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePlanChange(plan.id)}
                  >
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <div className="text-2xl font-bold text-blue-600">
                        ₹{plan.price}
                      </div>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-7">
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

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-semibold">
                    {plans.find(p => p.id === formData.plan)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold">₹{formData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-semibold">₹0</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₹{formData.amount}</span>
                </div>
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

          {/* Payment Button */}
          <Button
            onClick={initiatePayment}
            disabled={loading}
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
                <CreditCard className="mr-2 h-4 w-4" />
                Pay ₹{formData.amount}
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