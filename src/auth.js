// Authentication Module

function loginUser(username, password) {
  if (!username || !password) {
    return { success: false, message: "Missing credentials" };
  }
  return { success: true, message: "Login successful" };
}

function logoutUser() {
  return { success: true, message: "Logged out" };
}
