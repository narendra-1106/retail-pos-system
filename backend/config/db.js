const dns = require("dns");
const mongoose = require("mongoose");

const connectDB = async () => {
  const connString = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/retailPOS";

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
        "SRV resolution failed. Set DNS_SERVERS in .env to a public DNS resolver or use a mongodb:// connection string."
      );
    }
    console.error("MongoDB Connection Error:", error.message || error);
    process.exit(1);
  }
};

module.exports = connectDB;