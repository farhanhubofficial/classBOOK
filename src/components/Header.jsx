import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BsCart } from "react-icons/bs";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { GiSpellBook } from "react-icons/gi";

function Header() {
  const [isSideMenuOpen, setMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between w-full px-6 py-4 bg-white shadow-md font-[Poppins] lg:px-10">
      {/* Logo */}
      <div className="flex items-center gap-2 text-green-600 text-2xl font-bold">
        <GiSpellBook /> classBOOK
      </div>

      {/* Navbar Links for Large Screens */}
      <div className="hidden lg:flex text-black font-[Poppins]">
        <ul className="flex items-center space-x-20">
          <li>
            <Link to="/" className="hover:text-yellow-500">Home1</Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-yellow-500">About Us</Link>
          </li>
          <li>
            <Link to="/services" className="hover:text-yellow-500">Services</Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-yellow-500">Contact Us</Link>
          </li>
        </ul>
      </div>

      {/* Right Section: Cart & Menu */}
      <div className="flex items-center gap-4">
        {/* Sign In & Register (Only visible on large screens) */}
        <div className="hidden lg:flex gap-4">
          <Link to="/login" className="bg-blue-700 text-white rounded-full px-4 py-2 text-sm">
            Sign In
          </Link>
          <Link to="/signup" className="bg-green-700 text-white rounded-full px-4 py-2 text-sm">
            Register
          </Link>
        </div>

        {/* Mobile Menu Icon */}
        <IoMdMenu onClick={() => setMenu(true)} className="text-3xl lg:hidden" />
      </div>

      {/* Mobile Side Menu (Opens from the Right) */}
      {isSideMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Sidebar */}
          <div className="bg-white w-64 h-full p-4 shadow-lg absolute right-0 border-l border-gray-300">
            <IoMdClose className="text-3xl mb-4" onClick={() => setMenu(false)} />
            <ul className="space-y-6 text-black">
              <li>
                <Link to="/" onClick={() => setMenu(false)} className="border-b border-gray-300 p-2 rounded">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={() => setMenu(false)} className="border-b border-gray-300 p-2 rounded">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" onClick={() => setMenu(false)} className="border-b border-gray-300 p-2 rounded">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={() => setMenu(false)} className="border-b border-gray-300 p-2 rounded">
                  Contact Us
                </Link>
              </li>

              {/* Sign In & Register Buttons (Only in Mobile Menu) */}
              <li className="mt-auto">
                <Link to="/login" onClick={() => setMenu(false)} className="border-b border-gray-300 p-2 rounded bg-blue-700 text-white text-center w-full">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" onClick={() => setMenu(false)} className="border-b border-gray-300 p-2 rounded bg-green-700 text-white text-center w-full">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Background overlay (closes menu when clicked) */}
          <div className="flex-1 bg-black bg-opacity-50" onClick={() => setMenu(false)} />
        </div>
      )}
    </nav>
  );
}

export default Header;
