import React from 'react';
import Banner from '../../layout/Banner';
import Content from '../../layout/Content';
const HomePage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Banner - Hero Section */}
      <Banner />
      
      {/* Content - Vehicle Cards */}
      <Content />
    </div>
  );
};

export default HomePage;
