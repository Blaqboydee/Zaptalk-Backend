const mongoose = require("mongoose");
const connect = require("./db");

async function run() {
  await connect(); // wait for DB connection

  try {
    await mongoose.connection.collection("users").drop();
    console.log("Users collection dropped");
  } catch (err) {
    if (err.code === 26) {
      console.log("Users collection does not exist");
    } else {
      throw err;
    }
  }

  await mongoose.disconnect();
}

run().catch(err => console.error(err));
