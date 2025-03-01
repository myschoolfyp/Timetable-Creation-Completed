// src/models/Timetable.ts
import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  days: [{
    name: String,
    slots: [{
      startTime: String,
      endTime: String,
      course: String,
      teacher: String,
      teacherId: String,
      room: String
    }]
  }],
  breakTime: {
    start: String,
    end: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  teachers: [
    {
      course: String,
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
      },
    },
  ],
});

const TimetableModel = mongoose.models.Timetable || 
                      mongoose.model("Timetable", timetableSchema, "timetable");

export default TimetableModel;