import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import axios from "axios";

const ProctorStudents = () => {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);

useEffect(() => {
  const token = localStorage.getItem("token");

  axios.get("http://localhost:5000/api/proctor/students", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      console.log("Students API response:", res.data);
      setStudents(Array.isArray(res.data) ? res.data : []);
    })
    .catch(err => console.error("Error loading students", err));
}, []);



  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">My Students</h2>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="bg-gray-100 rounded-lg">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="list">Student List</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* 📊 Summary */}
        <TabsContent value="summary">
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <Card><CardHeader>Total Students</CardHeader>
              <CardContent className="text-3xl font-bold">{students.length}</CardContent></Card>
            <Card><CardHeader>Average Attendance</CardHeader>
              <CardContent className="text-3xl font-bold text-blue-600">
                85%
              </CardContent></Card>
            <Card><CardHeader>Avg GPA</CardHeader>
              <CardContent className="text-3xl font-bold text-green-600">8.2</CardContent></Card>
          </div>
        </TabsContent>

        {/* 🧍‍♂️ List */}
        <TabsContent value="list">
          <div className="flex justify-end mb-3">
            <Button onClick={() => setSelected({})}>+ Add Student</Button>
          </div>
          <Card>
            <CardContent>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b font-semibold text-gray-700">
                    <th>Roll</th>
                    <th>Name</th>
                    <th>Year</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.student_id} className="border-b hover:bg-gray-50">
                      <td>{s.roll_number}</td>
                      <td>{s.full_name}</td>
                      <td>{s.year_group}</td>
                      <td>{s.department}</td>
                      <td>
                        <Button size="sm" onClick={() => setSelected(s)}>Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 📈 Performance */}
        <TabsContent value="performance">
          <div className="mt-4">
            <Card>
              <CardHeader>Academic Performance Overview</CardHeader>
              <CardContent>
                {/* Later: Add Recharts LineChart for GPA trends */}
                <p className="text-gray-500">Charts coming soon...</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 🌟 Achievements */}
        <TabsContent value="achievements">
          <p className="text-gray-500 mt-4">Record student extracurriculars here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProctorStudents;
