import React, { useState } from 'react';
import { UserPlus, Store, Package, TrendingUp, BarChart3, DollarSign, Settings, Headphones, CheckCircle } from 'lucide-react';

const ProcessStep = ({ number, icon: Icon, title, description }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative text-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Step Number */}
      <div className="flex justify-center mb-4">
        <div 
          className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: isHovered ? '#7c3aed' : '#ede9fe',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <span 
            className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
          >
            {number}
          </span>
          <Icon 
            className="w-10 h-10 transition-colors duration-300"
            style={{
              color: isHovered ? '#ffffff' : '#7c3aed',
            }}
          />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600">
        {description}
      </p>
    </div>
  );
};

const BenefitCard = ({ icon: Icon, title, description }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-white rounded-xl p-6 transition-all duration-300 cursor-pointer"
      style={{
        boxShadow: isHovered ? '0 20px 40px rgba(124, 58, 237, 0.15)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{
            backgroundColor: isHovered ? '#7c3aed' : '#ede9fe',
          }}
        >
          <Icon 
            className="w-6 h-6 transition-colors duration-300"
            style={{
              color: isHovered ? '#ffffff' : '#7c3aed',
            }}
          />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h4>
          <p className="text-sm text-gray-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

const BecomeVendor = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Register Account",
      description: "Create your vendor account with basic details and business information"
    },
    {
      icon: CheckCircle,
      title: "Get Verified",
      description: "Submit your documents for quick verification and approval process"
    },
    {
      icon: Store,
      title: "Setup Store",
      description: "Customize your store profile, add logo, banner and business details"
    },
    {
      icon: Package,
      title: "Start Selling",
      description: "Add your products and start receiving orders from customers"
    }
  ];

  const benefits = [
    {
      icon: Package,
      title: "Add Products Easily",
      description: "Simple product management system. Add unlimited products with images, descriptions, pricing, and inventory tracking."
    },
    {
      icon: BarChart3,
      title: "Sales Reports",
      description: "Comprehensive sales analytics with daily, weekly, and monthly reports. Track your revenue and growth trends."
    },
    {
      icon: TrendingUp,
      title: "Order Analytics",
      description: "Detailed insights into order patterns, customer behavior, and peak sales periods to optimize your business."
    },
    {
      icon: DollarSign,
      title: "Revenue Tracking",
      description: "Real-time revenue monitoring with automated payment processing and transparent transaction history."
    },
    {
      icon: Settings,
      title: "Store Management",
      description: "Complete control over your store settings, shipping options, return policies, and promotional campaigns."
    },
    {
      icon: Headphones,
      title: "Dedicated Support",
      description: "24/7 vendor support team to help you with technical issues, marketing strategies, and business growth."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Become a <span className="text-purple-600">Vendor</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of successful sellers on MuscleX. Start your online fitness business today and reach millions of customers.
          </p>
          <button className="mt-8 bg-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl">
            Register as Vendor
          </button>
        </div>

        {/* How to Become a Vendor */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            How to Become a Vendor
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Follow these simple steps to start your selling journey
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200" style={{ width: '80%', left: '10%' }} />
            
            {steps.map((step, index) => (
              <ProcessStep 
                key={index}
                number={index + 1}
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>

        {/* What Vendors Can Do */}
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            What Vendors Can Do
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Powerful tools and features to grow your business
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <BenefitCard 
                key={index}
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
              />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        {/* <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Start Your Business?
          </h3>
          <p className="text-lg mb-8 opacity-90">
            Join our vendor community and take your fitness business to the next level
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
              Get Started Now
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors">
              Contact Sales Team
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default BecomeVendor;