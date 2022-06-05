import TrackerData from "../models/TrackerData.js"
import express from 'express';
const router = express.Router();



router.post("/saveData", async (req, res) => {
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
router.post("/resetData", async (req, res) => {
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
router.get("/trackerData:user", async (req, res) => {
  const trackerData = await TrackerData.find({ createdBy: req.params.user });
  res.json(trackerData);
});

export  {router};