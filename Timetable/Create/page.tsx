"use client";
import { useState, useEffect } from "react";

interface ClassData {
  className: string;
  classLevel: string;
  stream: string;
  courses: string[];
  teachers?: { 
    course: string; 
    teacher: string 
  }[];
}

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  department: string;
}

interface Slot {
  startTime: string;
  endTime: string;
  course: string;
  teacher: string;
  teacherId: string;
  room: string;
}

interface Day {
  name: string;
  slots: Slot[];
}

export default function TimetableCreator() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  interface ClassWithTeachers extends ClassData {
    teachers: { course: string; teacher: string }[];
  }
  const [days, setDays] = useState<Day[]>([
    { name: "Monday", slots: [] },
    { name: "Tuesday", slots: [] },
    { name: "Wednesday", slots: [] },
    { name: "Thursday", slots: [] },
    { name: "Friday", slots: [] },
  ]);
  const [editingSlot, setEditingSlot] = useState<{ dayIndex: number; slotIndex: number } | null>(null);
  const [breakTime, setBreakTime] = useState({ start: "13:00", end: "14:00" });
  const [editingBreak, setEditingBreak] = useState(false);
  // Add this with other state declarations
const [submissionStatus, setSubmissionStatus] = useState<{
  success: boolean;
  message: string;
} | null>(null);

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/Component/A/classes/newclass/assignteachers?action=fetchClasses");
        if (!response.ok) throw new Error("Failed to fetch classes");
        const data = await response.json();
        setClasses(data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/Component/A/classes/newclass/assignteachers?action=fetchClasses");
        const data: ClassWithTeachers[] = await response.json();
        setClasses(data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch teachers when department is selected
  useEffect(() => {
    const fetchTeachers = async () => {
      if (selectedDepartment) {
        try {
          const response = await fetch(
            `/api/Component/A/classes/newclass/assignteachers?action=fetchTeachers&department=${selectedDepartment}`
          );
          const data = await response.json();
          setTeachers(data);
        } catch (err) {
          console.error("Error fetching teachers:", err);
        }
      }
    };
    fetchTeachers();
  }, [selectedDepartment]);

  const addSlotsToDay = (dayIndex: number) => {
    // Fix the type and syntax issues
    const input = prompt("Enter number of slots:") || "0";
    const slotsToAdd = parseInt(input, 10);
    
    // Rest of the function remains the same
    const updatedDays = days.map((day, index) => {
      if (index === dayIndex) {
        return {
          ...day,
          slots: [
            ...day.slots,
            ...Array(slotsToAdd).fill({
              startTime: "",
              endTime: "",
              course: "",
              teacher: "",
              teacherId: "",
              room: ""
            })
          ]
        };
      }
      return day;
    });
    setDays(updatedDays);
  };
  const handleSlotEdit = (dayIndex: number, slotIndex: number, field: string, value: string) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].slots[slotIndex] = {
      ...updatedDays[dayIndex].slots[slotIndex],
      [field]: value
    };
    setDays(updatedDays);
  };

  const generateRoomNumbers = () => {
    return Array.from({ length: 20 }, (_, i) => `A-${(i + 1).toString().padStart(2, '0')}`);
  };

  const handleSaveTimetable = async () => {
  try {
    const timetableData = {
      className: selectedClass,
      department: selectedDepartment,
      days,
      breakTime
    };

    const response = await fetch("/api/Component/A/timetable/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(timetableData),
    });

    const result = await response.json();
    
    if (!response.ok) throw new Error(result.error || "Failed to save timetable");
    
    setSubmissionStatus({
      success: true,
      message: "Timetable created successfully!"
    });

  } catch (error) {
    setSubmissionStatus({
      success: false,
      message: error instanceof Error ? error.message : "Timetable creation failed"
    });
  }
};
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#0F6466]">
          {selectedClass ? `Creating Timetable - ${selectedClass}` : "Creating Timetable"}
        </h1>
        
        <select 
          className="mt-4 px-4 py-2 border-2 border-[#0F6466] rounded-md"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.className} value={cls.className}>
              {`${cls.classLevel} - ${cls.stream} - ${cls.className}`}
            </option>
          ))}
        </select>
        {selectedClass && (
  <div className="mb-8">
    <h2 className="text-2xl font-semibold text-[#0F6466] mb-4">Assigned Courses</h2>
    <div className="bg-white p-4 rounded-lg shadow">
      <ul className="space-y-3">
        {classes
          .find((cls) => cls.className === selectedClass)
          ?.courses.map((course, index) => {
            const teacher = classes
            .find(c => c.className === selectedClass)
            ?.teachers?.find((t: { course: string }) => t.course === course)?.teacher;
            return (
              <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                <span className="font-medium text-[#0F6466]">{course}</span>
                <span className="text-gray-600">
                  {teacher || "No teacher assigned"}
                </span>
              </li>
            );
          })}
      </ul>
    </div>
  </div>
)}
      </div>

      {/* Department Selection */}
      {selectedClass && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[#0F6466] mb-4">Select Department for Teachers</h2>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full p-3 border-2 border-[#0F6466] rounded-lg"
          >
            <option value="">Select Department</option>
            {['Arts', 'Maths', 'Chem', 'Physics', 'English', 'Urdu', 'Islamiat', 'History'].map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      )}

      {/* Day Controls */}
      {selectedClass && selectedDepartment && (
        <div className="flex gap-4 mb-6 flex-wrap">
          {days.map((day, index) => (
            <button
              key={day.name}
              onClick={() => addSlotsToDay(index)}
              className="bg-[#0F6466] text-white px-4 py-2 rounded-md hover:bg-[#0a4a4c] transition-colors"
            >
              Add {day.name} Slots
            </button>
          ))}
        </div>
      )}

      {/* Timetable Grid */}
      {selectedClass && selectedDepartment && (
        <div className="grid grid-cols-6 gap-2">
          {days.map((day, dayIndex) => (
            <div key={day.name} className="bg-gray-50 p-2 rounded-md">
              <h3 className="text-lg font-semibold text-[#0F6466] mb-2">{day.name}</h3>
              {day.slots.map((slot, slotIndex) => (
                <div
                  key={slotIndex}
                  className={`border-2 rounded-md p-2 mb-2 min-h-[100px] cursor-pointer
                    ${slot.course ? 'border-[#0F6466] bg-[#e6f4f4]' : 'border-gray-300'}`}
                  onClick={() => setEditingSlot({ dayIndex, slotIndex })}
                >
                  {slot.startTime && slot.endTime && (
                    <div className="text-sm text-[#0F6466] mb-1">
                      {`${slot.startTime} - ${slot.endTime}`}
                    </div>
                  )}
                  <div className="text-center font-bold text-lg my-2">
                    {slot.course || "Click to add course"}
                  </div>
                  <div className="flex justify-between text-sm mt-4">
                    <span>{slot.teacher || "Teacher"}</span>
                    <span>{slot.room || "Room"}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
          
          {/* Break Column */}
          <div 
            className="bg-[#0F6466] text-white p-4 rounded-md text-center cursor-pointer"
            onClick={() => setEditingBreak(true)}
          >
            <h3 className="font-semibold mb-2">Break</h3>
            <p>{`${breakTime.start} - ${breakTime.end}`}</p>
          </div>
        </div>
      )}

      {/* Slot Edit Modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold text-[#0F6466] mb-4">Edit Slot</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Time Slot</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={days[editingSlot.dayIndex].slots[editingSlot.slotIndex].startTime}
                    onChange={(e) => handleSlotEdit(editingSlot.dayIndex, editingSlot.slotIndex, 'startTime', e.target.value)}
                    className="p-1 border rounded w-full"
                  />
                  <input
                    type="time"
                    value={days[editingSlot.dayIndex].slots[editingSlot.slotIndex].endTime}
                    onChange={(e) => handleSlotEdit(editingSlot.dayIndex, editingSlot.slotIndex, 'endTime', e.target.value)}
                    className="p-1 border rounded w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2">Course</label>
                <select
                  className="w-full p-2 border rounded text-sm"
                  value={days[editingSlot.dayIndex].slots[editingSlot.slotIndex].course}
                  onChange={(e) => handleSlotEdit(editingSlot.dayIndex, editingSlot.slotIndex, 'course', e.target.value)}
                >
                  <option value="">Select Course</option>
                  {classes.find(c => c.className === selectedClass)?.courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-2">Teacher</label>
                  <select
                    className="w-full p-2 border rounded text-sm"
                    value={days[editingSlot.dayIndex].slots[editingSlot.slotIndex].teacherId}
                    onChange={(e) => {
                      const teacher = teachers.find(t => t._id === e.target.value);
                      if (teacher) {
                        handleSlotEdit(editingSlot.dayIndex, editingSlot.slotIndex, 'teacher', `${teacher.firstName} ${teacher.lastName}`);
                        handleSlotEdit(editingSlot.dayIndex, editingSlot.slotIndex, 'teacherId', teacher._id);
                      }
                    }}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher._id} value={teacher._id}>
                        {`${teacher.firstName} ${teacher.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block mb-2">Room</label>
                  <select
                    className="w-full p-2 border rounded text-sm"
                    value={days[editingSlot.dayIndex].slots[editingSlot.slotIndex].room}
                    onChange={(e) => handleSlotEdit(editingSlot.dayIndex, editingSlot.slotIndex, 'room', e.target.value)}
                  >
                    <option value="">Select Room</option>
                    {generateRoomNumbers().map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                className="w-full bg-[#0F6466] text-white py-2 rounded-md mt-2 hover:bg-[#0a4a4c] transition-colors"
                onClick={() => setEditingSlot(null)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Break Time Edit Modal */}
      {editingBreak && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold text-[#0F6466] mb-4">Edit Break Time</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="time"
                value={breakTime.start}
                onChange={(e) => setBreakTime(prev => ({...prev, start: e.target.value}))}
                className="p-2 border rounded w-full"
              />
              <input
                type="time"
                value={breakTime.end}
                onChange={(e) => setBreakTime(prev => ({...prev, end: e.target.value}))}
                className="p-2 border rounded w-full"
              />
            </div>
            <button
              className="w-full bg-[#0F6466] text-white py-2 rounded-md hover:bg-[#0a4a4c] transition-colors"
              onClick={() => setEditingBreak(false)}
            >
              Save Break Time
            </button>
          </div>
        </div>
      )}

      {/* Confirm Assignments Button */}
      {selectedClass && (
        <div className="mt-8 flex justify-center">
          <button
            className="bg-[#0F6466] text-white px-6 py-2 rounded-md hover:bg-[#0a4a4c] transition-colors"
            onClick={handleSaveTimetable}
          >
            Confirm Assignments
          </button>
        </div>
      )}
      {/* Submission Status Notification */}
{submissionStatus && (
  <div className={`mt-4 p-4 rounded-lg text-center ${
    submissionStatus.success 
      ? "bg-green-100 text-green-700" 
      : "bg-red-100 text-red-700"
  }`}>
    {submissionStatus.message}
  </div>
)}
    </div>
    
  );
}