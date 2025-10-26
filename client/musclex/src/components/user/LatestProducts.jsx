import React, { useState } from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative bg-white rounded-lg overflow-hidden transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* Product Image Container */}
      <div className="relative bg-gray-50 p-8 flex items-center justify-center h-64">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-300"
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />
        
        {/* Action Icons - Show on Hover */}
        <div 
          className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
          }}
        >
          <button className="bg-white rounded-full p-2 shadow-md hover:bg-blue-50 transition-colors">
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </button>
          <button className="bg-white rounded-full p-2 shadow-md hover:bg-blue-50 transition-colors">
            <Heart className="w-4 h-4 text-blue-600" />
          </button>
          <button className="bg-white rounded-full p-2 shadow-md hover:bg-blue-50 transition-colors">
            <Eye className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex items-center flex-col justify-center">
        <h3 className="text-sm font-medium text-blue-600 mb-2 hover:underline cursor-pointer">
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">${product.price}</span>
          {product.oldPrice && (
            <span className="text-sm text-red-500 line-through">${product.oldPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const LatestProducts = () => {
  const [activeTab, setActiveTab] = useState('new-arrival');

  const products = [
    {
      id: 1,
      name: "5kg dumbbell set",
      price: "26.00",
      oldPrice: "28.00",
      image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=400&fit=crop",
      category: "new-arrival"
    },
    {
      id: 2,
      name: "10g protein wafer bar",
      price: "48.00",
      oldPrice: "52.00",
      image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop",
      category: "new-arrival"
    },
    {
      id: 3,
      name: "gym bag",
      price: "43.00",
      oldPrice: "46.00",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      category: "new-arrival"
    },
    {
      id: 4,
      name: "micronised Creatine",
      price: "49.00",
      oldPrice: "53.00",
      image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop",
      category: "best-seller"
    },
    {
      id: 5,
      name: "convertible dumbbells",
      price: "14.00",
      oldPrice: "15.00",
      image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=400&fit=crop",
      category: "best-seller"
    },
    {
      id: 6,
      name: "sport shoe",
      price: "14.00",
      oldPrice: "16.00",
      image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop",
      category: "special-offer"
    }
  ];

  const filteredProducts = products.filter(p => p.category === activeTab);

  return (
    <div className=" bg-gray-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-8">Latest Products</h2>
        
        {/* Tabs */}
        <div className="flex justify-center gap-8 mb-12">
          <button
            onClick={() => setActiveTab('new-arrival')}
            className={`text-sm font-medium pb-2 transition-colors ${
              activeTab === 'new-arrival'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            New Arrival
          </button>
          <button
            onClick={() => setActiveTab('best-seller')}
            className={`text-sm font-medium pb-2 transition-colors ${
              activeTab === 'best-seller'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Best Seller
          </button>
          <button
            onClick={() => setActiveTab('special-offer')}
            className={`text-sm font-medium pb-2 transition-colors ${
              activeTab === 'special-offer'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Special Offer
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LatestProducts;