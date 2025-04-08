import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BsCart } from "react-icons/bs";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";

function Header() {
  const [isSideMenuOpen, setMenu] = useState(false);

  return (
    <nav className="flex items-center justify-between w-screen px-6 py-4 relative bg-white shadow-md font-[Poppins] lg:px-10">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Icon */}
        <IoMdMenu onClick={() => setMenu(true)} className="text-3xl lg:hidden" />
        
        {/* Logo (Empty Source as requested) */}
        <div className="flex">
          <img src="" alt="Logo" className="rounded-full w-12 h-12 bg-black mr-2" />
          <h2 className="text-black font-bold text-3xl">
            <span className="text-black">class</span>
            <span className="text-yellow-800">BOOK</span>
          </h2>
        </div>
      </div>

      {/* Navbar Links for Large Screens */}
      <div className="hidden lg:flex text-xl text-black font-[Poppins]">
        <ul className="flex items-center space-x-20">
          <li>
            <Link to="/" className="hover:text-yellow-500">HOME</Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-yellow-500">ABOUT US</Link>
          </li>
          <li>
            <Link to="/services" className="hover:text-yellow-500">SERVICES</Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-yellow-500">CONTACT US</Link>
          </li>
        </ul>
      </div>

      {/* Cart Icon */}
      <div className="flex items-center justify-center gap-4">
        <Link to="/cart" className="relative hidden lg:flex ">
          <CiSearch className="text-3xl text-yellow-800/100" />
        </Link>

        {/* Sign In and Register Buttons (Only visible in mobile view) */}
        <div className="hidden lg:flex gap-4"> {/* Hide on large screens */}
          <Link to="/signin" className="bg-darkblue text-white rounded-full px-4 py-2 text-sm bg-blue-700">
            Sign In
          </Link>
          <Link to="/register" className="bg-darkgreen text-white rounded-full px-4 py-2 text-sm bg-green-700">
            Register
          </Link>
        </div>
      </div>

      {/* Mobile Side Menu */}
      {isSideMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="bg-white w-64 h-full p-4 border border-gray-300 shadow-lg rounded-lg">
            <IoMdClose className="text-3xl mb-4" onClick={() => setMenu(false)} />
            <ul className="space-y-6 text-xl text-black">
              <li>
                <Link to="/" onClick={() => setMenu(false)} className="border-b border-gray-300 p-2 rounded">HOME</Link>
              </li>
              <li>
                <Link to="/about" onClick={() => setMenu(false)} className="border-b border-gray-300 p-2 rounded">ABOUT US</Link>
              </li>
              <li>
                <Link to="/services" onClick={() => setMenu(false)} className="border-b border-gray-300 p-2 rounded">SERVICES</Link>
              </li>
              <li>
                <Link to="/contact" onClick={() => setMenu(false)} className="border-b border-gray-300 p-2 rounded">CONTACT US</Link>
              </li>

              {/* Sign In and Register Buttons (Visible only in mobile side menu) */}
              <li className="mt-auto">
                <Link to="/signin" onClick={() => setMenu(false)} className="border-b border-gray-300 p-2 rounded bg-blue-700 text-white text-center w-full">Sign In</Link>
              </li>
              <li>
                <Link to="/register" onClick={() => setMenu(false)} className="border-b border-gray-300 p-2 rounded bg-green-700 text-white text-center w-full">Register</Link>
              </li>
              <li>
              <Link to="/cart" className="relative">
          <CiSearch className="text-3xl text-yellow-800/100" />
        </Link>
              </li>
            </ul>
          </div>
          <div className="flex-1" onClick={() => setMenu(false)} />
        </div>
      )}
    </nav>
  );
}

export default Header;
