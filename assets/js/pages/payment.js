// assets/js/pages/payment.js

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  // elements
  let form,
    errorBox,
    elType,
    elName,
    elNum,
    elExp,
    elCvv,
    elBldg,
    elStreet,
    elApt,
    elCity,
    elState,
    elZip;

  function initEls() {
    form      = $('#paymentForm');
    errorBox  = $('#paymentErrors');
    elType    = $('#cardType');
    elName    = $('#cardName');
    elNum     = $('#cardNumber');
    elExp     = $('#cardExpiry');
    elCvv     = $('#cardCvv');
    elBldg    = $('#billBuilding');
    elStreet  = $('#billStreet');
    elApt     = $('#billApt');
    elCity    = $('#billCity');
    elState   = $('#billState');
    elZip     = $('#billZip');
  }

  function showError(msg) {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.classList.remove('d-none');
  }

  function clearError() {
    if (!errorBox) return;
    errorBox.classList.add('d-none');
    errorBox.textContent = '';
  }

  function markInvalid(el, bad) {
    if (!el) return;
    if (bad) el.classList.add('is-invalid');
    else el.classList.remove('is-invalid');
  }

  function attachGuards() {
    if (elNum) guardCardNumber(elNum);
    if (elCvv) guardCVV(elCvv);
    if (elExp) guardExpiry(elExp);
    elState?.addEventListener('input', () => {
      elState.value = elState.value.toUpperCase().slice(0, 2);
    });
  }

  // validation
  function validate() {
    let ok = true;
    clearError();

    // card type
    if (elType) {
      const bad = !elType.value;
      markInvalid(elType, bad);
      ok = ok && !bad;
    }

    // card name 
    if (elName) {
      const bad = !isNameMinTwoLetters(elName.value);
      markInvalid(elName, bad);
      ok = ok && !bad;
    }

    // card number
    const num = (elNum?.value || '').trim();
    if (elNum) {
      const bad = !isCard16NoLeadZero(num);
      markInvalid(elNum, bad);
      ok = ok && !bad;
    }

    // exp date
    const exp = (elExp?.value || '').trim();
    if (elExp) {
      const bad = !(parseExpiry(exp) && isExpiryFuture(exp));
      markInvalid(elExp, bad);
      ok = ok && !bad;
    }

    // cvv
    const cvv = (elCvv?.value || '').trim();
    if (elCvv) {
      const bad = !isCVV3(cvv);
      markInvalid(elCvv, bad);
      ok = ok && !bad;
    }

    // billing address 
    const bldg = (elBldg?.value || '').trim();
    const st   = (elStreet?.value || '').trim();
    const city = (elCity?.value || '').trim();
    const stt  = (elState?.value || '').trim();
    const badB  = !bldg;
    const badSt = !st;
    const badC  = !city;
    const badS2 = !stt;

    markInvalid(elBldg, badB);  ok = ok && !badB;
    markInvalid(elStreet, badSt); ok = ok && !badSt;
    markInvalid(elCity, badC);  ok = ok && !badC;
    markInvalid(elState, badS2); ok = ok && !badS2;

    if (!ok) {
      showError(
        'Please correct the highlighted fields. Card: 16 digits (first ≠ 0); CVV: 3 digits; Expiry must be in the future; Billing address required.'
      );
    }
    return ok;
  }

  // gateway for payment
  function authorizeCard(cardNumber, amount) {
    const clean = String(cardNumber || '').replace(/\D/g, '');
    const last4 = clean.slice(-4) || '0000';
    const numLast4 = parseInt(last4, 10) || 0;

    const base = 100000 + (numLast4 % 900000);
    const authCode = 'FD' + String(base);

    return {
      approved: true,
      authCode,
      amount: Number(amount || 0).toFixed(2),
      last4,
    };
  }

  // hide payment info 
  function savePayment(gateway) {
    const masked = {
      cardType: elType.value,
      cardName: elName.value.trim(),
      last4: (elNum.value || '').slice(-4),
      expiry: elExp.value.trim(),
      billing: {
        building: elBldg.value.trim(),
        street: elStreet.value.trim(),
        apt: elApt.value.trim(),
        city: elCity.value.trim(),
        state: elState.value.trim(),
        zip: elZip.value.trim(),
      },
      gateway: {
        approved: !!gateway?.approved,
        authCode: gateway?.authCode || '',
        amount: gateway?.amount || null,
      },
    };
    localStorage.setItem('payment', JSON.stringify(masked));
  }

  // submit
  function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    loadStore?.();

    // use cart totals from state.js
    let amount = 0;
    if (typeof calcCartTotals === 'function') {
      const totals = calcCartTotals();
      amount = totals.total || 0;
    }

    const num = (elNum?.value || '').trim();
    const gateway = authorizeCard(num, amount);

    if (!gateway.approved) {
      showError('Payment was declined by the test gateway. Please use another card.');
      return;
    }

    savePayment(gateway);

    const prettyAmount =
      typeof fmt === 'function'
        ? fmt(amount || 0)
        : `$${Number(amount || 0).toFixed(2)}`;

    showToast?.(
      `Payment authorized for ${prettyAmount} (Auth: ${gateway.authCode}).`
    );
    window.location.href = 'delivery.html';
  }

  // init
  document.addEventListener('DOMContentLoaded', () => {
    loadStore?.();
    initNavbar?.();
    initEls();
    attachGuards();
    form?.addEventListener('submit', onSubmit);
  });
})();
