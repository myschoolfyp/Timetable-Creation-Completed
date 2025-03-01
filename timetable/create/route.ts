// src/app/api/Component/A/timetable/create/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import TimetableModel from "@/models/Timetable";

const MONGODB_URI = process.env.MONGODB_URI!;

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
};

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const timetableData = await request.json();
    
    // Validate required fields
    if (!timetableData.className || !timetableData.department || !timetableData.days) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new timetable document
    const newTimetable = new TimetableModel(timetableData);
    const savedTimetable = await newTimetable.save();

    return NextResponse.json({
      success: true,
      message: "Timetable created successfully!",
      timetable: savedTimetable
    });

  } catch (error) {
    console.error("Timetable creation error:", error);
    return NextResponse.json(
      { error: "Failed to create timetable" },
      { status: 500 }
    );
  }
}
