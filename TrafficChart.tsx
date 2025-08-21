import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { NetworkPacket } from '../types/network';

interface TrafficChartProps {
  packets: NetworkPacket[];
  type: 'timeline' | 'protocol' | 'ports';
}

export const TrafficChart: React.FC<TrafficChartProps> = ({ packets, type }) => {
  const generateTimelineData = () => {
    const now = Date.now();
    const intervals = [];
    
    for (let i = 59; i >= 0; i--) {
      const intervalStart = now - (i + 1) * 1000;
      const intervalEnd = now - i * 1000;
      const intervalPackets = packets.filter(
        p => p.timestamp.getTime() >= intervalStart && p.timestamp.getTime() < intervalEnd
      );
      
      intervals.push({
        time: new Date(intervalEnd).toLocaleTimeString(),
        packets: intervalPackets.length,
        bytes: intervalPackets.reduce((sum, p) => sum + p.length, 0),
      });
    }
    
    return intervals;
  };

  const generateProtocolData = () => {
    const protocolCounts: Record<string, number> = {};
    packets.forEach(p => {
      protocolCounts[p.protocol] = (protocolCounts[p.protocol] || 0) + 1;
    });
    
    return Object.entries(protocolCounts).map(([protocol, count]) => ({
      protocol,
      count,
    }));
  };

  const generatePortData = () => {
    const portCounts: Record<number, number> = {};
    packets.forEach(p => {
      portCounts[p.destinationPort] = (portCounts[p.destinationPort] || 0) + 1;
    });
    
    return Object.entries(portCounts)
      .map(([port, count]) => ({ port: parseInt(port), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const COLORS = ['#00ff88', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316'];

  if (type === 'timeline') {
    const data = generateTimelineData();
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="packets" 
              stroke="#00ff88" 
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'protocol') {
    const data = generateProtocolData();
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              label={({ protocol, count }) => `${protocol}: ${count}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'ports') {
    const data = generatePortData();
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="port" 
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="count" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
};