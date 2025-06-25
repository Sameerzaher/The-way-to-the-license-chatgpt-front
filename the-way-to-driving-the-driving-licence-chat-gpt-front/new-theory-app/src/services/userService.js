export async function fetchUserProgress() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${process.env.REACT_APP_API_URL}/progress/categories`, {
    headers: {
      "Authorization": token ? `Bearer ${token}` : undefined,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) throw new Error("Failed to fetch progress");
  return await res.json();
} 