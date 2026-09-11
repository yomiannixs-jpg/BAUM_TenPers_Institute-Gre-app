
(function(){
  const NAV = [
    ["⌂","App Home","index.html","home"],
    ["▥","Student Dashboard","student.html","student"],
    ["▤","Test Center","test.html","test"],
    ["▦","Navigation Hub","navigation.html","navigation"],
    ["▱","Study Library","study.html","study"],
    ["▧","Offline Textbooks","textbooks.html","textbooks"],
    ["↗","Performance Tracker","performance.html","performance"],
    ["▥","Institutional Platform","institution.html","institution"],
    ["♢","Question Security","security.html","security"],
    ["○","Cloud Account","account.html","account"]
  ];
  const STORE_KEY='baumSidebarCollapsed';

  function currentKey(){
    const p=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    if(p==='index.html'||p==='') return 'home';
    if(p==='student.html') return 'student';
    if(['test.html','timed.html','cbt.html','practice.html','simulation.html'].includes(p)) return 'test';
    if(p==='navigation.html') return 'navigation';
    if(p==='study.html') return 'study';
    if(p==='textbooks.html') return 'textbooks';
    if(p==='performance.html') return 'performance';
    if(p==='institution.html') return 'institution';
    if(p==='security.html') return 'security';
    if(p==='account.html') return 'account';
    return '';
  }

  function exportProgress(){
    const keys=[
      'baumGreCurrentUser','baumAnalyticsHistory','baumSkillStats','baumDifficultyStats',
      'baumInstitutionAssignments','baumGreTargetScore','baumGreTestDate','baumLastCloudSync'
    ];
    const data={exportedAt:new Date().toISOString()};
    keys.forEach(k=>{try{data[k]=JSON.parse(localStorage.getItem(k))}catch(e){data[k]=localStorage.getItem(k)}});
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download='BAUM_GRE_Progress.json';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),500);
  }

  function setCollapsed(collapsed, persist=true){
    document.body.classList.toggle('bt-shell-collapsed',!!collapsed);
    const btn=document.getElementById('btSidebarCollapse');
    if(btn){
      btn.textContent=collapsed?'›':'‹';
      btn.title=collapsed?'Open menu':'Close menu';
      btn.setAttribute('aria-label',collapsed?'Open menu':'Close menu');
      btn.setAttribute('aria-expanded',collapsed?'false':'true');
    }
    if(persist){
      try{localStorage.setItem(STORE_KEY,collapsed?'1':'0')}catch(e){}
    }
    window.dispatchEvent(new CustomEvent('baum-sidebar-change',{detail:{collapsed:!!collapsed}}));
  }

  function toggleCollapsed(){
    setCollapsed(!document.body.classList.contains('bt-shell-collapsed'));
  }

  function loadInitialState(){
    // Default CLOSED on first use so dashboards/modals get maximum width.
    let collapsed=true;
    try{
      const v=localStorage.getItem(STORE_KEY);
      if(v==='0') collapsed=false;
      if(v==='1') collapsed=true;
    }catch(e){}
    setCollapsed(collapsed,false);
  }

  function build(){
    if(document.getElementById('btGlobalSidebar')) return;
    loadInitialState();
    const active=currentKey();
    const aside=document.createElement('aside');
    aside.id='btGlobalSidebar';
    aside.className='bt-global-sidebar';
    aside.innerHTML=`
      <div class="bt-sidebar-top">
        <div class="bt-global-brand">BAUM TenPers<br>GRE 330+<small>Study • Practice • Test</small></div>
        <div class="bt-brand-mini">BT</div>
        <button id="btSidebarCollapse" class="bt-collapse-btn" type="button" aria-label="Close menu" aria-expanded="true">‹</button>
      </div>
      <nav class="bt-global-nav">
        ${NAV.map(([ico,label,href,key])=>`<a href="${href}" data-label="${label}" title="${label}" class="${active===key?'bt-active':''}"><span class="bt-global-ico">${ico}</span><span class="bt-global-label">${label}</span></a>`).join('')}
      </nav>
      <div class="bt-cloud-card">
        <span class="bt-cloud-pill">☁ CLOUD ACCOUNT</span>
        <h4>Student Sync & Account Portability</h4>
        <div class="bt-cloud-status">● Online — cloud connected</div>
        <p>Your GRE profile is prepared for secure cross-device synchronization. Local progress remains available.</p>
        <button class="bt-export" id="btExportProgress">Export My Progress</button>
      </div>`;
    document.body.appendChild(aside);

    aside.querySelector('#btSidebarCollapse').onclick=toggleCollapsed;
    aside.querySelector('#btExportProgress').onclick=exportProgress;

    const mob=document.createElement('button');
    mob.className='bt-shell-mobile';mob.textContent='☰';
    mob.setAttribute('aria-label','Open navigation menu');
    mob.onclick=()=>document.body.classList.toggle('bt-shell-open');
    document.body.appendChild(mob);

    // Close mobile drawer after selecting a route.
    aside.addEventListener('click',e=>{
      if(window.innerWidth<=900 && e.target.closest('a')){
        document.body.classList.remove('bt-shell-open');
      }
    });

    // Make sure button matches the restored state.
    setCollapsed(document.body.classList.contains('bt-shell-collapsed'),false);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build);
  else build();

  window.BAUM_SHELL={
    exportProgress,
    collapse:()=>setCollapsed(true),
    expand:()=>setCollapsed(false),
    toggle:toggleCollapsed,
    isCollapsed:()=>document.body.classList.contains('bt-shell-collapsed')
  };
})();
