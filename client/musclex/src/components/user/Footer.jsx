import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const categories = [
    { name: "Strength Equipment", href: "#" },
    { name: "Cardio Machines", href: "#" },
    { name: "Free Weights & Dumbbells", href: "#" },
    { name: "Gym Accessories", href: "#" },
    { name: "Fitness Apparel", href: "#" }
  ];

  const customerCare = [
    { name: "My Account", href: "#" },
    { name: "Discount", href: "#" },
    { name: "Returns", href: "#" },
    { name: "Orders History", href: "#" },
    { name: "Order Tracking", href: "#" }
  ];

  const quickLinks = [
    { name: "About Us", href: "#" },
    { name: "Contact US", href: "#" },
    { name: "Privacy policy", href: "#" },
    { name: "Terms and Conditions", href: "#" },
    { name: "FAQ", href: "#" }
  ];

  return (
    <footer className="bg-gradient-to-br from-purple-100 to-blue-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Newsletter Section */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">MuscleX</h3>
            <div className="flex gap-2 mb-6">
              <input 
                type="email" 
                placeholder="Enter Email Address"
                className="flex-1 px-2 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
              <button className=" text-sm bg-pink-500 text-white px-2 py-1 rounded-lg font-semibold hover:bg-pink-600 transition-colors">
                Sign Up
              </button>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Contact Info</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                17 Princess Road, London, Greater London NW1 8JR, UK
              </p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Categories</h4>
            <ul className="space-y-2">
              {categories.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Customer Care</h4>
            <ul className="space-y-2">
              {customerCare.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-purple-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            ©Azarin- All Rights Reserved
          </p>
          
          {/* Social Icons */}
          <div className="flex gap-3">
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center hover:bg-blue-800 transition-colors"
            >
              <Facebook className="w-5 h-5 text-white" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center hover:bg-blue-800 transition-colors"
            >
              <Instagram className="w-5 h-5 text-white" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center hover:bg-blue-800 transition-colors"
            >
              <Twitter className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;