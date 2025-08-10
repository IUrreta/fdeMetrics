"use client";

import { useEffect, useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
} from "recharts";
import { TrendingUp, DollarSign, Truck, MapPin, Calendar, Phone } from "lucide-react";
import { FaSun, FaMoon } from "react-icons/fa";

interface Call {
  id: number;
  created_at: string;
  delivery_datetime: string;
  destination: string;
  equipment_type: string;
  final_rate: number;
  initial_rate: number;
  mc_number: string;
  origin: string;
  outcome: "won" | "lost";
  pickup_datetime: string;
  sentiment: "pos" | "neg" | "neu";
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    const body = document.body;
    body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetch("/api/calls")
      .then(res => res.json())
      .then(data => {
        console.log("Fetched calls:", data);
        setCalls(data.results);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching calls:", err);
        setLoading(false);
      });
  }, []);

  const metrics = useMemo(() => {
    if (!calls.length) return null;

    // Outcome distribution
    const outcomeData = calls.reduce((acc, call) => {
      acc[call.outcome] = (acc[call.outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sentiment distribution
    const sentimentData = calls.reduce((acc, call) => {
      const sentiment = call.sentiment === "pos" ? "Positive" :
        call.sentiment === "neg" ? "Negative" : "Neutral";
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Equipment type distribution
    const equipmentData = calls.reduce((acc, call) => {
      acc[call.equipment_type] = (acc[call.equipment_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Rate analysis
    const rateData = calls.map(call => ({
      id: call.id,
      initial_rate: call.initial_rate,
      final_rate: call.final_rate,
      difference: call.final_rate - call.initial_rate,
      outcome: call.outcome
    }));

    // Daily calls trend
    const dailyData = calls.reduce((acc, call) => {
      const date = new Date(call.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, won: 0, lost: 0, total: 0 };
      }
      acc[date][call.outcome]++;
      acc[date].total++;
      return acc;
    }, {} as Record<string, any>);

    // Convert to arrays for charts
    return {
      outcome: Object.entries(outcomeData).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value,
        color: key === "won" ? "#10B981" : "#EF4444"
      })),
      sentiment: Object.entries(sentimentData).map(([key, value]) => ({
        name: key,
        value,
        color: key === "Positive" ? "#10B981" : key === "Negative" ? "#EF4444" : "#F59E0B"
      })),
      equipment: Object.entries(equipmentData).map(([key, value]) => ({
        name: key,
        value
      })),
      rates: rateData,
      daily: Object.values(dailyData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      totalCalls: calls.length,
      wonCalls: calls.filter(c => c.outcome === "won").length,
      avgInitialRate: Math.round(calls.reduce((sum, c) => sum + c.initial_rate, 0) / calls.length),
      avgFinalRate: Math.round(calls.reduce((sum, c) => sum + c.final_rate, 0) / calls.length),
      totalRevenue: calls.filter(c => c.outcome === "won").reduce((sum, c) => sum + c.final_rate, 0)
    };
  }, [calls]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="error-container">
        <p>No data available</p>
      </div>
    );
  }

  const winRate = Math.round((metrics.wonCalls / metrics.totalCalls) * 100);

  const applyTheme = () => {
    const body = document.body;
    body.classList.toggle("dark", darkMode);
    setDarkMode(!darkMode);
    //save in localStorage
    localStorage.setItem("darkMode", JSON.stringify(!darkMode));
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>FDE Metrics Dashboard</h1>
        <p>Comprehensive analysis of call performance and metrics</p>
        <div className="dark-mode-toggle">
          {darkMode ? (
            <FaSun onClick={() => setDarkMode(false)} />
          ) : (
            <FaMoon onClick={() => setDarkMode(true)} />
          )}
        </div>
      </header>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>Win Rate</h3>
            <p className="metric-value">{winRate}%</p>
            <span className="metric-subtitle">{metrics.wonCalls} of {metrics.totalCalls} calls won</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <DollarSign size={24} />
          </div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <p className="metric-value">${metrics.totalRevenue.toLocaleString()}</p>
            <span className="metric-subtitle">From won calls</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Truck size={24} />
          </div>
          <div className="metric-content">
            <h3>Avg Final Rate</h3>
            <p className="metric-value">${metrics.avgFinalRate.toLocaleString()}</p>
            <span className="metric-subtitle">Per call</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Phone size={24} />
          </div>
          <div className="metric-content">
            <h3>Total Calls</h3>
            <p className="metric-value">{metrics.totalCalls}</p>
            <span className="metric-subtitle">All time</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Call Outcomes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.outcome}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {metrics.outcome.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.sentiment}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {metrics.sentiment.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Equipment Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.equipment}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Daily Calls Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={metrics.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="won" stackId="1" stroke="#10B981" fill="#10B981" />
              <Area type="monotone" dataKey="lost" stackId="1" stroke="#EF4444" fill="#EF4444" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container full-width">
          <h3>Rate Analysis: Initial vs Final</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={metrics.rates}
              layout="vertical"
              margin={{ top: 16, right: 24, bottom: 0, left: 24 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="id" type="category" />

              <Tooltip
                formatter={(value: number, name) => [`$${Math.round(Number(value))}`, name]}
                labelFormatter={(l) => `ID: ${l}`}
              />
              <Legend />

              <Bar
                dataKey={(d: any) => Math.min(d.initial_rate, d.final_rate)}
                stackId="range"
                fill="transparent"
              />

              <Bar
                dataKey={(d: any) => Math.abs(d.final_rate - d.initial_rate)}
                stackId="range"
                fill="#CBD5E1"
                barSize={6}
                name="Range"
              />

              <Scatter dataKey="initial_rate" name="Initial Rate" fill="#F59E0B" shape="circle" />
              <Scatter dataKey="final_rate" name="Final Rate" fill="#10B981" shape="circle" />
            </ComposedChart>

          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}