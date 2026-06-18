const dns = require("dns");
const mongoose = require("mongoose");

const connectDB = async () => {
  const connString = process.env.MONGO_URI;

  if (!connString) {
    console.error("MONGO_URI is not set. Set MONGO_URI in backend/.env or in your deployment environment.");
    process.exit(1);
  }

  if (connString.startsWith("mongodb+srv://")) {
    const dnsServers = process.env.DNS_SERVERS
      ? process.env.DNS_SERVERS.split(",").map((server) => server.trim()).filter(Boolean)
      : ["8.8.8.8", "8.8.4.4"];

    dns.setServers(dnsServers);
    console.log("Using DNS servers for SRV lookup:", dnsServers.join(", "));
  }

  try {
    const conn = await mongoose.connect(connString);
    console.log(`MongoDB Connected 🚀 host: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message || error);

    if (connString.startsWith("mongodb+srv://")) {
      console.error(
        "SRV resolution failed. Set DNS_SERVERS in backend/.env or in your deployment environment, or verify your Atlas network access."
      );
    }
    process.exit(1);
  }
};

module.exports = connectDB;