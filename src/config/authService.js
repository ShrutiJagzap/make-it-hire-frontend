
const BASE_URL = "http://localhost:8081/api/auth";

export const registerUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.message;
};

export const loginUser = async (loginData) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
};

export const fetchUserProfile = async (userId) => {
  try{
    const res = await fetch(`${BASE_URL}/profile/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch profile");
    }
    const data = await res.json();
    console.log("Fetched user profile:", data);
    return data;

  }catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
  
};

