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

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
const mongodb = process.env.MONGO;
let parser = new Parser();
mongoose
  .connect(mongodb, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(console.log("baza konektovana"));

app.get("/todos:user", async (req, res) => {
  const todos = await Todo.find({ createdBy: req.params.user });
  res.json(todos);
});
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
            if (result === true) {
              res.status(200).json("User exists");

              return;
            }
            res.status(403).send("Database error");
          });
        });
    }
  });
});

app.post("/createTodo", (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    createdBy: req.body.creator,
    category: req.body.category,
    completed: false,
  });
  todo.save();
  res.json(todo);
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
app.get("/", (req, res) => res.send("Hello from backend"));
app.delete("/delete/:id", async (req, res) => {
  const result = await Todo.findByIdAndRemove(req.params.id);
  res.json();
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
app.listen(process.env.PORT || 3001);
