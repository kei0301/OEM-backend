import routerx from "express-promise-router";
import {
  create,
  get,
  buy,
  getWinner,
  checkNFT,
  createUser,
  updateUserWallet,
  newWL,
  imageMulti,
  Uploadfiles,
} from "./controllers/raffleController";

const express = require("express");
const multer = require("multer");
const FileUploader = require("./upload.js");
const path = require("path");
// trending

const fileconfig = require("./dir");
const Uploader = new FileUploader(path.join(fileconfig.BASEURL));

const router = routerx();
router.post("/create-user", createUser);
router.post("/check-wallet", updateUserWallet);
router.post("/create", create);
router.post(
  "/newWL",
  multer({ storage: Uploader.storage, fileFilter: Uploader.filter }).any(),
  imageMulti,
  newWL
);
router.get("/get", get);
router.post("/get_winner", getWinner);
router.post("/buy", buy);
router.post("/check-id", checkNFT);

export default router;
