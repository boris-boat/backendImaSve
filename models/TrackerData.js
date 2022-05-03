import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TrackerSchema = new Schema({
  createdBy: {
    type: String,
    required: false,
  },
  bills: {
    type: Number,
    required: false,
  },
  entertainment: {
    type: Number,
    required: false,
  },
  food: {
    type: Number,
    required: false,
  },
  health: {
    type: Number,
    required: false,
  },
  transit: {
    type: Number,
    required: false,
  },
  other: {
    type: Number,
    required: false,
  },
});
const TrackerData = mongoose.model("TrackerData", TrackerSchema);
export default TrackerData;
