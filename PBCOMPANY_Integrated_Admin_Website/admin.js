(() => {
  'use strict';
  const config = window.PBCOMPANY_AUTH_CONFIG || {};
  const client = window.supabase?.createClient && /^https:\/\/.+\.supabase\.co\/?$/.test(config.url || '') && config.publishableKey
    ? window.supabase.createClient(config.url, config.publishableKey) : null;
  const nav = document.getElementById('admin-nav');
  const dialog = document.getElementById('admin-dialog');
  const form = document.getElementById('admin-form');
  const status = document.getElementById('admin-status');
  const save = document.getElementById('admin-save');
  const keys = ['about_lead', 'about_p1', 'about_p2'];
  const ids = ['edit-about-lead', 'edit-about-p1', 'edit-about-p2'];
  let isAdmin = false;
  function say(s) { status.textContent = s; }
  function apply(rows) {
    for (const row of rows || []) {
      if (!keys.includes(row.key)) continue;
      const element = document.querySelector(`[data-site-content="${row.key}"]`);
      if (element) element.textContent = row.content;
    }
  }
  async function refreshContent() {
    if (!client) return;
    const {data,error} = await client.from('site_content').select('key,content').in('key',keys);
    if (error) { console.warn('회사소개를 불러올 수 없습니다:', error.message); return; }
    apply(data);
  }
  async function updateRole() {
    isAdmin = false;
    nav.hidden = true;
    if (!client) return;
    const {data:{user},error} = await client.auth.getUser();
    if (error || !user) { if (dialog.open) dialog.close(); return; }
    const result = await client.from('admin_accounts').select('user_id').eq('user_id',user.id).maybeSingle();
    isAdmin = !result.error && !!result.data;
    nav.hidden = !isAdmin;
    if (!isAdmin && dialog.open) dialog.close();
  }
  nav.addEventListener('click', async () => {
    await updateRole();
    if (!isAdmin) { alert('관리자 권한이 없습니다.'); return; }
    await refreshContent();
    keys.forEach((key,i) => { document.getElementById(ids[i]).value = document.querySelector(`[data-site-content="${key}"]`)?.textContent?.trim() || ''; });
    say(''); dialog.showModal();
  });
  document.getElementById('admin-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    await updateRole();
    if (!isAdmin) { say('관리자 권한이 없습니다.'); return; }
    save.disabled = true; say('저장 중...');
    try {
      // Each UPDATE is checked by Supabase Row Level Security.
      for (let i=0; i<keys.length; i++) {
        const content = document.getElementById(ids[i]).value.trim();
        if (!content) throw new Error('내용을 입력해 주세요.');
        const {data,error} = await client.from('site_content').update({content}).eq('key',keys[i]).select('key');
        if (error) throw error;
        if (!data?.length) throw new Error('저장 권한이 없거나 수정할 항목이 없습니다.');
      }
      await refreshContent(); say('저장되었습니다. 홈페이지에서 바로 확인할 수 있습니다.');
    } catch(err) { say(`저장 실패: ${err.message || '관리자 설정을 확인하세요.'}`); }
    finally { save.disabled = false; }
  });
  if (client) {
    refreshContent();
    client.auth.onAuthStateChange(() => { setTimeout(updateRole, 0); });
    updateRole();
  }
})();
