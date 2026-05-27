// Database Connection Module

const dbConfig = {
  host: "localhost",
  port: 5432,
  name: "installment_db"
};

function connectDatabase() {
  console.log("Connecting to database...");
  return dbConfig;
}
