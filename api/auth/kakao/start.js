module.exports = async (req, res) => {
  const restApiKey = process.env.KAKAO_REST_API_KEY;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;

  if (!restApiKey || !redirectUri) {
    return res.status(500).send('환경변수 설정 필요');
  }

  const state = Math.random().toString(36).slice(2) + Date.now().toString(36);

  const url = new URL('https://kauth.kakao.com/oauth/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', restApiKey);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);

  res.setHeader('Set-Cookie', `tarot_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`);
  res.redirect(302, url.toString());
};
