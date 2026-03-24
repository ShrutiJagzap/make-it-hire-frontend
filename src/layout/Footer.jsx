import React from 'react';

function Footer() {
  return (
    <div className="bg-slate-900 dark:bg-gray-950">
      <footer className="text-gray-600 dark:text-gray-400 body-font">
        <div className="container py-12 mx-auto">
          <div className="lg:w-1/4 md:w-1/2 w-full">
            <h2 className="title-font font-medium text-white dark:text-gray-300 
                          tracking-widest text-sm">
              SUBSCRIBE
            </h2>
            <div className="flex xl:flex-nowrap md:flex-nowrap lg:flex-wrap 
            flex-wrap justify-center items-end md:justify-start">
              <div className="relative w-40 sm:w-auto xl:mr-4 lg:mr-0 sm:mr-4 mr-2">
                <label htmlFor="footer-field" className="leading-7 
                   text-sm text-gray-600 dark:text-gray-400">
                  Enter your email
                  </label>
                <input type="email" id="footer-field" name="footer-field" placeholder="Your email" 
                className="w-[300px] bg-gray-100 dark:bg-gray-800  
                bg-opacity-50 rounded border border-gray-300 dark:border-gray-700 
                focus:bg-transparent focus:ring-2 focus:ring-indigo-200 
                focus:border-indigo-500 text-base outline-none text-gray-700
                dark:text-gray-300 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
              </div>
              <button className="lg:mt-2 xl:mt-0 flex-shrink-0 inline-flex 
              text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none 
              hover:bg-indigo-600 rounded">Subscribe</button>
            </div>
          </div>
          <div className="flex flex-wrap md:text-left text-center order-first mt-10">
            {["About Us", "Services", "Contact", "Blog"].map((category, index) => (
              <div key={index} className="lg:w-1/4 md:w-1/2 w-full px-4">
                <h2 className="title-font font-medium text-white dark:text-gray-300 
                tracking-widest text-sm mb-3">{category}</h2>
                <nav className="list-none">
                  <li>
                    <a className="text-white dark:text-gray-400 hover:text-gray-400">Learn More</a>
                  </li>
                </nav>
              </div>
            ))}
          </div>
        </div>
        {/* <div className="bg-gray-100 dark:bg-gray-800">
          <div className="container  py-6 mx-auto flex items-center sm:flex-row flex-col">
            <a className="flex title-font font-medium items-center 
            md:justify-start justify-center text-gray-900 dark:text-white">
              
              <span className="ml-3 text-xl">Make It Hire</span>
            </a>
            
            <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((platform, index) => (
                <a key={index} className="ml-3 text-gray-500 hover:text-indigo-500">
                  <i className={`fab fa-${platform} fa-lg`}></i>
                </a>
              ))}
            </span>
          </div>
        </div> */}
      </footer>
    </div>
  );
}

export default Footer;
