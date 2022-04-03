import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TerminSchema = new Schema({
  dan: {
    type: String,
    required: false,
  },
  datum: {
    type: String,
    required: false,
  },
  vreme: {
    type: String,
    required: false,
  },
  detalji: {
    type: String,
    required: false,
  },
});
const Termin = mongoose.model("Termin", TerminSchema);
export default Termin;
