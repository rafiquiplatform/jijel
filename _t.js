/* temporary runtime harness — deleted after verification */
const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const core = h.match(/<script id="app-core">([\s\S]*?)<\/script>/)[1];

/* ---------- DOM stub ---------- */
function mkClassList() {
  const s = new Set();
  return {
    add: (...c) => c.forEach(x => s.add(x)),
    remove: (...c) => c.forEach(x => s.delete(x)),
    toggle: c => (s.has(c) ? s.delete(c) : s.add(c)),
    contains: c => s.has(c)
  };
}
const ALL = [];
function parseInto(el, html) {
  const re = /<(input|select|textarea|button|form|option|label|a|div|span|p)\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[2] || '';
    const node = mkEl(m[1]);
    const nm = (attrs.match(/name="([^"]*)"/) || [])[1];
    const id = (attrs.match(/id="([^"]*)"/) || [])[1];
    const ds = attrs.match(/data-([a-z0-9-]+)="([^"]*)"/gi) || [];
    const bare = attrs.match(/(^|\s)(data-[a-z0-9-]+)(?=[\s>]|$)/gi) || [];
    const data = {};
    ds.forEach(a => {
      const p = a.match(/data-([a-z0-9-]+)="([^"]*)"/);
      data[p[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = p[2];
    });
    bare.forEach(a => {
      const nm2 = a.trim().slice(5);
      data[nm2.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = '';
    });
    const val = (attrs.match(/value="([^"]*)"/) || [])[1];
    const cls = (attrs.match(/class="([^"]*)"/) || [])[1] || '';
    if (nm) node.name = nm;
    if (id) node.id = id;
    if (val != null) node.value = val;
    node.dataset = data;
    node.cls = cls.split(/\s+/).filter(Boolean);
    el._q.push(node);
    ALL.push(node);
  }
}
function matchNode(n, sel) {
  sel = sel.trim();
  const m = sel.match(/^([a-z0-9]+)?((?:\[[^\]]+\])*)$/i);
  if (!m) return false;
  const tag = m[1];
  if (tag && n.tagName !== tag.toUpperCase()) return false;
  const attrs = m[2] ? m[2].match(/\[[^\]]+\]/g) || [] : [];
  for (const a of attrs) {
    const p = a.slice(1, -1).match(/^([^=]+)(?:=["']?([^"']*)["']?)?$/);
    if (!p) return false;
    const key = p[1].trim();
    const want = p[2];
    if (key === 'name' && n.name !== want) return false;
    if (key === 'id' && n.id !== want) return false;
    if (key.indexOf('data-') === 0) {
      const dk = key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (want === undefined) { if (!(dk in (n.dataset || {}))) return false; }
      else if ((n.dataset || {})[dk] !== want) return false;
    }
    if (key === 'class' && (n.cls || []).indexOf(want) < 0) return false;
  }
  return true;
}
function mkEl(tag) {
  const el = {
    tagName: String(tag || 'div').toUpperCase(),
    _html: '',
    _q: [],
    children: [],
    dataset: {},
    style: {},
    value: '',
    checked: false,
    className: '',
    classList: mkClassList(),
    parentNode: null,
    textContent: '',
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); parseInto(this, this._html); },
    get outerHTML() { return this._html; },
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
    append(...c) { c.forEach(x => this.appendChild(x)); },
    removeChild(c) { this.children = this.children.filter(x => x !== c); },
    reset() {},
    remove() {},
    insertBefore(c) { return this.appendChild(c); },
    setAttribute() {},
    getAttribute(k) { return k === 'id' ? this.id : null; },
    removeAttribute() {},
    addEventListener(t, f) { (this._h = this._h || {})[t] = f; },
    removeEventListener() {},
    dispatchEvent() { return true; },
    focus() {},
    blur() {},
    click() { if (this._h && this._h.click) this._h.click({ target: this, preventDefault() {} }); },
    scrollIntoView() {},
    closest() { return null; },
    querySelector(sel) {
      const own = this._q.filter(n => matchNode(n, sel.split(',')[0]));
      if (own.length) return own[0];
      const g = ALL.filter(n => matchNode(n, sel.split(',')[0]));
      return g.length ? g[0] : null;
    },
    querySelectorAll(sel) {
      const parts = sel.split(',').map(s => s.trim());
      const own = this._q.filter(n => parts.some(p => matchNode(n, p)));
      if (own.length) return own;
      return ALL.filter(n => parts.some(p => matchNode(n, p)));
    },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
    get firstChild() { return this.children[0] || null; }
  };
  return el;
}
const store = {};
const localStorage = {
  getItem: k => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};
const LEGACY = process.argv[2] === '--legacy';
if (LEGACY) {
  store['rafiqi.users.v1'] = JSON.stringify([
    { id: 'u_t1', fullName: 'أستاذ قديم', phone: '0600000001', role: 'teacher', roleName: 'أستاذ', level: '1م', levelName: '1 متوسط', service: 'دروس الدعم', password: '1', createdAt: new Date().toISOString() },
    { id: 'u_s1', fullName: 'تلميذ قديم', phone: '0600000002', role: 'student', roleName: 'تلميذ', level: '2م', levelName: '2 متوسط', service: '', password: '1', createdAt: new Date().toISOString() },
    { id: 'u_c1', fullName: 'مؤطّر قديم', phone: '0600000003', role: 'counselor', roleName: 'مرافق', service: 'المرافقة', password: '1', createdAt: new Date().toISOString() },
    { id: 'u_admin', fullName: 'الأدمن', phone: '0600000004', role: 'admin', password: '1', createdAt: new Date().toISOString() }
  ]);
  store['rafiqi.session.v1'] = JSON.stringify({ id: 'u_s1', fullName: 'تلميذ قديم', role: 'student', roleName: 'تلميذ' });
  store['rafiqi.enroll.v1'] = JSON.stringify([{ id: 'e1', kind: 'lesson', ref: 'l1', refName: 'درس', userId: 'u_s1', userRole: 'student', at: new Date().toISOString(), status: 'مؤكّد' }]);
  store['rafiqi.seeded.v1'] = 'true';
}
const bodyEl = mkEl('body');
const bodyHtml = (h.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [, ''])[1];
parseInto(bodyEl, bodyHtml);
const els = {};
['modalRoot', 'toastRoot', 'nav', 'appMain', 'splash', 'year', 'globalSearch', 'searchPanel',
 'authReg', 'authLogin', 'quickLogins', 'usersTable', 'adminBody', 'capacityBar', 'importFile',
 'view-children', 'view-users', 'view-admin', 'view-home', 'view-lessons', 'view-groups', 'view-profile']
  .forEach(id => { els[id] = mkEl('div'); els[id].id = id; });
const document = {
  readyState: 'complete',
  body: bodyEl,
  documentElement: mkEl('html'),
  head: mkEl('head'),
  createElement: tag => mkEl(tag),
  getElementById: id => els[id] || (els[id] = mkEl('div')),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
  removeEventListener() {},
  execCommand: () => true
};
const window = {
  document,
  localStorage,
  matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
  addEventListener() {},
  removeEventListener() {},
  requestAnimationFrame: fn => setTimeout(fn, 0),
  scrollTo() {},
  print() {},
  location: { reload() {}, href: '' },
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  innerWidth: 1280,
  navigator: { language: 'ar' }
};
const BLOBS = [];
class BlobStub { constructor(p) { this.parts = p; BLOBS.push(p.join('')); } }
const URLStub = { createObjectURL: () => 'blob:stub', revokeObjectURL() {} };
class FileReaderStub { readAsText() { if (this.onload) this.onload(); } }
function FormDataStub() {}
FormDataStub.prototype.get = function () { return null; };
FormDataStub.prototype.has = function () { return false; };

/* ---------- driver injected inside the IIFE ---------- */
const driver = `
;(function(){
 var R={pass:[],fail:[],info:{}};
 function t(name,fn){try{fn();R.pass.push(name);}catch(e){R.fail.push(name+' >> '+(e&&e.message||e));}}
 var _toast=toast; var LOG=[];
 toast=function(m,k){LOG.push((k||'ok')+': '+m);};
 function fdOf(o){return{get:function(k){return Object.prototype.hasOwnProperty.call(o,k)?o[k]:null;},has:function(k){return !!o[k];}};}
 function mkForm(ds){var e=mkErrStub();return{dataset:ds||{},querySelector:function(){return e;},querySelectorAll:function(){return[];},reset:function(){},classList:mkClassListOuter(),addEventListener:function(){}};}
 function act(a,d){handleAct(a,{dataset:d||{}},{preventDefault:function(){},target:{}});}
 function parentWithKids(){return DB.users.filter(function(u){return u.role==='parent'&&DB.childrenOf(u.id).length;})[0];}
 function firstRole(r){return DB.users.filter(function(u){return u.role===r;})[0];}
 t('DB loaded with users',function(){ if(!DB.users.length) throw new Error('no users'); });
 t('roles are only the 4 new ids',function(){
   var bad=DB.users.filter(function(u){return ['admin','manager','employee','parent'].indexOf(u.role)<0;});
   if(bad.length) throw new Error('legacy roles: '+bad.length+' e.g. '+bad[0].role);
 });
 t('every user has status',function(){
   var bad=DB.users.filter(function(u){return !u.status;});
   if(bad.length) throw new Error(bad.length+' users missing status');
 });
 t('no user still carries .level',function(){
   var bad=DB.users.filter(function(u){return !!u.level;});
   if(bad.length) throw new Error(bad.length+' users still have level');
 });
 t('legacy levels moved to childLevel',function(){
   if(!LEGACY)return;
   var p=DB.users.find(function(u){return u.id==='u_s1';});
   if(!p||p.role!=='parent') throw new Error('u_s1 not parent');
   if(p.childLevel!=='2م') throw new Error('childLevel missing: '+p.childLevel);
 });
 t('every role has a usable login account',function(){
   ['admin','manager','employee','parent'].forEach(function(r){
     if(!DB.users.some(function(u){return u.role===r&&u.id&&u.phone&&u.password;})) throw new Error('no usable '+r);
   });
 });
 t('children exist and belong to parents',function(){
   if(!DB.children.length) throw new Error('no children');
   DB.children.forEach(function(c){
     var p=DB.users.find(function(u){return u.id===c.parentId;});
     if(!p) throw new Error('orphan child '+c.id);
     if(p.role!=='parent') throw new Error('child parent not parent role');
   });
 });
 t('each demo parent has >=1 child',function(){
   DB.users.filter(function(u){return u.role==='parent'&&u.demo;}).forEach(function(p){
     if(!DB.childrenOf(p.id).length) throw new Error('parent without child');
   });
 });
 t('children cards render',function(){ enterApp(parentWithKids()); VIEWS.children(); });
 t('children actions render',function(){
   enterApp(parentWithKids());
   var c=DB.childrenOf(state.user.id)[0];
   childModal(null);childModal(c.id);childServicesModal(c.id);childGuardiansModal(c.id);
 });
 t('child modals blocked for non-parent',function(){
   enterApp(firstRole('employee'));
   LOG.length=0;
   childModal(null);childServicesModal('x');childGuardiansModal('x');
   if(LOG.length<3) throw new Error('modals not guarded: '+LOG.length);
 });
 t('child CRUD via handleForm',function(){
   enterApp(parentWithKids());
   var before=DB.children.length;
   handleForm('child-save',fdOf({name:'طفل اختباري',relation:'ابن',birthYear:'2014',levelId:'1م',commune:'الخروب',school:'ثانوية اختبارية',health:'سليم'}),mkForm({}));
   if(DB.children.length!==before+1) throw new Error('child not added');
   var nc=DB.children[0];
   handleForm('child-save',fdOf({name:'طفل معدّل',relation:'ابن',birthYear:'2014',levelId:'2م',commune:'الخروب',school:'ثانوية اختبارية',health:'سليم'}),mkForm({cid:nc.id}));
   if(DB.children[0].name!=='طفل معدّل') throw new Error('child not updated');
   handleForm('child-service',fdOf({kind:'lesson',refName:'نشاط تجريبي',note:'ملاحظة'}),mkForm({cid:nc.id}));
   if(!DB.servicesOfChild(nc.id).length) throw new Error('service not linked');
   handleForm('guardian-save',fdOf({name:'كفيل',phone:'0699999999',relation:'جد'}),mkForm({cid:nc.id}));
   if(!DB.guardiansOfChild(nc.id).length) throw new Error('guardian not added');
   DB.children=DB.children.filter(function(x){return x.id!==nc.id;});
   DB.enroll=DB.enroll.filter(function(x){return x.childId!==nc.id;});
   DB.saveChildren();DB.saveEnroll();
 });
 t('parent child modals reject foreign child',function(){
   enterApp(parentWithKids());
   LOG.length=0;
   var other=DB.children.filter(function(c){return c.parentId!==state.user.id;})[0];
   if(other){childServicesModal(other.id);childGuardiansModal(other.id);
     if(DB.guardiansOfChild(other.id)&&DB.guardiansOfChild(other.id).length&&LOG.join('|').indexOf('nonparent')<0){}
     if(LOG.length<2) throw new Error('foreign child not blocked');}
 });
 t('parent cannot use child actions after logout',function(){
   doLogout();
   LOG.length=0;
   childModal(null);
   if(!LOG.join('|').match(/الأدمن|ولي الأمر/)) throw new Error('no permission guard');
 });
 t('booking links childId',function(){
   var p=parentWithKids();
   enterApp(p);
   var kid=DB.childrenOf(p.id)[0];
   var before=DB.enroll.length;
   handleForm('book',fdOf({childId:kid.id,name:kid.name,phone:p.phone,levelId:kid.levelId,note:''}),mkForm({kind:'lesson',ref:'x1',refname:'درس تجريبي'}));
   var rec=DB.enroll[0];
   if(DB.enroll.length!==before+1) throw new Error('not booked');
   if(rec.childId!==kid.id||rec.childName!==kid.name) throw new Error('child not linked');
   if(!DB.servicesOfChild(kid.id).length) throw new Error('service not counted');
 });
 t('booking rejects foreign childId',function(){
   var p=parentWithKids();
   enterApp(p);
   var other=DB.children.filter(function(c){return c.parentId!==p.id;})[0];
   var before=DB.enroll.length;
   handleForm('book',fdOf({childId:other?other.id:'',name:'x',phone:'06',levelId:'1م',note:''}),mkForm({kind:'lesson',ref:'x2',refname:'درس'}));
   var rec=DB.enroll[0];
   if(other&&rec.childId) throw new Error('foreign child accepted');
   if(DB.enroll.length!==before+1) throw new Error('not booked');
 });
 t('manager blocked from userModal',function(){
   enterApp(firstRole('manager'));LOG.length=0;
   userModal(null);
   if(!LOG.join('|').match(/الأدمن/)) throw new Error('manager opened user modal');
 });
 t('manager blocked from user-save',function(){
   enterApp(firstRole('manager'));
   LOG.length=0;
   handleForm('user-save',fdOf({fullName:'محاولة غير مصرح',phone:'0611111111',role:'parent',wilaya:'cst',commune:'الخروب',service:'',status:'نشط',password:'123456'}),mkForm({uid:''}));
   if(DB.users.some(function(u){return u.phone==='0611111111';})) throw new Error('manager created a user');
 });
 t('manager has no data tab',function(){
   enterApp(firstRole('manager'));state.admin.tab='data';
   VIEWS.admin();
   if(state.admin.tab!=='overview') throw new Error('tab not reset, got '+state.admin.tab);
   LOG.length=0;
   act('admin-tab',{tab:'data'});
   if(state.admin.tab!=='overview') throw new Error('data tab forced via action');
   if(!LOG.join('|').match(/الأدمن/)) throw new Error('no guard toast');
   if(/البيانات/.test(adminBody().slice(0,600))) throw new Error('data body reachable');
 });
 t('manager blocked from destructive data actions',function(){
   enterApp(firstRole('manager'));
   LOG.length=0;
   var n=DB.users.length;
   act('clear-data',{});act('reseed',{});act('import-json',{});
   if(DB.users.length!==n) throw new Error('data cleared');
   if(!LOG.join('|').match(/الأدمن/)) throw new Error('no guard toast: '+LOG.join('|'));
 });
 t('admin can create account via user-save',function(){
   enterApp(firstRole('admin'));
   handleForm('user-save',fdOf({fullName:'حساب اختبار',phone:'0655555555',email:'t@t.dz',role:'employee',job:'أستاذ',wilaya:'anm',commune:'البوني',address:'حي الاختبار',service:'دروس الدعم',status:'نشط',password:'123456'}),mkForm({uid:''}));
   var nu=DB.users.find(function(u){return u.phone==='0655555555';});
   if(!nu) throw new Error('not created');
   if(nu.roleName!==(ROLES.filter(function(r){return r.id==='employee';})[0].n)) throw new Error('bad roleName '+nu.roleName);
   if(nu.wilayaName!=='عنابة') throw new Error('bad wilayaName '+nu.wilayaName);
   if(nu.job!=='أستاذ') throw new Error('job lost');
   DB.users=DB.users.filter(function(u){return u.id!==nu.id;});DB.saveUsers();
 });
 t('admin can edit + suspend + delete account',function(){
   enterApp(firstRole('admin'));
   var u=firstRole('employee');
   handleForm('user-save',fdOf({fullName:u.fullName,phone:u.phone,email:u.email,role:'employee',job:u.job,wilaya:u.wilaya,commune:u.commune,address:u.address,service:u.service,status:'موقوف',password:u.password}),mkForm({uid:u.id}));
   var after=DB.users.find(function(x){return x.id===u.id;});
   if(!after||after.status!=='موقوف') throw new Error('status not updated');
   after.status='نشط';DB.saveUsers();
 });
 t('users filters + sort by wilaya',function(){
   enterApp(firstRole('admin'));
   state.users.role='all';state.users.wilaya='anm';state.users.sort='wilaya';state.users.page=1;state.users.stage='all';state.users.q='';
   var rows=filteredUsers();
   if(!rows.length) throw new Error('no عنابة rows');
   rows.forEach(function(r){if(r.wilaya!=='anm') throw new Error('filter leak');});
   state.users.wilaya='all';state.users.role='parent';
   if(!filteredUsers().every(function(r){return r.role==='parent';})) throw new Error('role filter leak');
   state.users.role='all';state.users.q='zzzz-no-match';
   if(filteredUsers().length) throw new Error('search leak');
   state.users.q='';
   renderUsersTable();VIEWS.users();
 });
 t('all views render for admin',function(){
   enterApp(firstRole('admin'));
   Object.keys(VIEWS).forEach(function(k){
     try{ VIEWS[k](); }catch(e){ throw new Error('view '+k+': '+e.message); }
   });
   ['adminOverview','adminUsers','adminTeachers','adminStudents','adminDefense','adminNotes','adminResults','adminClips','adminData'].forEach(function(f){
     state.admin.tab=f.replace('admin','').toLowerCase();
     try{ adminBody(); }catch(e){ throw new Error(f+': '+e.message); }
   });
 });
 t('employee views render (no panel)',function(){
   enterApp(firstRole('employee'));
   if(canPanel(state.user.role)) throw new Error('employee has panel');
   if(canSeeUsers(state.user.role)) throw new Error('employee sees users');
   go('admin');if(state.view==='admin') throw new Error('employee entered admin');
   go('users');if(state.view==='users') throw new Error('employee entered users');
   go('children');if(state.view==='children') throw new Error('employee entered children');
   Object.keys(VIEWS).forEach(function(k){ try{ VIEWS[k](); }catch(e){ throw new Error('view '+k+': '+e.message); } });
 });
 t('parent nav: children allowed, admin blocked',function(){
   enterApp(parentWithKids());
   go('children');if(state.view!=='children') throw new Error('parent cannot open children');
   go('admin');if(state.view==='admin') throw new Error('parent entered admin');
   go('users');if(state.view==='users') throw new Error('parent entered users');
   VIEWS.children();profileModal();
 });
 t('guest can browse common views only',function(){
   doLogout();
   enterApp({id:'guest',fullName:'زائر',role:'guest',roleName:'زائر',phone:PHONE_DIGITS});
   go('children');if(state.view==='children') throw new Error('guest entered children');
   go('admin');if(state.view==='admin') throw new Error('guest entered admin');
 });
 t('migrate() is idempotent',function(){
   var n=DB.users.length,c=DB.children.length;
   migrate();migrate();
   if(DB.users.length!==n) throw new Error('users changed');
   if(DB.children.length!==c) throw new Error('children changed');
 });
 t('ensureDemoData() is idempotent',function(){
   var n=DB.users.length,c=DB.children.length;
   ensureDemoData();ensureDemoData();
   if(DB.users.length!==n) throw new Error('users changed');
   if(DB.children.length!==c) throw new Error('children changed');
 });
 t('normalizeUser maps legacy shapes',function(){
   var a={id:'x',role:'teacher',level:'3م',levelName:'3 متوسط'};normalizeUser(a);
   if(a.role!=='employee') throw new Error('teacher not mapped: '+a.role);
   if(a.level) throw new Error('level kept');
   var b={id:'y',role:'student',level:'4م',levelName:'4 متوسط'};normalizeUser(b);
   if(b.role!=='parent') throw new Error('student not mapped');
   if(b.childLevel!=='4م') throw new Error('childLevel not set');
   var c={id:'z',role:'weird'};normalizeUser(c);
   if(c.role!=='parent') throw new Error('unknown role not defaulted');
   var d={id:'w',role:'manager',wilaya:'stf'};normalizeUser(d);
   if(d.wilayaName!=='سطيف') throw new Error('wilayaName not backfilled: '+d.wilayaName);
 });
 t('exportJSON includes children + notes',function(){
   BLOBS.length=0;
   exportJSON();
   var payload=BLOBS.join('');
   ['users','children','enroll','notes'].forEach(function(k){ if(payload.indexOf('"'+k+'"')<0) throw new Error(k+' missing from export'); });
 });
 t('stress-test adds parent accounts',function(){
   var n=DB.users.length;
   act('stress-test',{});
   if(DB.users.length<=n) throw new Error('stress-test added nothing');
   DB.users=DB.users.filter(function(u){return String(u.fullName).indexOf('(اختبار)')<0;});
   DB.saveUsers();
 });
 t('session role refreshed from DB',function(){
   var p=parentWithKids();
   enterApp(p);
   DB.session=JSON.parse(JSON.stringify(p));
   DB.session.role='teacher';
   migrate();
   if(DB.session.role!=='parent') throw new Error('session role not refreshed: '+DB.session.role);
 });
 t('quick login works for all 4 demo roles',function(){
   ['admin','manager','employee','parent'].forEach(function(r){
     var d=DB.users.filter(function(u){return u.role===r&&u.demo&&u.phone;})[0];
     if(!d){ if(LEGACY) return; throw new Error('no demo '+r); }
     doLogin(d.phone,'123456');
     if(!state.user||state.user.role!==r) throw new Error(r+' login failed -> '+(state.user&&state.user.role));
     if(state.view==='admin'&&r!=='admin'&&r!=='manager') throw new Error(r+' landed on admin');
   });
   doLogin('0999999999','123456');
   if(state.user&&state.user.role!=='guest'&&state.user.role!=='admin') { /* unknown login keeps previous session */ }
 });
 t('suspended account cannot log in',function(){
   doLogout();
   var u=firstRole('employee');
   var pw=String(u.password||'123456');
   u.status='موقوف';DB.saveUsers();
   LOG.length=0;
   doLogin(u.phone,'wrong-password');
   if(state.user) throw new Error('wrong password still logged in');
   if(!LOG.join('|').match(/غير صحيحة/)) throw new Error('wrong password not reported');
   LOG.length=0;
   doLogin(u.phone,pw);
   if(state.user) throw new Error('suspended user logged in');
   if(!LOG.join('|').match(/موقوف/)) throw new Error('no suspension toast: '+LOG.join('|'));
   u.status='نشط';DB.saveUsers();
   doLogin(u.phone,pw);
   if(!state.user||state.user.role!=='employee') throw new Error('reactivated login failed');
 });
 t('register rejects invalid input',function(){
   doLogout();
   var n0=DB.users.length;
   var errText=function(){var e=document.getElementById('registerForm').querySelector('[data-form-error]');return String((e&&e.textContent)||'');};
   doRegister(fdOf({fullName:'',phone:'0550000000',password:'123456',password2:'123456',wilaya:'16',commune:'باب الزوار',service:'دروس'}));
   if(DB.users.length!==n0) throw new Error('empty name accepted');
   if(!errText().match(/الاسم/)) throw new Error('no name error: '+errText());
   doRegister(fdOf({fullName:'مراد',phone:'123',password:'123456',password2:'123456',wilaya:'16',commune:'باب الزوار',service:'دروس'}));
   if(DB.users.length!==n0) throw new Error('bad phone accepted');
   if(!errText().match(/الهاتف/)) throw new Error('no phone error: '+errText());
   doRegister(fdOf({fullName:'مختار',phone:'0550000001',password:'123',password2:'123',wilaya:'16',commune:'باب الزوار',service:'دروس'}));
   if(DB.users.length!==n0) throw new Error('short password accepted');
   if(!errText().match(/6 أحرف/)) throw new Error('no short-password error: '+errText());
   doRegister(fdOf({fullName:'مختار',phone:'0550000001',password:'123456',password2:'123456',wilaya:'',commune:'باب الزوار',service:'دروس'}));
   if(DB.users.length!==n0) throw new Error('missing wilaya accepted');
   if(!errText().match(/الولاية/)) throw new Error('no wilaya error: '+errText());
 });
 t('register forces parent role',function(){
   var regForm=mkForm({});
   handleForm('register',fdOf({fullName:'ولي أمر جديد',phone:'0677777777',email:'n@n.dz',password:'123456',password2:'123456',wilaya:'bba',commune:'أدرار',address:'حي جديد',service:'دروس الدعم',role:'admin',levelId:'1م',terms:'on'}),regForm);
   var nu=DB.users.find(function(u){return u.phone==='0677777777';});
   if(!nu) throw new Error('register did not create');
   if(nu.role!=='parent') throw new Error('registered role is '+nu.role);
   if(nu.wilayaName!=='برج بوعريريج') throw new Error('wilaya not applied: '+nu.wilayaName);
   if(!state.user||state.user.id!==nu.id) throw new Error('did not enter app after register');
   DB.users=DB.users.filter(function(u){return u.id!==nu.id;});DB.saveUsers();
 });
 t('register rejects duplicate phone + mismatched password',function(){
   var phone=parentWithKids().phone;
   handleForm('register',fdOf({fullName:'مكرر',phone:phone,password:'123456',password2:'123456',wilaya:'cst',commune:'الخروب',address:'',service:'دروس الدعم',terms:'on'}),mkForm({}));
   handleForm('register',fdOf({fullName:'مختلف',phone:'0600000099',password:'123456',password2:'654321',wilaya:'cst',commune:'الخروب',address:'',service:'دروس الدعم',terms:'on'}),mkForm({}));
   if(DB.users.some(function(u){return u.phone==='0600000099';})) throw new Error('mismatched password accepted');
   var msgs=bodyEl.querySelectorAll('[data-form-error]').filter(function(n){return !!n.textContent;});
   if(!msgs.length) throw new Error('no inline error shown');
 });
 t('rendered views contain no undefined/NaN leaks',function(){
   doLogout();
   var emp=DB.users.filter(function(u){return u.role==='employee';})[0];
   doLogin(emp.phone,emp.password);
   go('work');
   var w=document.getElementById('view-work').innerHTML;
   ['undefined','NaN','[object Object]'].forEach(function(bad){if(w.indexOf(bad)>-1)throw new Error('work view leaks '+bad);});
   if(!w.length) throw new Error('work view empty');
   var ad=DB.users.filter(function(u){return u.role==='admin';})[0];
   doLogin(ad.phone,ad.password);
   go('users');
   var u=document.getElementById('view-users').innerHTML;
   ['undefined','NaN','[object Object]'].forEach(function(bad){if(u.indexOf(bad)>-1)throw new Error('users view leaks '+bad);});
   if(u.indexOf('data-model="users.commune"')===-1) throw new Error('commune filter missing');
   if(u.indexOf('data-model="users.job"')===-1) throw new Error('job filter missing');
   if(u.split('data-model="users.wilaya"').length-1!==1) throw new Error('duplicate wilaya filter');
 });
 t('commune + job filters work',function(){
   doLogout();
   var ad=DB.users.filter(function(u){return u.role==='admin';})[0];
   doLogin(ad.phone,ad.password);
   go('users');
   var c=DB.users.filter(function(u){return u.commune;})[0].commune;
   state.users.commune=c;state.users.page=1;
   var rows=filteredUsers();
   if(!rows.length) throw new Error('commune filter returned nothing');
   if(!rows.every(function(u){return String(u.commune||'')===c;})) throw new Error('commune filter leaked rows');
   state.users.commune='all';
   var j=DB.users.filter(function(u){return u.job;})[0].job;
   state.users.job=j;
   rows=filteredUsers();
   if(!rows.length) throw new Error('job filter returned nothing');
   if(!rows.every(function(u){return String(u.job||'')===j;})) throw new Error('job filter leaked rows');
   var both=filteredUsers().length;
   state.users.job='all';state.users.commune='all';
   if(filteredUsers().length<both) throw new Error('filters did not widen results');
 });
 t('employee work view is scoped and readable',function(){
   doLogout();
   var emp=DB.users.filter(function(u){return u.role==='employee'&&u.phone==='0661000001';})[0];
   if(!emp) throw new Error('demo employee t1 missing');
   doLogin(emp.phone,emp.password);
   var sc=workScope();
   if(sc.mode!=='teacher') throw new Error('employee not linked to a teacher: '+sc.mode);
   if(!sc.teacher||sc.teacher.id!=='t1') throw new Error('wrong teacher link');
   var levels=sc.teacher.groups.map(groupLevelId);
   if(!sc.children.every(function(c){return levels.indexOf(c.levelId)>-1;})) throw new Error('caseload outside assigned levels');
   go('work');
   if(state.view!=='work') throw new Error('employee blocked from work view');
   var html=document.getElementById('view-work').innerHTML;
   if(html.indexOf('مهامي')<0) throw new Error('work view did not render');
   if(!sc.children.length) throw new Error('empty caseload for t1');
 });
 t('admin sees every case in work view',function(){
   var ad=DB.users.filter(function(u){return u.role==='admin';})[0];
   doLogin(ad.phone,ad.password);
   var sc=workScope();
   if(sc.mode!=='admin'||sc.children.length!==DB.children.length) throw new Error('admin scope is not global');
   go('work');
   if(state.view!=='work') throw new Error('admin blocked from work view');
 });
 t('parent and manager are blocked from work view',function(){
   doLogout();
   var p=DB.users.filter(function(u){return u.role==='parent'&&u.childrenHint;})[0]||parentWithKids();
   doLogin(p.phone,p.password);
   go('work');
   if(state.view==='work') throw new Error('parent entered work view');
   var mg=DB.users.filter(function(u){return u.role==='manager';})[0];
   if(mg){doLogin(mg.phone,mg.password);go('work');if(state.view==='work') throw new Error('manager entered work view');}
 });
 t('nav hides role-restricted items when logged out',function(){
   doLogout();
   var html='';
   renderNav();
   html=document.getElementById('drawer').innerHTML;
   if(html.indexOf('data-goto="admin"')>-1) throw new Error('logged-out nav shows admin');
   if(html.indexOf('data-goto="users"')>-1) throw new Error('logged-out nav shows users');
   if(html.indexOf('data-goto="work"')>-1) throw new Error('logged-out nav shows work');
   var emp=DB.users.filter(function(u){return u.role==='employee';})[0];
   doLogin(emp.phone,emp.password);
   renderNav();
   html=document.getElementById('drawer').innerHTML;
   if(html.indexOf('data-goto="work"')===-1) throw new Error('employee nav missing work');
   if(html.indexOf('data-goto="children"')>-1) throw new Error('employee nav shows children');
   if(html.indexOf('data-goto="admin"')>-1) throw new Error('employee nav shows admin');
 });
 R.info.users=DB.users.length;
 R.info.children=DB.children.length;
 R.info.roles=DB.users.reduce(function(a,u){a[u.role]=(a[u.role]||0)+1;return a;},{});
 R.info.enroll=DB.enroll.length;
 R.info.schema=readLS(K.schema,0);
 R.info.session=DB.session?DB.session.role:null;
 globalThis.__RESULT=R;
})();
`;

const prelude = `
function mkErrStub(){return{textContent:'',classList:mkClassListOuter()};}
function mkClassListOuter(){return{add:function(){},remove:function(){},toggle:function(){},contains:function(){return false;}};}
`;

const cut = core.lastIndexOf('})();');
const patched = core.slice(0, cut) + driver + '\n})();';
try {
  const fn = new Function('window', 'document', 'localStorage', 'navigator', 'location', 'setTimeout', 'clearTimeout',
    'Blob', 'URL', 'FileReader', 'FormData', 'globalThis', 'BLOBS', 'LEGACY', 'bodyEl', patched.replace(';(function(){', prelude + ';(function(){'));
  fn(window, document, localStorage, window.navigator, window.location, setTimeout, clearTimeout, BlobStub, URLStub, FileReaderStub, FormDataStub, globalThis, BLOBS, LEGACY, bodyEl);
} catch (e) {
  console.log('RUNTIME THROW: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 6).join('\n'));
  process.exit(1);
}
const R = globalThis.__RESULT;
if (!R) { console.log('NO RESULT (driver did not run)'); process.exit(1); }
console.log('PASS ' + R.pass.length + ' / FAIL ' + R.fail.length);
R.pass.forEach(p => console.log('  ok  ' + p));
R.fail.forEach(f => console.log('  ERR ' + f));
console.log('INFO ' + JSON.stringify(R.info));