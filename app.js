// -----------------------
// CORRECT API BASE URL
// -----------------------
const API_BASE_URL = "https://user-management-ozhy.onrender.com/api/users";

// -----------------------
// 1. REGISTRATION
// -----------------------
const registerForm = document.querySelector('form[action="http://localhost:5000/register"]'); 
const nameInput = document.querySelector('input[name="fullName"]');
const emailInput = document.querySelector('input[name="email"]');
const phoneInput = document.querySelector('input[name="phone"]');
const addressInput = document.querySelector('textarea[name="address"]');
const passwordInput = document.querySelector('input[name="password"]');

function handleRegistration() {
    if (!registerForm) return;

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validation
        if (!nameInput.value.trim()) return alert("Full Name is required");
        if (!emailInput.value.trim()) return alert("Email is required");
        if (!phoneInput.value.trim()) return alert("Phone is required");
        if (!addressInput.value.trim()) return alert("Address is required");
        if (!passwordInput.value.trim()) return alert("Password is required");

        try {
            const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: nameInput.value,
                    email: emailInput.value,
                    phoneNumber: phoneInput.value,
                    address: addressInput.value,
                    password: passwordInput.value,
                    role: "Student"
                })
            });

            const data = await response.json();
            if (response.ok) {
                alert("Registration successful!");
                registerForm.reset();
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (err) {
            console.error(err);
            alert("Server error! Check if backend is running.");
        }
    });
}

// -----------------------
// 2. FETCH USERS
// -----------------------
const userTableBody = document.getElementById("userTableBody");

async function fetchUsers() {
    if (!userTableBody) return;

    try {
        const response = await fetch(API_BASE_URL);
        const users = await response.json();

        userTableBody.innerHTML = "";

        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.fullName}</td>
                    <td>${user.email}</td>
                    <td>${user.phoneNumber}</td>
                    <td>${user.address}</td>
                    <td>${user.role}</td>
                    <td>
                        <button onclick='openUpdatePopup(${JSON.stringify(user)})'>Update</button>
                        <button onclick='deleteUser("${user.id}")'>Delete</button>
                    </td>
                </tr>
            `;
            userTableBody.innerHTML += row;
        });

    } catch (err) {
        console.error(err);
        userTableBody.innerHTML = "<tr><td colspan='7'>Failed to load users</td></tr>";
    }
}

// -----------------------
// 3. DELETE USER
// -----------------------
async function deleteUser(id) {
    if (!confirm("Delete this user?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
        const data = await response.json();

        if (response.ok) {
            alert("User deleted");
            fetchUsers();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Server error");
    }
}

// -----------------------
// 4. UPDATE USER POPUP
// -----------------------
const updateForm = document.getElementById("updateForm");
const upd_id = document.getElementById("upd_id");
const upd_name = document.getElementById("upd_name");
const upd_email = document.getElementById("upd_email");
const upd_phone = document.getElementById("upd_phone");
const upd_address = document.getElementById("upd_address");
const upd_role = document.getElementById("upd_role");

function openUpdatePopup(user) {
    upd_id.value = user.id;
    upd_name.value = user.fullName;
    upd_email.value = user.email;
    upd_phone.value = user.phoneNumber;
    upd_address.value = user.address;
    upd_role.value = user.role;

    document.getElementById("popup").style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}
window.closePopup = closePopup;

// -----------------------
// 5. UPDATE USER SUBMIT
// -----------------------
if (updateForm) {
    updateForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = upd_id.value;

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: upd_name.value,
                    email: upd_email.value,
                    phoneNumber: upd_phone.value,
                    address: upd_address.value,
                    role: upd_role.value
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("User updated!");
                closePopup();
                fetchUsers();
            } else {
                alert(data.message);
            }

        } catch (err) {
            alert("Server error");
        }
    });
}

// -----------------------
// INIT
// -----------------------
document.addEventListener("DOMContentLoaded", () => {
    if (registerForm) handleRegistration();
    if (userTableBody) fetchUsers();
});


