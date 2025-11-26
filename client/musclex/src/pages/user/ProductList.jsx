import React, { useState } from "react";
import { Navbar } from "../../components/user/Navbar";
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
const ProductList = () => {
  const { id } = useParams();
  const { data } = useProductListings(id);
  const [activeTab, setActiveTab] = useState("description");
  //   const product = useSelector((state) => state.product.variants);
  //   const currentProduct = product.filter((p) => p._id === id);
  console.log(data);
  //   console.log(product);
  return (
    <div className="">
      <Navbar />
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
