# PBCOMPANY 통합 관리자 모드 설치

기존 PBCOMPANY 홈페이지 내 관리자 모드를 추가합니다. 별도 /admin 주소가 필요하지 않습니다.

1. 현재 GitHub/Netlify에 적용된 `auth-config.js`의 **정상 동작하는 URL과 Publishable Key**를 이 패키지의 동일 파일에 복사하세요. (ZIP 안의 auth-config.js는 보안상 예시 값입니다.)
2. Supabase > SQL Editor > New query에서 `SUPABASE_ADMIN_SETUP.sql` 내용을 실행합니다.
3. Supabase > Authentication > Users에서 관리자 본인 계정의 **User UID**를 복사하세요.
4. SQL Editor에 `insert into public.admin_accounts(user_id) values ('실제-UID') on conflict do nothing;` 을 실행하세요. 이메일이 아닌 UUID를 사용합니다. 다른 계정에 권한을 부여하지 마세요.
5. 프로젝트 파일(index.html, style.css, script.js, auth.js, admin.js, auth-config.js, assets/)을 기존 GitHub 저장소 최상위에 업로드합니다. SQL과 이 문서 파일은 공개 저장소에 업로드할 필요가 없습니다.
6. Netlify의 최신 배포가 Published인지 확인하고 https://pbtechcompany.com 에서 관리자 계정으로 로그인합니다. 상단 '관리자 모드' 버튼이 나타나면 클릭해 회사소개 3개 문단을 수정하고 저장하세요.
7. 일반 회원 계정으로 로그인하여 관리자 버튼이 나오지 않는지, DB 수정이 차단되는지 테스트하세요.

주의: 관리 화면 UI만 숨기는 것으로는 보안이 확보되지 않습니다. 이 버전은 데이터베이스 RLS로 수정 권한을 검사합니다. `admin_accounts` 쓰기 권한은 일반 사용자에게 부여하지 않았습니다. 관리자 권한 부여는 SQL Editor에서만 실행합니다. 사용자 전체 목록·탈퇴 처리 기능은 아직 포함되어 있지 않으며, 이를 구현하려면 별도의 보호된 Edge Function 및 권한 검증이 필요합니다.
