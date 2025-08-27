import React, { useState } from "react";
import HomeImage from "../images/hero.jpg";
import HeroImage from "../images/hero.jpg";
import HeroImage2 from "../images/hero.jpg";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { FaPlay } from "react-icons/fa";
import { GrYoga } from "react-icons/gr";
import { GiGymBag } from "react-icons/gi";
import { FaDumbbell } from "react-icons/fa6";

const slideFromLeft = (delay = 0.3) => ({
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0, transition: { delay, duration: 0.6 } },
});

const slideFromRight = (delay = 0.3) => ({
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { delay, duration: 0.6 } },
});

const BannerData = {
  tag: "CUSTOMIZE WITH YOUR SCHEDULE",
  title: "Personalized Professional Online Decoration Agent on Your Schedule",
  subtitle:
    "Our scheduling system allows you to select based on your free time. Keep track of how your house feels, your office, and the property at large — and never miss our service. The best online decoration scheduling system with easy accessibility.",
  link: "#",
};

const whyChooseData = [
  {
    id: 1,
    title: "One-on-One Teaching",
    desc: "All of our products and materials have lasting quality with diverse color-appealing power.",
    icon: <GrYoga />,
    bgColor: "#0063ff",
  },
  {
    id: 2,
    title: "24/7 Tutor Availability",
    desc: "Our tutors are always available to respond as quickly as possible for you.",
    icon: <FaDumbbell />,
    bgColor: "#73bc00",
  },
  {
    id: 3,
    title: "Interactive Whiteboard",
    desc: "Our digital online store is interactive and allows smooth running.",
    icon: <GiGymBag />,
    bgColor: "#fa6400",
  },
  {
    id: 4,
    title: "Affordable Prices",
    desc: "Choose a collective set of decorative items for your whole house to look smart.",
    icon: <GiGymBag />,
    bgColor: "#fe6baa",
  },
];

function Home() {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const handleCloseBanner = () => setIsBannerVisible(false);

  return (
    <>
      {/* Top Banner */}
      {isBannerVisible && (
        <motion.div
          className="bg-yellow-700 text-white py-4 text-center relative hidden lg:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <p className="text-lg">
            Are you looking for good quality e-learning services and intuitive education tools?
            <span className="font-bold ml-2">Talk to us!</span>
          </p>
          <button
            onClick={handleCloseBanner}
            className="absolute top-4 right-16 text-xl font-bold"
          >
            &times;
          </button>
        </motion.div>
      )}

      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-white-100 px-6">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-10 items-center">
          <motion.div className="space-y-5" variants={slideFromLeft()} initial="hidden" animate="visible">
            <span className="bg-orange-200 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
              eLearning Platform
            </span>
            <h1 className="text-4xl font-bold leading-tight">
              Smart Learning <br /> Deeper & More <br />
              <span className="text-orange-500">-Amazing</span>
            </h1>
            <p className="text-gray-600">
              Phosfluorescently deploy unique intellectual capital without enterprise–after bricks & clicks synergy. Enthusiastically
              revolutionize intuitive.
            </p>
            <div className="flex items-center gap-4">
              <button className="bg-green-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-600">
                Start Free Trial
              </button>
              <button className="flex items-center gap-2 text-gray-800 font-medium">
                <span className="w-8 h-8 flex items-center justify-center bg-gray-300 rounded-full">
                  <FaPlay className="text-sm" />
                </span>
                How it Works
              </button>
            </div>
          </motion.div>

          <motion.div
            className="relative w-full h-[500px] rounded-lg overflow-hidden flex justify-center items-center"
            variants={slideFromRight()}
            initial="hidden"
            animate="visible"
          >
            <img src={HomeImage} alt="E-learning" className="w-full h-full object-center" />
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-yellow-800 text-white py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 text-center">
          {[{ label: "Expert Tutors", value: 82 },
            { label: "Enrolled Learners", value: 800, suffix: "+" },
            { label: "Courses Available", value: 298, suffix: "+" },
            { label: "Completed Lessons", value: 73545, suffix: "+" }].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <p className="text-4xl font-bold">
                <CountUp start={0} end={item.value} duration={3} separator="," suffix={item.suffix || ""} />
              </p>
              <p className="mt-2 text-lg">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-white py-16 px-6">
        <div className="space-y-4 p-6 text-center">
          <h1 className="uppercase font-bold text-orange-600">Why Choose Us</h1>
          <p className="font-bold text-3xl max-w-[500px] mx-auto px-6 mb-5">
            Benefits of online tutoring services with us
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {whyChooseData.map((item) => (
            <motion.div
              key={item.id}
              variants={slideFromRight()}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 shadow-md flex flex-col items-center text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-lg flex justify-center items-center text-white" style={{ backgroundColor: item.bgColor }}>
                {item.icon}
              </div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Extra Banner Section 1 */}
      <div className='container mx-auto px-4 md:px-8 lg:px-16 h-auto lg:mt-24 flex flex-col lg:flex-row items-center lg:space-x-12'>
        <motion.img
          src={HeroImage}
          alt="Banner 1"
          className='w-full sm:w-[400px] lg:w-[500px] object-cover rounded-lg shadow-lg transition-transform transform hover:scale-105'
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, duration: 0.5 }}
        />
        <div className='w-full max-w-screen-lg px-4 py-8 bg-white border border-gray-300 lg:border-0 rounded-lg shadow-xl'>
          <motion.h2 className='text-3xl sm:text-4xl font-bold text-yellow-600' initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
            {BannerData.tag}
          </motion.h2>
          <motion.h1 className='text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-800 mt-4' initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            {BannerData.title}
          </motion.h1>
          <motion.p className='text-base sm:text-lg text-gray-600 mt-4' initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
            {BannerData.subtitle}
          </motion.p>
        </div>
      </div>

      {/* Extra Banner Section 2 */}
      <div className='container mx-auto px-4 md:px-8 lg:px-16 h-auto lg:mt-24 flex flex-col-reverse lg:flex-row items-center lg:space-x-12'>
        <div className='w-full max-w-screen-lg px-4 py-8 bg-white border border-gray-300 lg:border-0 rounded-lg shadow-xl'>
          <motion.h2 className='text-3xl sm:text-4xl font-bold text-yellow-600' initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
            {BannerData.tag}
          </motion.h2>
          <motion.h1 className='text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-800 mt-4' initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            {BannerData.title}
          </motion.h1>
          <motion.p className='text-base sm:text-lg text-gray-600 mt-4' initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
            {BannerData.subtitle}
          </motion.p>
        </div>
        <motion.img
          src={HeroImage2}
          alt="Banner 2"
          className='w-full sm:w-[400px] lg:w-[500px] object-cover rounded-lg shadow-lg transition-transform transform hover:scale-105'
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, duration: 0.5 }}
        />
      </div>
    </>
  );
}

export default Home;
