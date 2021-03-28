export async function get() {
  return {
    headers: {
      'Set-Cookie': `refresh_token=; Max-Age=-1; HttpOnly`
    },
    body: {
      signed_out: true
    }
  };
}