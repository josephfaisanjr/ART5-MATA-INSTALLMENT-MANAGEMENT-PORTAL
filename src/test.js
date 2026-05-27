// Unit Tests

function testCalculateInstallment() {
  const result = calculateInstallment(1000, 10);
  console.log(result === 100 ? "PASS" : "FAIL");
}

function testProcessPayment() {
  const result = processPayment(500, "cash");
  console.log(result.success === true ? "PASS" : "FAIL");
}
