(() => {
  'use strict';
  const cfg = window.PBCOMPANY_AUTH_CONFIG || {};
  const configured = /^https:\/\/[^\s]+\.supabase\.co\/?$/.test(cfg.url) &&
    /^(sb_publishable_|eyJ)/.test(cfg.publishableKey || '');
  const client = configured && window.supabase?.createClient
    ? window.supabase.createClient(cfg.url, cfg.publishableKey) : null;
  const dialog = document.getElementById('auth-dialog');
  const form = document.getElementById('auth-form');
  const msg = document.getElementById('auth-message');
  const submit = document.getElementById('auth-submit');
  const title = document.getElementById('auth-title');
  const description = document.getElementById('auth-description');
  const passwordWrap = document.getElementById('auth-password-wrap');
  const confirmWrap = document.getElementById('auth-password-confirm-wrap');
  const forgot = document.getElementById('forgot-password');
  const email = document.getElementById('auth-email');
  const password = document.getElementById('auth-password');
  const confirm = document.getElementById('auth-password-confirm');
  const loginNav = document.getElementById('login-nav');
  const signupNav = document.getElementById('signup-nav');
  const logoutNav = document.getElementById('logout-nav');
  const userEmail = document.getElementById('user-email');
  let mode = 'login';
  let pending = false;
  const labels = {
    login: ['로그인','PBCOMPANY 계정으로 로그인하세요.'],
    signup: ['회원가입','이메일 인증 후 로그인할 수 있습니다.'],
    reset: ['비밀번호 찾기','비밀번호 재설정 이메일을 발송합니다.'],
    update: ['새 비밀번호 설정','사용할 새 비밀번호를 입력하세요.']
  };
  function showMessage(text, type='info') { msg.textContent=text; msg.className='auth-message '+type; }
  function setMode(next) {
    mode=next; form.reset(); showMessage('');
    title.textContent=labels[next][0]; description.textContent=labels[next][1];
    document.getElementById('auth-tabs').hidden = next === 'reset' || next === 'update';
    document.getElementById('tab-login').classList.toggle('active',next==='login');
    document.getElementById('tab-signup').classList.toggle('active',next==='signup');
    passwordWrap.hidden = next === 'reset';
    confirmWrap.hidden = next === 'signup' || next === 'update' ? false : true;
    email.parentElement.querySelector('label[for="auth-email"]').hidden = next === 'update';
    email.hidden=next==='update';
    email.required=next!=='update';
    password.autocomplete=next==='login'?'current-password':'new-password';
    password.required=next!=='reset';
    confirm.required=next==='signup'||next==='update';
    submit.textContent = next==='reset'?'재설정 메일 보내기': next==='update'?'비밀번호 변경': labels[next][0];
    forgot.hidden=next!=='login';
    if(!client) showMessage('아직 인증 서비스가 연결되지 않았습니다. auth-config.js에 Supabase 정보를 입력해 주세요.','error');
  }
  function open(modeToOpen) { setMode(modeToOpen); if(!dialog.open) dialog.showModal(); }
  function close() { dialog.close(); if(location.hash==='#reset-password') history.replaceState(null,'',location.pathname); }
  document.querySelectorAll('[data-auth-open]').forEach(button => button.addEventListener('click',()=>open(button.dataset.authOpen)));
  document.getElementById('auth-close').addEventListener('click',close);
  dialog.addEventListener('click',e=>{if(e.target===dialog) close();});
  document.getElementById('tab-login').addEventListener('click',()=>setMode('login'));
  document.getElementById('tab-signup').addEventListener('click',()=>setMode('signup'));
  forgot.addEventListener('click',()=>setMode('reset'));
  function readableError(error) {
    const msg=String(error?.message||'요청에 실패했습니다. 다시 시도해 주세요.');
    if(/invalid login credentials/i.test(msg)) return '이메일 또는 비밀번호가 올바르지 않습니다.';
    if(/email not confirmed/i.test(msg)) return '이메일 인증을 완료한 후 로그인해 주세요.';
    if(/rate limit/i.test(msg)) return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
    if(/password should be at least/i.test(msg)) return '비밀번호를 8자 이상 입력하세요.';
    return '요청 처리 중 오류가 발생했습니다. 입력 정보와 인증 서비스 설정을 확인해 주세요.';
  }
  function renderSession(session) {
    const signed=!!session?.user;
    loginNav.hidden=signed; signupNav.hidden=signed;
    logoutNav.hidden=!signed; userEmail.hidden=!signed;
    userEmail.textContent=signed?(session.user.email||'회원'):'';
  }
  logoutNav.addEventListener('click',async()=> {
    if (!client) return;
    logoutNav.disabled=true;
    const {error}=await client.auth.signOut();
    logoutNav.disabled=false;
    if(error) alert('로그아웃에 실패했습니다. 다시 시도해 주세요.');
  });
  form.addEventListener('submit',async(e)=> {
    e.preventDefault();
    if(pending) return;
    if(!client) {showMessage('Supabase 프로젝트 연결 설정이 필요합니다.','error');return;}
    if(!form.reportValidity()) return;
    if(['signup','update'].includes(mode) && password.value !== confirm.value) {showMessage('비밀번호 확인이 일치하지 않습니다.','error');return;}
    if(mode !== 'reset' && password.value.length < 8) {showMessage('비밀번호를 8자 이상 입력하세요.','error');return;}
    pending=true; submit.disabled=true; showMessage('처리 중입니다...');
    try {
      let result;
      if(mode==='login') result=await client.auth.signInWithPassword({email:email.value.trim(),password:password.value});
      else if(mode==='signup') result=await client.auth.signUp({email:email.value.trim(),password:password.value,options:{emailRedirectTo:location.origin+location.pathname}});
      else if(mode==='reset') result=await client.auth.resetPasswordForEmail(email.value.trim(),{redirectTo:location.origin+location.pathname+'#reset-password'});
      else result=await client.auth.updateUser({password:password.value});
      if(result.error) throw result.error;
      if(mode==='login') {showMessage('로그인되었습니다.','success'); setTimeout(()=>{if(dialog.open) close();},600);}
      if(mode==='signup') {showMessage(result.data?.session?'회원가입과 로그인이 완료되었습니다.':'가입 요청이 접수되었습니다. 이메일 인증 링크를 확인해 주세요.','success');}
      if(mode==='reset') showMessage('계정이 존재하면 비밀번호 재설정 메일이 발송됩니다. 이메일을 확인해 주세요.','success');
      if(mode==='update') {showMessage('비밀번호가 변경되었습니다.','success'); history.replaceState(null,'',location.pathname);}
    } catch(err) {showMessage(readableError(err),'error');}
    finally {pending=false; submit.disabled=false;}
  });
  if(client) {
    client.auth.onAuthStateChange((event,session)=>{
      renderSession(session);
      if(event==='PASSWORD_RECOVERY') open('update');
    });
    client.auth.getSession().then(({data})=>renderSession(data?.session)).catch(()=>renderSession(null));
  }
})();
