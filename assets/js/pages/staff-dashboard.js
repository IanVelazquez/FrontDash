// =======================================================
//  staff-dashboard.js
// =======================================================

(function () {

    // ---------------------------------------------------
    // Helpers
    // ---------------------------------------------------

    function apiGet(path) {
        return fetch(`http://localhost:8080/api${path}`, {
            method: "GET",
            credentials: "include"
        }).then(async (res) => {
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        });
    }

    function apiPost(path, body) {
        return fetch(`http://localhost:8080/api${path}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        }).then(async (res) => {
            const text = await res.text();
            if (!res.ok) throw new Error(text);
            try { return JSON.parse(text); } 
            catch { return text; }
        });
    }

    // ---------------------------------------------------
    // Auth check
    // ---------------------------------------------------

    const auth = getAuth();
    if (!auth || auth.role !== "staff") {
        location.href = "login.html";
        return;
    }

    // Force password change
    if (auth.mustChangePw) {
        alert("You must change your password before using the dashboard.");
        location.href = "staff-change-password.html";
        return;
    }

    // ---------------------------------------------------
    // DOM refs
    // ---------------------------------------------------

    const welcomeEl = document.querySelector("#welcome");
    const searchBtn = document.querySelector("#searchOrderBtn");
    const searchInput = document.querySelector("#inputOrderId");
    const orderDetailsEl = document.querySelector("#orderDetails");
    const assignBtn = document.querySelector("#assignDriverBtn");
    const completeBtn = document.querySelector("#completeOrderBtn");
    const driverSelect = document.querySelector("#driverSelect");
    const pendingListEl = document.querySelector("#pendingOrders");
    const completedListEl = document.querySelector("#completedOrders");
    const logoutBtn = document.querySelector("#logoutBtn");

    let currentOrder = null;

    // ---------------------------------------------------
    // Render welcome
    // ---------------------------------------------------

    welcomeEl.textContent = `Welcome, ${auth.firstName} ${auth.lastName}!`;


    // =======================================================
    // Load Drivers (active only)
    // =======================================================
    async function loadActiveDrivers() {
        try {
            const drivers = await apiGet("/drivers");

            driverSelect.innerHTML = "";
            drivers
                .filter(d => d.status === "Active")
                .forEach(d => {
                    const opt = document.createElement("option");
                    opt.value = d.id;
                    opt.textContent = `${d.firstName} ${d.lastName}`;
                    driverSelect.appendChild(opt);
                });

        } catch (err) {
            console.error("Failed to load drivers:", err);
        }
    }
    loadActiveDrivers();



    // =======================================================
    // Search Order
    // =======================================================

    searchBtn.addEventListener("click", async () => {
        const text = searchInput.value.trim();
        if (!text) return alert("Enter an order number like FD0109");

        // Convert FD0109 → 109
        if (!/^FD\d{4}$/i.test(text)) {
            return alert("Order ID must look like FD0109");
        }

        const orderIdNum = parseInt(text.substring(2), 10);

        try {
            currentOrder = await apiGet(`/orders/${orderIdNum}`);

            renderOrderDetails(currentOrder);

        } catch (err) {
            orderDetailsEl.innerHTML = `<div class='text-danger'>${err.message}</div>`;
            currentOrder = null;
        }
    });


    // =======================================================
    // Render order details
    // =======================================================

    function renderOrderDetails(order) {
        if (!order) return;

        orderDetailsEl.innerHTML = `
            <div class="card p-3 bg-light">
                <h5>Order FD${String(order.id).padStart(4, "0")}</h5>
                <p>Status: <strong>${order.status}</strong></p>

                <p><strong>Customer:</strong> 
                    ${order.contactFirstname} ${order.contactLastname}<br>
                    ${order.contactPhone}
                </p>

                <p><strong>Delivery Address:</strong><br>
                    ${order.deliveryBldg} ${order.deliveryStreet}<br>
                    ${order.deliveryCity}, ${order.deliveryState} ${order.deliveryZip}
                </p>

                <p><strong>Driver:</strong> 
                    ${order.driverId ? order.driverId : "None"}
                </p>

                <p><strong>Totals:</strong><br>
                    Subtotal: $${order.subtotal}<br>
                    Tip: $${order.tip}<br>
                    Total: $${order.total}
                </p>
            </div>
        `;
    }


    // =======================================================
    // Assign Driver
    // =======================================================

    assignBtn.addEventListener("click", async () => {
        if (!currentOrder) return alert("Search for an order first.");
        const driverId = parseInt(driverSelect.value, 10);

        if (!driverId) return alert("Select a driver.");

        try {
            const res = await apiPost(`/orders/${currentOrder.id}/assign`, {
                driverId
            });

            alert("Driver assigned!");
            currentOrder = res;
            renderOrderDetails(res);

        } catch (err) {
            alert("Error: " + err.message);
        }
    });


    // complate order

    completeBtn.addEventListener("click", async () => {
        if (!currentOrder) return alert("Search for an order first.");

        try {
            const res = await apiPost(`/orders/${currentOrder.id}/complete`, {});

            alert("Order completed!");
            currentOrder = res;
            renderOrderDetails(res);

        } catch (err) {
            alert("Error: " + err.message);
        }
    });


    // ppending orders

    async function loadPendingOrders() {
        try {
            const pending = await apiGet("/orders/pending");

            pendingListEl.innerHTML = "";
            pending.forEach(o => {
                const div = document.createElement("div");
                div.className = "p-2 mb-2 bg-light border";

                div.innerHTML = `
                    <strong>FD${String(o.id).padStart(4, "0")}</strong>
                    — ${o.contactFirstname} ${o.contactLastname}
                    — ${o.status}
                `;

                pendingListEl.appendChild(div);
            });

        } catch (err) {
            pendingListEl.innerHTML = `<div class="text-danger">${err.message}</div>`;
        }
    }
    loadPendingOrders();


    // load complete orders

    async function loadCompletedOrders() {
        try {
            const completed = await apiGet("/orders/completed");

            completedListEl.innerHTML = "";
            completed.forEach(o => {
                const div = document.createElement("div");
                div.className = "p-2 mb-2 bg-success text-white border";

                div.innerHTML = `
                    <strong>FD${String(o.id).padStart(4, "0")}</strong>
                    — Delivered at ${o.deliveryTime || "N/A"}
                `;

                completedListEl.appendChild(div);
            });

        } catch (err) {
            completedListEl.innerHTML = `<div class="text-danger">${err.message}</div>`;
        }
    }
    loadCompletedOrders();


    // logout

    logoutBtn.addEventListener("click", () => {
        clearAuth();
        location.href = "login.html";
    });

})();
