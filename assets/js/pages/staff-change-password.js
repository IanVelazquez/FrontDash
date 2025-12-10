(async function() {

  const oldPw = document.querySelector("#oldPw");
  const newPw = document.querySelector("#newPw");
  const msg = document.querySelector("#msg");

  const auth = getAuth();
  if (!auth || auth.role !== "staff") {
    location.href = "login.html";
    return;
  }

  async function apiPost(path, body) {
    const res = await fetch(`http://localhost:8080/api${path}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.text();
  }

  document.querySelector("#savePwBtn").addEventListener("click", async () => {
    try {
      const result = await apiPost(`/staff/${auth.username}/change-password`, {
        oldPassword: oldPw.value,
        newPassword: newPw.value
      });

      msg.textContent = "Password updated successfully.";
      msg.className = "text-success";

      // force user to relogin
      setTimeout(() => {
        clearAuth();
        location.href = "login.html";
      }, 1500);

    } catch (err) {
      msg.textContent = err.message;
      msg.className = "text-danger";
    }
  });

})();
