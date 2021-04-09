import fetch from 'node-fetch'

export async function getContext({ headers, path }) {
  function getCookie(name) {
    if(!headers.cookie) return null
    function escape(s) { return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, '\\$1'); }
    var match = headers.cookie.match(RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'));
    return match ? match[1] : null;
  }

  if(getCookie('refresh_token') || path.indexOf('.json') === -1) {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: getCookie('refresh_token'),
        redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      }
    })
    const { access_token } = await response.json()
    console.log('access_token')
    console.log(access_token)
    const data = await fetch(
      'https://api.spotify.com/v1/me',
      { 'headers': {'Authorization': 'Bearer ' + access_token } }
    )
    const dataJSON = await data.json()

    return dataJSON
  }
  return {
    user: {}
  };
}

export async function getSession({ context }) {
  console.log('context')
  console.log(context)

  return context
}
