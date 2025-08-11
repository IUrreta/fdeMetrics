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

export interface Load {
  load_id: number;                 // PK
  origin: string;
  destination: string;
  pickup_datetime: string | null;  // puede venir null
  delivery_datetime: string | null;
  equipment_type: string;
  loadboard_rate: number | null;   // NUMERIC en SQL → number | null
  miles: number | null;
  weight: number | null;
  notes?: string | null;           // opcional
}


export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState("#F59E0B");
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'loads'>('dashboard');

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    const body = document.body;
    body.classList.toggle("dark", darkMode);
    setPrimaryColor(darkMode ? "#669ffb" : "#3B82F6");
    setSecondaryColor(darkMode ? "#ffb639" : "#F59E0B");
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

    fetch("/api/loads")
      .then(res => res.json())
      .then(data => {
        console.log("Fetched loads:", data);
        setLoads(data.results);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching loads:", err);
        setLoading(false);
      });
  }, []);



  const metrics = useMemo(() => {
    if (!calls.length) return null;

    const wonCalls = calls.filter(c => c.outcome === "won");

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
    const equipmentData = wonCalls.reduce((acc, call) => {
      acc[call.equipment_type] = (acc[call.equipment_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Rate analysis
    const rateData = wonCalls.map(call => ({
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



    function sum<T>(arr: T[], pick: (x: T) => number): number {
      return arr.reduce((s, x) => s + pick(x), 0);
    }
    function avg<T>(arr: T[], pick: (x: T) => number): number {
      return arr.length ? Math.round(sum(arr, pick) / arr.length) : 0;
    }

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
      wonCalls: wonCalls.length,
      avgInitialRate: avg(wonCalls, c => c.initial_rate),
      avgFinalRate: avg(wonCalls, c => c.final_rate),
      totalCost: sum(wonCalls, c => c.final_rate)
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



  const GlassTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ color?: string; fill?: string; value?: number; name?: string }>;
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0]; // primera serie (tu "value")

    return (
      <div className="gt">
        <div className="gt-title">{label}</div>

        {payload.map((item, index) => (
          <div
            key={index}
            className={`gt-row ${index ? 'gt-row--spaced' : ''}`}
          >
            {/* Color dinámico del bullet */}
            <span
              className="gt-dot"
              style={{ background: item.color || item.fill || '#fff' }}
            />
            <strong className="gt-value">{item.value}</strong>
            <span className="gt-name">{item.name}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>FDE Metrics Dashboard</h1>
        <div className="dark-mode-toggle">
          {darkMode ? (
            <FaSun onClick={() => setDarkMode(false)} />
          ) : (
            <FaMoon onClick={() => setDarkMode(true)} />
          )}
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`tab-button ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          Calls table
        </button>
        <button
          className={`tab-button ${activeTab === 'loads' ? 'active' : ''}`}
          onClick={() => setActiveTab('loads')}
        >
          Loads table
        </button>
      </div>

      {/* Dashboard View */}
      {activeTab === 'dashboard' && (
        <>
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
                <h3>Total Cost</h3>
                <p className="metric-value">${metrics.totalCost.toLocaleString()}</p>
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
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.outcome.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<GlassTooltip />} />
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
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.sentiment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<GlassTooltip />} />
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
                  <Tooltip cursor={false} content={<GlassTooltip />} />
                  <Bar dataKey="value" fill={primaryColor} activeBar={{
                    fill: `${primaryColor}CC`, // make it darker on hover
                    stroke: primaryColor,
                  }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>Daily Calls Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<GlassTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="won" stroke="#10B981" fill="#10B981" fillOpacity={0.25} />
                  <Area type="monotone" dataKey="lost" stroke="#EF4444" fill="#EF4444" fillOpacity={0.25} />
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
                    content={<GlassTooltip />}
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
                    fill={primaryColor + "41"}
                    barSize={6}
                    name="Range"
                  />

                  <Scatter dataKey="initial_rate" name="Initial Rate" fill={primaryColor} shape="circle" />
                  <Scatter dataKey="final_rate" name="Final Rate" fill={secondaryColor} shape="circle" />
                </ComposedChart>

              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Table View */}
      {activeTab === 'table' && (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="calls-table">
              <thead>
                <tr>
                  <th>Call ID</th>
                  <th>Created</th>
                  <th>MC Number</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Equipment</th>
                  <th>Pickup Date</th>
                  <th>Delivery Date</th>
                  <th>Initial Rate</th>
                  <th>Final Rate</th>
                  <th>Outcome</th>
                  <th>Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => (
                  <tr key={call.id} className={`table-row ${call.outcome}`}>
                    <td>{call.id}</td>
                    <td>{new Date(call.created_at).toLocaleDateString()}</td>
                    <td>{call.mc_number}</td>
                    <td>{call.origin}</td>
                    <td>{call.destination}</td>
                    <td>{call.equipment_type}</td>
                    <td>{new Date(call.pickup_datetime).toLocaleDateString()}</td>
                    <td>{new Date(call.delivery_datetime).toLocaleDateString()}</td>
                    <td>${call.initial_rate.toLocaleString()}</td>
                    <td>${call.final_rate.toLocaleString()}</td>
                    <td>
                      <span className={`outcome-badge ${call.outcome}`}>
                        {call.outcome.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`sentiment-badge ${call.sentiment}`}>
                        {call.sentiment === 'pos' ? 'Positive' :
                          call.sentiment === 'neg' ? 'Negative' : 'Neutral'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loads Table View */}
      {activeTab === 'loads' && (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="calls-table">
              <thead>
                <tr>
                  <th>Load ID</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Equipment</th>
                  <th>Pickup Date</th>
                  <th>Delivery Date</th>
                  <th>Loadboard Rate</th>
                  <th>Miles</th>
                  <th>Weight</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {loads.map((load) => (
                  <tr key={load.load_id} className="table-row">
                    <td>{load.load_id}</td>
                    <td>{load.origin}</td>
                    <td>{load.destination}</td>
                    <td>{load.equipment_type}</td>
                    <td>
                      {load.pickup_datetime
                        ? new Date(load.pickup_datetime).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>
                      {load.delivery_datetime
                        ? new Date(load.delivery_datetime).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>
                      {load.loadboard_rate
                        ? `$${load.loadboard_rate.toLocaleString()}`
                        : 'N/A'}
                    </td>
                    <td>
                      {load.miles
                        ? `${load.miles.toLocaleString()} mi`
                        : 'N/A'}
                    </td>
                    <td>
                      {load.weight
                        ? `${load.weight.toLocaleString()} lbs`
                        : 'N/A'}
                    </td>
                    <td>{load.notes || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}