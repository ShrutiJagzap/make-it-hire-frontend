import API_CONFIG from './apiConfig'
const API = `${API_CONFIG.backend}/api/jobs`;

export const createJob = async(job)=>{

 const res = await fetch(`${API}/create`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(job)
 });

 return res.json();

};

export const getJobs = async()=>{

 const res = await fetch(API);
 return res.json();

};

export const getJob = async(id)=>{

 const res = await fetch(`${API}/${id}`);
 return res.json();

};