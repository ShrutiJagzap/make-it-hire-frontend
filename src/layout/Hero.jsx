import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <div>
      <section className="body-font dark:bg-gray-900 dark:text-gray-400 text-gray-600">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col 
          md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium dark:text-white text-gray-900">
            Welcome to MAKE-IT-HIRE, your AI-powered resume screening
            </h1>
            <p className="mb-8 leading-relaxed">
              We personalized interviews, and candidate evaluations. 
              Our platform streamlines your hiring process, reduces HR workload, and ensures fair, 
              data-driven decisions for selecting top talent.come to MAKE-IT-HIRE, your AI-powered 
              solution that revolutionizes junior-level recruitment by automating resume screening            
            </p>
            <div className="flex lg:flex-row md:flex-col">
              <Link to="/admin-register-login">
                <button className="cursor-pointer bg-gray-100 dark:bg-gray-800 
                inline-flex py-3 px-5 rounded-lg items-center hover:bg-gray-200 
                dark:hover:bg-gray-700 focus:outline-none">   
                  <span className="ml-4 flex items-start flex-col leading-none">
                    <span className="title-font font-medium pr-5">Register as Admin</span>
                  </span>
                </button>
              </Link>
              <Link to="/user-register-login">
                <button className="cursor-pointer bg-gray-100 dark:bg-gray-800 
                inline-flex py-3 px-5 rounded-lg items-center lg:ml-4 md:ml-0 
                ml-4 md:mt-4 mt-0 lg:mt-0 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none">
                  <span className="ml-4 flex items-start flex-col leading-none">
                    <span className="title-font font-medium mr-5">Login as User</span>
                  </span>
                </button>
              </Link>
            </div>
          </div>
          <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
            <img className="object-cover object-center rounded" alt="hero" src="/bot.jpg" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Hero;
