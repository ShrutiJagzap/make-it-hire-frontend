import { useNavigate } from "react-router-dom";
import React from "react";

export default function JobCard({job}){

 const navigate = useNavigate();

 return(
<section className="text-black bg-gray-400 body-font">
 <div className="container px-5 mx-auto flex flex-col">
  <div className="lg:w-4/6 mx-auto">

   <div className="flex flex-col sm:flex-row">

    <div className="sm:w-2/3 sm:pl-8 sm:py-8 
    sm:border-l border-gray-200 border-t mt-4 pt-4">

      <h1 className="font-medium text-gray-900 text-3xl">
       {job.jobTitle}
      </h1>

      <div className="w-80 h-1 bg-indigo-500 rounded mt-2 mb-4"></div>

      <p className="leading-relaxed text-lg mb-4">
       {job.description.slice(0,150)}...
      </p>

      <button
      onClick={()=>navigate(`/job/${job.id}`)}
      className="border-2 rounded-2xl px-4 py-2 text-indigo-500"
      >
      Learn More →
      </button>

    </div>

   </div>

  </div>
 </div>
</section>
 );
}