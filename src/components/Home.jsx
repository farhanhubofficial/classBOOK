import React from "react";
import HomeImage from "../images/elearn-removebg-preview.png";

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 px-6">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-10 items-center">
        {/* Left Content */}
        <div className="space-y-5">
          <span className="bg-orange-200 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
            eLearning Platform
          </span>
          <h1 className="text-4xl font-bold leading-tight">
            Smart Learning <br /> Deeper & More <br />
            <span className="text-orange-500">-Amazing</span>
          </h1>
          <p className="text-gray-600">
            Phosfluorescently deploy unique intellectual capital without enterprise–after bricks & clicks synergy.
            Enthusiastically revolutionize intuitive.
          </p>
          <div className="flex items-center gap-4">
            <button className="bg-green-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-600">
              Start Free Trial
            </button>
            <button className="flex items-center gap-2 text-gray-800 font-medium">
              <span className="w-8 h-8 flex items-center justify-center bg-gray-300 rounded-full">▶</span>
              How it Works
            </button>
          </div>
        </div>

        {/* Right Side - Image (Styled to Match Screenshot) */}
        <div className="relative w-full h-[500px] rounded-lg overflow-hidden flex justify-center items-center">
          <img
            src={HomeImage}
            alt="E-learning"
            className="w-full h-full  object-center"
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
