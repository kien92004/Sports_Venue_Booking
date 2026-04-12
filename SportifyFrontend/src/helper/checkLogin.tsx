
// utils/auth.ts

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

export async function checkLogin(): Promise<{ loggedIn: boolean, username?: string, role?: string }> {
  try {
    const response = await fetch(`${URL_BACKEND}/api/user/rest/security/authentication`, {
      method: "GET",
      credentials: "include"
    });

    if (!response.ok) {
      return { loggedIn: false };
    }
    const data = await response.json();
    return {
      loggedIn: data.loggedIn ?? false,
      username: data.username ?? null,
      role: data.roles?.roles?.rolename ?? null,

    };
  } catch (error) {
    console.error("Error checking login:", error);
    return { loggedIn: false };
  }
}
