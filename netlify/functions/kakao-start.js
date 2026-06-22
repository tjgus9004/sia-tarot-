exports.handler = async function(event) {
  const restApiKey = process.env.KAKAO_REST_API_KEY;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;

  if (!restApiKey || !redirectUri) {
    return { statusCode: 500, body: '환경변수 설정 필요' };
  }

  const state = Math.random().toString(36).slice(2) + Date.now().toString(36);

  const url = new URL('https://kauth.kakao.com/oauth/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', restApiKey);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  // scope 없음 = 앱에 설정된 동의항목만 사용 (KOE205 방지)

  return {
    statusCode: 302,
    headers: {
      Location: url.toString(),
      'Set-Cookie': `tarot_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
    },
    body: ''
  };
};
