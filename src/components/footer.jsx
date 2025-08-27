// src/components/Footer.jsx
import React from "react";
import { FaFacebookF, FaTwitter, FaGooglePlusG, FaYoutube, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#0c2d57] text-white py-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-gray-500 pb-8">
          {/* Academics */}
          <div>
            <h3 className="font-bold mb-4">ACADEMICS</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <a href="#" className="hover:underline hover:text-white transition">Pre-school</a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-white transition">Lower Primary</a>
              </li>
            </ul>
          </div>

          {/* Tutorials */}
          <div>
            <h3 className="font-bold mb-4">AVAILABLE TUTORIALS</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:underline hover:text-white transition">Computer</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition">Integrated Science</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition">Mathematics</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition">Science and Technology</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition">Swahili</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition">Chemistry</a></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="font-bold mb-4">USEFUL LINKS</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:underline hover:text-white transition">Academics</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition">Feedback</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition">Tutorials</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition">Contact us</a></li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div>
            <h3 className="font-bold mb-4">GET IN TOUCH</h3>
            <p className="text-gray-300 text-sm">
              Address: Shabaab – Kenlands, Off Kenlands Relax inn <br />
              P.O BOX 12252 – 20100, Nakuru
            </p>
            <p className="text-gray-300 text-sm mt-2">
              Phone: (+254) 757 068 601 (+254) 788 076 402
            </p>
            <p className="text-gray-300 text-sm mt-2">
              Email: <a href="mailto:info@classBOOK.co.ke" className="hover:underline hover:text-white transition">info@classBOOK.co.ke</a>
            </p>
          </div>
        </div>

        {/* Downloads & Social */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Downloads */}
          <div>
            <h3 className="font-bold mb-4">DOWNLOADS</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:underline hover:text-white transition">Application Form</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition">Admission Requirements</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition">Fees Structure</a></li>
            </ul>
          </div>

          {/* Empty space for alignment */}
          <div></div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold mb-4">SOCIAL MEDIA</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition"><FaFacebookF /></a>
              <a href="#" className="text-gray-300 hover:text-white transition"><FaTwitter /></a>
              <a href="#" className="text-gray-300 hover:text-white transition"><FaGooglePlusG /></a>
              <a href="#" className="text-gray-300 hover:text-white transition"><FaYoutube /></a>
              <a href="#" className="text-gray-300 hover:text-white transition"><FaWhatsapp /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Signature */}
      <div className="bg-[#0a2445] text-center text-gray-400 text-sm py-4 mt-8 border-t border-gray-600">
        © 2025 Doane The Computer Geek. All rights reserved. <a href="#" className="hover:underline hover:text-white transition">Privacy Policy</a>.
      </div>
    </footer>
  );
};

export default Footer;
