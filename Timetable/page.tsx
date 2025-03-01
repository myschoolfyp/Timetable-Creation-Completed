"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Timetable {
  className: string;
  days: {
    name: string;
    slots: {
      startTime: string;
      endTime: string;
      course: string;
      teacher: string;
      room: string;
    }[];
  }[];
  breakTime: {
    start: string;
    end: string;
  };
}

export default function TimetablePage() {
  const router = useRouter();
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Fetch all classes with timetables
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/Component/A/timetable");
        const data = await response.json();
        setClasses(data.classNames);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, []);


  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      fetch(`/api/Component/A/timetable?className=${encodeURIComponent(selectedClass)}`)
        .then(async (res) => {
          const contentType = res.headers.get('content-type');
          if (!contentType?.includes('application/json')) {
            throw new Error('Invalid response format');
          }
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (data.error) throw new Error(data.error);
          setTimetable(data);
        })
        .catch(error => {
          console.error("Fetch error:", error);
          setError(error.message);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedClass]);
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#0F6466]">Timetable</h1>
        <button
          className="w-full py-3 px-5 rounded-lg bg-[#0F6466] text-white font-medium hover:bg-[#0D4B4C] transition duration-200 shadow-md max-w-xs"
          onClick={() => router.push("/Components/A/Timetable/Create")}
        >
          Create New
        </button>
      </div>

      {/* Class Selection */}
      <div className="mb-8 flex gap-4 flex-wrap">
        {classes.map(cls => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={`px-6 py-2 rounded-md ${
              selectedClass === cls 
                ? "bg-[#0F6466] text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {cls}
          </button>
        ))}
      </div>

      {/* Timetable Display */}
      <div className="flex-grow p-8 rounded-xl shadow-lg bg-white border border-[#0F6466]">
        {loading ? (
          <p className="text-center text-gray-600">Loading timetable...</p>
        ) : timetable ? (
          <div className="grid grid-cols-6 gap-4">
            {timetable.days.map(day => (
              <div key={day.name} className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[#0F6466] mb-2">
                  {day.name}
                </h3>
                {day.slots.map((slot, index) => (
                  <div key={index} className="mb-4 p-2 bg-gray-50 rounded">
                    <div className="text-sm text-[#0F6466]">
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className="font-medium my-1">{slot.course}</div>
                    <div className="text-sm flex justify-between">
                      <span>{slot.teacher}</span>
                      <span>{slot.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div className="bg-[#0F6466] text-white p-4 rounded-lg text-center">
              <h3 className="font-semibold mb-2">Break</h3>
              <p>{timetable.breakTime.start} - {timetable.breakTime.end}</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">
            {selectedClass ? "No timetable found" : "Select a class to view timetable"}
          </p>
        )}
      </div>
    </div>
  );
}