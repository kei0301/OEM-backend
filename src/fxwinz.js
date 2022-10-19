import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import routes from "./routes";
import mongoose from "./config/mongoose";
import useragent from "express-useragent";
import {
  getOpenRaffles,
  updateWLwinners,
  updateNFTWinner,
} from "./controllers/raffleController";
import { connect, Contract, keyStores } from "near-api-js";
import path from "path";
import dir from "../dir.js";

const CREDENTIALS_DIR = ".near-credentials";
const CONTRACT_NAME = "degenverse-raffles.near";

const credentialsPath = path.join(__dirname, CREDENTIALS_DIR);
const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

const config = {
  keyStore,
  networkId: "mainnet",
  nodeUrl: "https://rpc.mainnet.near.org",
};

const port = 2000;
const app = express();
const http = require("http").createServer(app);
mongoose();

app.use(useragent.express());
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: "application/json" }));
app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
app.use(bodyParser.text({ type: "text/html" }));
app.use(express.static(dir.dirname + "/client"));

app.use("/api", routes);
app.use(express.static(path.join(__dirname, "upload")));
app.get("*", (req, res) => res.sendFile(dir.dirname + "/client/index.html"));
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function timeCheck() {
  const openRaffles = await getOpenRaffles();
  for (let i = 0; i < openRaffles.length; i++) {
    const date = Number(openRaffles[i].endDate);
    const now = new Date().valueOf();
    if (now > date) {
      const { _id, rafflesInfos, winnerNum, isDuplicate } = openRaffles[i];
      let userArray = [];
      let winnerArray = [];
      console.log(rafflesInfos, "rafflesInfos");
      for (let i = 0; i < rafflesInfos.length; i++) {
        if (isDuplicate) {
          for (let j = 0; j < rafflesInfos[i].ticketNum; j++) {
            console.log(rafflesInfos[i].userid, "rafflesInfos[i].userid");
            userArray.push(rafflesInfos[i].userid);
          }
        } else {
          userArray.push(rafflesInfos[i].userid);
        }
      }
      let min = 1;
      let max = userArray.length;
      if (userArray.length > winnerNum)
        for (let i = 0; i < winnerNum; i++) {
          const rnd = getRandomInt(min, max);
          winnerArray.push(userArray[rnd]);
          userArray.splice(rnd, 1);
          max--;
        }
      else winnerArray = userArray;
      updateWLwinners(_id, winnerArray);
    }
  }
  setTimeout(timeCheck, 100);
}

setTimeout(timeCheck, 100);

http.listen(port, () => {
  console.log("server listening on:", port);
});
