import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { FiTrendingUp, FiClock, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import './Analytics.css';

const Analytics = ({ bugs }) => {
  const analyticsData = useMemo(() => {
    const totalBugs = bugs.length;
    const openBugs = bugs.filter(bug => bug.status === 'Open').length;
    const inProgressBugs = bugs.filter(bug => bug.status === 'In Progress').length;
    const resolvedBugs = bugs.filter(bug => bug.status === 'Resolved').length;
    const closedBugs = bugs.filter(bug => bug.status === 'Closed').length;

    // Status distribution for pie chart
    const statusData = [
      { name: 'Open', value: openBugs, color: '#f59e0b' },
      { name: 'In Progress', value: inProgressBugs, color: '#3b82f6' },
      { name: 'Resolved', value: resolvedBugs, color: '#10b981' },
      { name: 'Closed', value: closedBugs, color: '#6b7280' }
    ];

    // Severity distribution
    const severityData = [
      { name: 'Critical', value: bugs.filter(bug => bug.severity === 'Critical').length, color: '#dc2626' },
      { name: 'High', value: bugs.filter(bug => bug.severity === 'High').length, color: '#ea580c' },
      { name: 'Medium', value: bugs.filter(bug => bug.severity === 'Medium').length, color: '#ca8a04' },
      { name: 'Low', value: bugs.filter(bug => bug.severity === 'Low').length, color: '#0284c7' }
    ];

    // Priority distribution
    const priorityData = [
      { name: 'Urgent', value: bugs.filter(bug => bug.priority === 'Urgent').length, color: '#dc2626' },
      { name: 'Normal', value: bugs.filter(bug => bug.priority === 'Normal').length, color: '#3b82f6' },
      { name: 'Low', value: bugs.filter(bug => bug.priority === 'Low').length, color: '#10b981' }
    ];

    // Bugs by date (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const bugsByDate = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      bugs: bugs.filter(bug => bug.createdAt === date).length
    }));

    // Resolution time (mock data for demonstration)
    const resolutionTimeData = [
      { name: '0-1 days', value: 15, color: '#10b981' },
      { name: '1-3 days', value: 25, color: '#3b82f6' },
      { name: '3-7 days', value: 20, color: '#f59e0b' },
      { name: '7+ days', value: 10, color: '#dc2626' }
    ];

    // Top assignees
    const assigneeStats = bugs.reduce((acc, bug) => {
      if (bug.assignedTo) {
        acc[bug.assignedTo] = (acc[bug.assignedTo] || 0) + 1;
      }
      return acc;
    }, {});

    const topAssignees = Object.entries(assigneeStats)
      .map(([name, count]) => ({ name, bugs: count }))
      .sort((a, b) => b.bugs - a.bugs)
      .slice(0, 5);

    return {
      totalBugs,
      openBugs,
      inProgressBugs,
      resolvedBugs,
      closedBugs,
      statusData,
      severityData,
      priorityData,
      bugsByDate,
      resolutionTimeData,
      topAssignees
    };
  }, [bugs]);

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-subtitle">Comprehensive insights into bug tracking and resolution</p>
      </div>

      <div className="analytics-stats">
        <div className="stat-card">
          <FiAlertTriangle className="stat-icon" />
          <div className="stat-number">{analyticsData.totalBugs}</div>
          <div className="stat-label">Total Bugs</div>
        </div>
        
        <div className="stat-card">
          <FiClock className="stat-icon" />
          <div className="stat-number">{analyticsData.openBugs}</div>
          <div className="stat-label">Open Bugs</div>
        </div>
        
        <div className="stat-card">
          <FiTrendingUp className="stat-icon" />
          <div className="stat-number">{analyticsData.inProgressBugs}</div>
          <div className="stat-label">In Progress</div>
        </div>
        
        <div className="stat-card">
          <FiCheckCircle className="stat-icon" />
          <div className="stat-number">{analyticsData.resolvedBugs}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-section">
          <div className="chart-header">
            <h3>Bug Status Distribution</h3>
            <p>Current distribution of bugs by status</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-header">
            <h3>Bugs by Severity</h3>
            <p>Distribution of bugs by severity level</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {analyticsData.severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-header">
            <h3>Bugs Over Time</h3>
            <p>New bugs reported in the last 7 days</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.bugsByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="bugs" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-header">
            <h3>Resolution Time</h3>
            <p>Time taken to resolve bugs</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.resolutionTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {analyticsData.resolutionTimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-header">
            <h3>Top Assignees</h3>
            <p>Bugs assigned to team members</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.topAssignees} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="bugs" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-header">
            <h3>Priority Distribution</h3>
            <p>Bugs by priority level</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="insights-section">
        <div className="insights-header">
          <h3>Key Insights</h3>
        </div>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <h4>Resolution Rate</h4>
            <p>
              {analyticsData.totalBugs > 0 
                ? `${((analyticsData.resolvedBugs / analyticsData.totalBugs) * 100).toFixed(1)}%`
                : '0%'
              } of bugs have been resolved
            </p>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">⚡</div>
            <h4>Critical Issues</h4>
            <p>
              {analyticsData.severityData.find(s => s.name === 'Critical')?.value || 0} critical bugs require immediate attention
            </p>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">👥</div>
            <h4>Team Workload</h4>
            <p>
              {analyticsData.topAssignees.length > 0 
                ? `${analyticsData.topAssignees[0].name} has the most bugs (${analyticsData.topAssignees[0].bugs})`
                : 'No bugs assigned yet'
              }
            </p>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <h4>Trend</h4>
            <p>
              {analyticsData.bugsByDate.slice(-3).reduce((sum, day) => sum + day.bugs, 0)} new bugs in the last 3 days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 