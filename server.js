import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Todo from "./models/Todo.js";
import User from "./models/User.js";
import dotenv from "dotenv";
import Termin from "./models/Termin.js";
import Parser from "rss-parser";
import TrackerData from "./models/TrackerData.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";

import {router as todoRoutes}  from './routes/todos.js';



const router = express.Router()
const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
const mongodb = process.env.MONGO;
let token = crypto.randomBytes(32).toString("hex");
let parser = new Parser();
mongoose
  .connect(mongodb, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(console.log("baza konektovana"));
app.get("/", (req, res) => {
  res.json(token);
});
app.use("/todos",todoRoutes)
app.get("/trackerData:user", async (req, res) => {
  const trackerData = await TrackerData.find({ createdBy: req.params.user });
  res.json(trackerData);
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  User.exists({ username: username }, (err, doc) => {
    if (doc) {
      User.findOne({ username: username })
        .select("password")
        .lean()
        .then((result) => {
          bcrypt.compare(password, result.password, (err, result) => {
            //napravi u serveru da responduje token , a da react vuce login sa localhosta
            if (result === true) {
              res.json({ token });

              return;
            }
            res.status(403).send("Database error");
          });
        });
    }
  });
});


app.post("/saveData", async (req, res) => {
  let update = {
    bills: req.body.bills,
    entertainment: req.body.entertainment,
    food: req.body.food,
    health: req.body.health,
    transit: req.body.transit,
    other: req.body.other,
  };
  TrackerData.findOneAndUpdate(
    { createdBy: req.body.createdBy },
    update,
    { new: true },
    (error, data) => {
      if (error) {
        console.log(error);
      } else {
        res.json(data);
      }
    }
  );
});
app.post("/resetData", async (req, res) => {
  let update = {
    bills: 0,
    entertainment: 0,
    food: 0,
    health: 0,
    transit: 0,
    other: 0,
  };
  TrackerData.findOneAndUpdate(
    { createdBy: req.body.createdBy },
    update,
    { new: true },
    (error, data) => {
      if (error) {
        console.log(error);
      } else {
        res.json(data);
      }
    }
  );
});

app.post("/createUser", async (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10).then((err, hash) => {
    const user = new User({
      username: req.body.username,
      password: err,
    });

    User.exists({ username: username }, (err, doc) => {
      if (!doc) {
        user.save();
        res.send("User created.");
        TrackerData.create(firstTrackerData);
        return;
      } else {
        res.sendStatus(500);
      }
    });
  });

  let firstTrackerData = {
    createdBy: username,
    bills: 0,
    entertainment: 0,
    food: 0,
    health: 0,
    transit: 0,
    other: 0,
  };
});

app.get("/termini", async (req, res) => {
  const termini = await Termin.find();
  res.json(termini);
});
app.post("/dodajtermin", (req, res) => {
  const termin = new Termin({
    dan: req.body.dan,
    datum: req.body.datum,
    vreme: req.body.vreme,
    detalji: req.body.detalji,
  });
  termin.save();
  res.json(termin);
});

app.delete("/deleteTermin/:id", async (req, res) => {
  const result = await Termin.findByIdAndRemove(req.params.id);
  res.json();
});

app.get("/getnews", async (req, res) => {
  let rssFeed = [];
 
  let feedN1 = await parser
    .parseURL("https://rs.n1info.com/feed")
    .then((feedN1) => {
      for (let i = 0; i < 10; i++) {
        rssFeed.push(feedN1.items[i]);
      }
    });
  let feedDanas = await parser
    .parseURL("https://www.danas.rs/feed/")
    .then((feedDanas) => {
      for (let i = 0; i < 10; i++) {
        rssFeed.push(feedDanas.items[i]);
      }
    });
  let feedBlic = await parser
    .parseURL("https://www.blic.rs/rss/danasnje-vesti")
    .then((feedBlic) => {
      for (let i = 0; i < 10; i++) {
        rssFeed.push(feedBlic.items[i]);
      }
    });
  let feedMozzart = await parser
    .parseURL("https://www.mozzartsport.com/rss/0")
    .then((feedMozzart) => {
      for (let i = 0; i < 10; i++) {
        rssFeed.push(feedMozzart.items[i]);
      }
    });

  res.send(rssFeed);
});
app.post("/createConversation", async (req, res) => {
  console.log(req.body)
  const newConversation = new Conversation(req.body);
  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (error) {
    console.log(error);
  }
});
app.get("/getconversations/:userId", async (req, res) => {
  
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
  res.json(conversation)
  } catch (err) {
    res.status(500).json(err);
  }
});
app.get("/getconversationsTwoUsers/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});
app.post("/createMessage", async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
  
});
app.get("/getmessages/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/getallusers", async (req, res) => {
  
  const users = await User.find();
  res.json(users);
});
app.listen(process.env.PORT || 3001);
