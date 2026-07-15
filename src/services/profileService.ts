const API_URL = "http://127.0.0.1:8000";

export async function getProfile(name: string) {
  const response = await fetch(
    `${API_URL}/api/profile/${encodeURIComponent(name)}`
  );

  if (!response.ok) {
    throw new Error("Failed to load profile");
  }

  return response.json();
}