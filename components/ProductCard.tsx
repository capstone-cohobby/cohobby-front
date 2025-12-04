
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, deletePost, toggleLike, checkLikeStatus } from '../lib/api';

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
  userId?: number | null;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUserId(user.id);
        // 좋아요 상태 확인
        try {
          const liked = await checkLikeStatus(Number(product.id));
          setIsLiked(liked);
        } catch (error) {
          // 좋아요 상태 확인 실패 (로그인하지 않았거나 에러)
          setIsLiked(false);
        }
      } catch (error) {
        // 로그인하지 않은 경우
        setCurrentUserId(null);
        setIsLiked(false);
      }
    };
    fetchCurrentUser();
  }, [product.id]);

  const isMyPost = currentUserId !== null && product.userId !== null && currentUserId === product.userId;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('정말 이 게시물을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await deletePost(Number(product.id));
      alert('게시물이 삭제되었습니다.');
      router.refresh();
    } catch (error) {
      console.error('게시물 삭제 실패:', error);
      alert('게시물 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentUserId === null) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (isTogglingLike) {
      return; // 이미 처리 중이면 무시
    }

    try {
      setIsTogglingLike(true);
      const newLikeStatus = await toggleLike(Number(product.id));
      console.log('좋아요 상태 변경:', newLikeStatus, '이전 상태:', isLiked);
      setIsLiked(newLikeStatus);
      // 상태 업데이트 확인
      setTimeout(() => {
        console.log('업데이트된 좋아요 상태:', newLikeStatus);
      }, 100);
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      alert('좋아요 처리에 실패했습니다.');
    } finally {
      setIsTogglingLike(false);
    }
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 md:p-5 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="relative mb-3 md:mb-4 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center h-40 md:h-52">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-contain"
          />
          
          <div className="absolute top-2 left-2">
            {product.available ? (
              <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                대여가능
              </span>
            ) : (
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                대여 불가
              </span>
            )}
          </div>
          
          {isMyPost ? (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg cursor-pointer disabled:opacity-50"
            >
              <i className="ri-delete-bin-line text-gray-600 text-sm hover:text-red-500 transition-colors duration-300"></i>
            </button>
          ) : (
            <button
              onClick={handleLikeClick}
              disabled={isTogglingLike}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg cursor-pointer disabled:opacity-50"
            >
              <i className={`${isLiked ? 'ri-heart-fill' : 'ri-heart-line'} text-sm transition-colors duration-300 ${
                isLiked ? 'text-red-500' : 'text-gray-600'
              } hover:text-red-500`}></i>
            </button>
          )}
        </div>

        <div className="space-y-2 md:space-y-2.5">
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
              <i className="ri-user-fill text-white text-xs"></i>
            </div>
            <span className="text-xs md:text-sm font-medium text-gray-700 truncate">{product.owner}</span>
            {product.verified && (
              <div className="w-4 h-4 md:w-5 md:h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <i className="ri-check-fill text-white text-xs"></i>
              </div>
            )}
          </div>

          <h3 className="font-bold text-gray-800 text-sm md:text-base leading-tight line-clamp-2">{product.title}</h3>

          <div className="flex items-center gap-1">
            <i className="ri-star-fill text-yellow-400 text-xs md:text-sm"></i>
            <span className="text-xs md:text-sm font-medium text-gray-700">{product.rating === 0 ? 4.5 : product.rating}</span>
            <span className="text-xs md:text-sm text-gray-500">({product.reviews})</span>
          </div>

          <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500">
            <i className="ri-map-pin-line"></i>
            <span className="truncate">{product.location}</span>
          </div>

          <div className="text-sm md:text-base font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent pt-2">
            {product.price}
          </div>
        </div>
      </div>
    </Link>
  );
}