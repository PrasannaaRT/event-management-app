import React from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js';

// Register the components you will use
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, ArcElement
);

const AdminOverview = ({ stats, chartData, loading, error }) => {
  // Common options for all charts
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows charts to fit their containers without fixed aspect ratio
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        position: 'nearest', // Crucial: Force tooltip to position stably
        animation: false, // Disable tooltip animation to prevent extra reflows
      }
    },
    hover: {
      mode: 'nearest',
      intersect: false,
      animationDuration: 0, // Disable hover animation
    },
  };

  // Specific options for the Pie chart
  const pieChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      tooltip: {
        ...commonChartOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed;
            }
            return label + ' events';
          }
        }
      },
      legend: {
        position: 'right', // Pie chart legend often looks better on the right
      }
    },
    datasets: {
      pie: {
        hoverOffset: 0 // Prevents slices from "exploding"
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  // Specific options for the Line chart (you can customize further if needed)
  const lineChartOptions = {
    ...commonChartOptions,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Specific options for the Bar chart (you can customize further if needed)
  const barChartOptions = {
    ...commonChartOptions,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) return <p>Loading overview...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="admin-section fade-in">
      <h2>Platform Overview</h2>
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Events Created</h3>
          <p>{stats?.totalEvents}</p>
        </div>
        <div className="stat-card">
          <h3>Active Events Now</h3>
          <p>{stats?.activeEvents}</p>
        </div>
        <div className="stat-card">
          <h3>Total Registered Users</h3>
          <p>{stats?.totalUsers}</p>
        </div>
      </div>

      <hr className="divider" />

      <h2>Graphical Analytics</h2>
      <div className="charts-container">
        <div className="chart-card chart-line-container"> {/* Added a new class */}
          <h3>Registrations Over Time</h3>
          {chartData.registrations && <Line data={chartData.registrations} options={lineChartOptions} />}
        </div>
        <div className="chart-card chart-pie-container"> {/* Added a new class */}
          <h3>Event Categories</h3>
          {chartData.categories && <Pie data={chartData.categories} options={pieChartOptions} />}
        </div>
        <div className="chart-card chart-bar-container"> {/* Added a new class */}
          <h3>Total Revenue</h3>
          {chartData.revenue && <Bar data={chartData.revenue} options={barChartOptions} />}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;