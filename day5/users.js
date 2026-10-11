const USERS_URL = "https://jsonplaceholder.typicode.com/users";

const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusMessage = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

let users = [];
let hasLoadedUsers = false;

function renderUsers(list) {
  usersList.replaceChildren();

  for (const user of list) {
    const item = document.createElement("li");
    const name = document.createElement("h2");
    const email = document.createElement("p");
    const city = document.createElement("p");
    const company = document.createElement("p");

    name.textContent = user.name;
    email.textContent = `Email: ${user.email}`;
    city.textContent = `City: ${user.address.city}`;
    company.textContent = `Company: ${user.company.name}`;

    item.append(name, email, city, company);
    usersList.append(item);
  }
}

function getFilteredUsers() {
  const filter = filterInput.value.trim().toLowerCase();
  return users.filter((user) => user.name.toLowerCase().includes(filter));
}

async function loadUsers() {
  loadButton.disabled = true;
  statusMessage.textContent = "Loading users...";

  try {
    const response = await fetch(USERS_URL);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    users = await response.json();
    hasLoadedUsers = true;

    const filteredUsers = getFilteredUsers();
    renderUsers(filteredUsers);
    statusMessage.textContent = filteredUsers.length === 0
      ? "No users match your filter."
      : `Loaded ${users.length} users.`;
  } catch (error) {
    console.error("Unable to load users:", error);
    statusMessage.textContent = "Error loading users. Please try again.";
  } finally {
    loadButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadUsers);

filterInput.addEventListener("input", () => {
  if (!hasLoadedUsers) {
    return;
  }

  const filteredUsers = getFilteredUsers();
  renderUsers(filteredUsers);
  statusMessage.textContent = filteredUsers.length === 0
    ? "No users match your filter."
    : `Showing ${filteredUsers.length} of ${users.length} users.`;
});