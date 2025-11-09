import React from "react";
import "./Footer.css"; // Optional styling

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        &copy; {new Date().getFullYear()} HerSync – Period Tracker & Care App
      </p>
    </footer>
  );
};

export default Footer;
