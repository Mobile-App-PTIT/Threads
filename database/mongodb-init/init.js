// use file .env to store the connection string
db.getSiblingDB("admin");
// create a new user
db.createUser({
  user: "dev",
  pwd: "cgNSdCZMT+ki*Vc9",
  roles: [
    // create, write, read, update, delete operations
    { role: "readWrite", db: "threads_db" },
  ],
});
