
import fetch from 'node-fetch'
export async function post({ body, headers }) {
  const { code, grant_type } = body ? JSON.parse(body) : {}

  function getCookie(name) {
    if(!headers.cookie) return null
    function escape(s) { return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, '\\$1'); }
    var match = headers.cookie.match(RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'));
    return match ? match[1] : null;
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: grant_type || 'refresh_token',
      code: code,
      refresh_token: getCookie('refresh_token'),
      redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    }
  })
  const { access_token, refresh_token, error } = await response.json()

  return {
    headers: {
      'Set-Cookie': `refresh_token=${refresh_token || getCookie('refresh_token')}; HttpOnly`
    },
    body: {
      access_token,
      error
    }
  };
}