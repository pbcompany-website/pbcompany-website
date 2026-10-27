# PBCOMPANY 로그인·회원가입 설정 안내

이 파일 묶음은 기존 PBCOMPANY 회사소개 사이트에 로그인/가입 UI와 Supabase Auth 연동을 추가한 버전입니다. **Supabase 키를 설정하기 전에는 실제 회원가입이 동작하지 않습니다.**

1. https://supabase.com/dashboard 접속 → New project 생성
2. Authentication → Providers (또는 Sign In / Providers) → Email 활성화, Confirm email 활성화 권장
3. Authentication → URL Configuration
   - Site URL: https://pbtechcompany.com
   - Redirect URLs: https://pbtechcompany.com/**, 필요하면 https://www.pbtechcompany.com/**
4. Project Settings → API Keys에서 Project URL / Publishable key 조회
5. auth-config.js에 url과 publishableKey 붙여넣기 (공개용 publishable 또는 anon key만 사용, **service_role 및 secret key 사용 금지**)
6. 이 폴더 안의 index.html, style.css, script.js, auth-config.js, auth.js 및 assets 폴더를 GitHub 저장소 최상위에 업로드/커밋. Netlify 연결 배포가 완료되면 홈페이지에서 가입/로그인 테스트
7. 가입 시 이메일 인증 링크 클릭 → 로그인 → 로그아웃 → 비밀번호 재설정 메일 수신 순으로 점검

* 정적 사이트이므로 로그인 자체로 관리자 전용 보안 기능은 구현되지 않습니다. 회원 전용 데이터·페이지가 필요하면 서버 측 접근제어 및 Supabase RLS 정책을 추가해야 합니다. 단순히 화면에서 요소를 숨기는 것은 보호가 아닙니다.
* Supabase 기본 발신 메일은 테스트용 제한이 있으므로 실제 서비스 시작 전 Custom SMTP 연결을 권장합니다.
* 운영 전 개인정보 처리방침, 수집 목적·보유기간, 회원탈퇴 및 개인정보 삭제 절차를 마련하세요.
* 소스 저장소에서 실제 고객 비밀번호를 저장하지 마세요.
