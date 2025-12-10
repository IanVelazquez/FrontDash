// validators.js


//format checker
function isUsernameStudentFormat(s){
  // two or more letters followed by exactly two digits
  return /^[A-Za-z]{2,}\d{2}$/.test(String(s || ''));
}

function isPasswordPolicy(pw){
  // more than 6 chars, one upper, one lower, and one digit
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(String(pw || ''));
}

function isEmailBasic(s){
  // email
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(String(s || ''));
}

function isPhone10NoLeadZero(s){
  return /^[1-9]\d{9}$/.test(String(s || ''));
}

function isNameMinTwoLetters(s){
  return /^[A-Za-z]{2,}(?:[A-Za-z\s'\-]*)$/.test(String(s || ''));
}

// 16c digit credit card
function isCard16NoLeadZero(s){
  return /^[1-9]\d{15}$/.test(String(s || ''));
}

// 3 digit security code
function isCVV3(s){
  return /^\d{3}$/.test(String(s || ''));
}

// expiration date
function parseExpiry(mmYY){
  const m = String(mmYY || '').trim();
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(m);
  if(!match) return null;
  const month = parseInt(match[1], 10);
  const year2 = parseInt(match[2], 10);
  const year = 2000 + year2;
  return { month, year };
}
function isExpiryFuture(mmYY){
  const exp = parseExpiry(mmYY);
  if (!exp) return false;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1; // 1..12
  return (exp.year > y) || (exp.year === y && exp.month >= m);
}

// input guards / helpers 
function digitsOnly(value){ return String(value||'').replace(/\D+/g, ''); }

function capNumericInput(el, maxLen){
  el.addEventListener('input', ()=>{
    let v = digitsOnly(el.value);
    if (typeof maxLen === 'number') v = v.slice(0, maxLen);
    el.value = v;
  });
}

function guardCardNumber(el){
  el.addEventListener('input', ()=>{
    let v = digitsOnly(el.value).slice(0, 16);
    el.value = v;
  });
}

function guardCVV(el){
  el.addEventListener('input', ()=>{
    el.value = digitsOnly(el.value).slice(0, 3);
  });
}

function guardPhone10NoLeadZero(el){
  el.addEventListener('input', ()=>{
    let v = digitsOnly(el.value);
    if (v.length && v[0] === '0') v = v.slice(1); 
    el.value = v.slice(0, 10);
  });
}

function guardExpiry(el){
  el.addEventListener('input', ()=>{
    let v = digitsOnly(el.value).slice(0, 4);
    if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
    el.value = v;
  });
}
