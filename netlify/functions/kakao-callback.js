exports.handler = async function(event) {
  const params = new URLSearchParams(event.rawQuery || '');
  const code = params.get('code');
  const state = params.get('state');

  const cookies = Object.fromEntries(
    (event.headers.cookie || '').split(';')
      .map(c => c.trim().split('='))
      .filter(([k]) => k)
      .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))])
  );

  if (!code || !state || state !== cookies.tarot_state) {
    return { statusCode: 302, headers: { Location: '/?auth=error' }, body: '' };
  }

  const restApiKey = process.env.KAKAO_REST_API_KEY;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;

  try {
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: restApiKey,
        redirect_uri: redirectUri,
        code,
        ...(clientSecret ? { client_secret: clientSecret } : {})
      })
    });
    const token = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(token.error_description || '토큰 오류');

    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${token.access_token}` }
    });
    const user = await userRes.json();

    const nickname = user.kakao_account?.profile?.nickname || user.properties?.nickname || '회원님';
    const avatar = user.kakao_account?.profile?.thumbnail_image_url || '';
    const userInfo = JSON.stringify({ name: nickname, avatar });

    return {
      statusCode: 302,
      headers: { Location: '/?auth=ok' },
      multiValueHeaders: {
        'Set-Cookie': [
          `tarot_user=${encodeURIComponent(userInfo)}; Path=/; SameSite=Lax; Max-Age=2592000`,
          `tarot_state=; Path=/; HttpOnly; Max-Age=0`
        ]
      },
      body: ''
    };
  } catch(e) {
    return { statusCode: 302, headers: { Location: `/?auth=error&msg=${encodeURIComponent(e.message)}` }, body: '' };
  }
};
