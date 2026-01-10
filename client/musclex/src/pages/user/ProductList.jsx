import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useProductListings } from "../../hooks/users/useProductListings";
import ProductListCard from "../../components/user/ProductListCard";
import { useSelector } from "react-redux";
import RelatedProduct from "../../components/user/RelatedProduct";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Footer from "../../components/user/Footer";
import { NavbarListingProduct } from "../../components/user/NavbarListingProduct";
const ProductList = () => {
  const { id } = useParams();
  const { data, isLoading } = useProductListings(id);
  const [activeTab, setActiveTab] = useState("description");
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavbarListingProduct />

        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
            <p className="text-gray-500 text-sm">Loading product...</p>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  if (!data || !data.product) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavbarListingProduct />

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              Product not found
            </h1>

            <p className="text-gray-500 mb-6">
              The product you’re looking for doesn’t exist or may have been
              removed.
            </p>

            <a
              href="/"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Return to Home
            </a>
          </div>
        </div>

        <Footer />
      </div>
    );
  }
  return (
    <div className="">
      <NavbarListingProduct />
      <div className="px-96">
        <section className="flex items-center justify-center p-10">
          <ProductListCard data={data} />
        </section>
        <section className="p-10">
          <div className="flex items-start gap-10 border-b border-gray-200 pb-2">
            {["description", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`capitalize font-mono font-bold transition-colors duration-200 ${
                  activeTab === tab
                    ? "text-purple-800 border-b-2 border-purple-800"
                    : "text-gray-700 hover:text-purple-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="mt-4 text-gray-800">
            {activeTab === "description" && (
              <p className="leading-relaxed">
                {data?.product?.description || "No description available."}
              </p>
            )}

            {activeTab === "reviews" && (
              <div className="text-gray-600">
                <p>Coming soon...</p>
              </div>
            )}
          </div>
        </section>
        {/*related products */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Related Products
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                You might also like these products
              </p>
            </div>

            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={180}
              slidesPerView={5}
              navigation
              pagination={{ clickable: true }}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              loop={true}
              breakpoints={{
                320: { slidesPerView: 1.5 },
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
              }}
              className="pb-12"
            >
              {data?.relatedProducts?.map((item, index) => (
                <SwiperSlide key={index}>
                  <RelatedProduct data={item} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ProductList;
