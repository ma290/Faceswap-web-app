import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// in-memory IP locks
// production me Redis lagana better hoga
const ipLocks = {}; // { ip: timestamp }

// browser batata hai: 5 complete
app.post("/completed", (req, res) => {
  const ip = req.ip;
  ipLocks[ip] = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  res.json({ status: "locked_for_24h" });
});

// block locked IPs
app.use((req, res, next) => {
  const ip = req.ip;
  if (ipLocks[ip] && Date.now() < ipLocks[ip]) {
    return res.status(403).send("Daily limit reached. Try after 24 hours.");
  }
  next();
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
