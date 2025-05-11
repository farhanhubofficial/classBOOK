import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
ChartJS.register( 
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

const DashboardHome = () => {
  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: "Learners",
        data: [30, 45, 60, 70, 80, 100, 110, 130],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Parents",
        data: [20, 35, 40, 50, 65, 70, 90, 100],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Payments",
        data: [10, 25, 35, 50, 55, 65, 75, 90],
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const barChartDataCBC = {
    labels: ["Grade 1", "Grade 2", "Grade 3", "Grade 4"],
    datasets: [
      {
        label: "CBC 2025",
        data: [50, 40, 70, 60],
        backgroundColor: "#10B981",
      },
    ],
  };

  const barChartDataIGCSE = {
    labels: ["Year 7", "Year 8", "Year 9", "Year 10"],
    datasets: [
      {
        label: "IGCSE 2025",
        data: [30, 45, 50, 55],
        backgroundColor: "#3B82F6",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-green-100 p-6 rounded shadow text-center">
          <h3 className="text-lg font-bold text-green-600">Total Students</h3>
          <p className="text-4xl font-extrabold text-gray-800 mt-2">1,240</p>
        </div>
        <div className="bg-blue-100 p-6 rounded shadow text-center">
          <h3 className="text-lg font-bold text-blue-600">Total Payments</h3>
          <p className="text-4xl font-extrabold text-gray-800 mt-2">KES 5.2M</p>
        </div>
        <div className="bg-yellow-100 p-6 rounded shadow text-center">
          <h3 className="text-lg font-bold text-yellow-600">Total Parents</h3>
          <p className="text-4xl font-extrabold text-gray-800 mt-2">320</p>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded shadow p-4 sm:p-6 overflow-x-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h2 className="text-xl font-bold text-gray-700">Engagement Overview</h2>
          <span className="text-sm text-gray-500">Year: {new Date().getFullYear()}</span>
        </div>
        <div className="min-w-[300px] w-full">
          <Line data={lineChartData} />
        </div>
      </div>

      {/* Bar Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4 sm:p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">CBC Student Distribution</h2>
          <div className="min-w-[300px] w-full">
            <Bar data={barChartDataCBC} />
          </div>
        </div>
        <div className="bg-white rounded shadow p-4 sm:p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">IGCSE Student Distribution</h2>
          <div className="min-w-[300px] w-full">
            <Bar data={barChartDataIGCSE} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
