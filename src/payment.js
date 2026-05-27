// Payment Module

function processPayment(amount, method) {
  if (amount <= 0) {
    return { success: false, message: "Invalid amount" };
  }
  return {
    success: true,
    amount: amount,
    method: method,
    date: new Date().toISOString()
  };
}
