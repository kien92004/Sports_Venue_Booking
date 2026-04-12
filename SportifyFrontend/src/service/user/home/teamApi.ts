const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
// API for TeamPage
export async function fetchTeamDetail(teamId: number) {
  const res = await fetch(`${URL_BACKEND}/api/user/team/teamdetail/${teamId}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}

export async function createTeam(data: FormData) {
  const res = await fetch(`${URL_BACKEND}/api/user/team/createTeam`, {
    method: "POST",
    body: data,
    credentials: "include",
  });
  return res.json();
}

export async function fetchTeams() {
  const res = await fetch(`${URL_BACKEND}/api/user/team`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json();
}
