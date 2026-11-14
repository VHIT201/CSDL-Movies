import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

//Types
import { HeaderSwiperProps } from "./lib/Type";

const HeaderSwiper: React.FC<HeaderSwiperProps> = ({ swipersData }) => {

  return (
    <Swiper
      loop
      autoplay={{ delay: 3000, disableOnInteraction: true }}
      className="w-full mb-0 p-0"
      
    >
      {swipersData[0].data.slice(0, 4).map((_, index) => (
        <SwiperSlide key={index}>
          
            
          
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeaderSwiper;
