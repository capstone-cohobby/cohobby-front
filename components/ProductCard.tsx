
'use client';

import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  owner: string;
  verified: boolean;
  rating: number;
  reviews: number;
  location: string;
  time: string;
  price: string;
  image: string;
  available: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="relative mb-3">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-40 object-cover object-top rounded-2xl"
          />
          
          {product.available && (
            <div className="absolute top-2 left-2">
              <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                대여가능
              </span>
            </div>
          )}
          
          <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg cursor-pointer">
            <i className="ri-heart-line text-gray-600 text-sm hover:text-red-500 transition-colors duration-300"></i>
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
              <i className="ri-user-fill text-white text-xs"></i>
            </div>
            <span className="text-xs font-medium text-gray-700 truncate">{product.owner}</span>
            {product.verified && (
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <i className="ri-check-fill text-white text-xs"></i>
              </div>
            )}
          </div>

          <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">{product.title}</h3>

          <div className="flex items-center gap-1">
            <i className="ri-star-fill text-yellow-400 text-xs"></i>
            <span className="text-xs font-medium text-gray-700">{product.rating}</span>
            <span className="text-xs text-gray-500">({product.reviews})</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <i className="ri-map-pin-line text-xs"></i>
            <span className="truncate">{product.location}</span>
          </div>

          <div className="text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent pt-2">
            {product.price}
          </div>
        </div>
      </div>
    </Link>
  );
}