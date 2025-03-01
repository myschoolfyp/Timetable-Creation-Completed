import { NextResponse } from "next/server";
import mongoose from "mongoose";
import TimetableModel from "@/models/Timetable";

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
};


// In your route.ts
export async function GET(request: Request) {
    try {
      await connectDB();
      
      const { searchParams } = new URL(request.url);
      const className = searchParams.get("className");
  
      if (className) {
        const timetable = await TimetableModel.findOne({ className })
          .select("-createdAt -__v")
          .lean();
  
        if (!timetable) {
          return NextResponse.json(
            { error: "Timetable not found" },
            { status: 404 }
          );
        }
        return NextResponse.json(timetable);
      }
  
      const classNames = await TimetableModel.distinct("className");
      return NextResponse.json({ classNames });
  
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }