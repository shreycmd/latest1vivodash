import React from 'react';
import logo from "../assets/vivo logo.png";
import { DASHBOARD_SIDEBAR_LINKS } from './lib/const/navigation';
import { Link, useLocation } from 'react-router-dom';

const SidebarLinks = ({ item, currentPath }) => {
  // Check if the current path matches the link's path
  const isActive = currentPath === item.path;

  return (
    <Link
      to={item.path}
      className={`flex items-center p-2 hover:bg-gray-700 rounded ${isActive ? 'bg-gray-800' : ''}`}
    >
      <span className='text-xl'>{item.icon}</span>
      <span className='ml-2'>{item.label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation(); // Get the current location
  const currentPath = location.pathname; // Extract pathname from location

  return (
    <div className='flex flex-col bg-black w-60 p-3 text-white '>
      <div className='flex'>
        <img src={logo} className="h-20 w-32" alt='logo' />
      </div>
      <div className='flex-1'>
        {DASHBOARD_SIDEBAR_LINKS.map((item) => (
          <SidebarLinks key={item.key} item={item} currentPath={currentPath} /> 
        ))}
      </div>
      {/*<div>bottom part</div>*/}
    </div>
  );
};

export default Sidebar;
