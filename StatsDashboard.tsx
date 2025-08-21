import React from 'react';
import { NetworkPacket, TrafficStats } from '../types/network';
import {
  ChartBarIcon,
  GlobeAltIcon,
  ClockIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';

interface StatsDashboardProps {
  packets: NetworkPacket[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ packets }) => {
  const calculateStats = (): TrafficStats => {
    const now = Date.now();
    const lastMinutePackets = packets.filter(p => now - p.timestamp.getTime() < 60000);
    
    // Protocol breakdown
    const protocolBreakdown: Record<string, number> = {};
    packets.forEach(p => {
      protocolBreakdown[p.protocol] = (protocolBreakdown[p.protocol] || 0) + 1;
    });

    // Top source IPs
    const ipStats: Record<string, { count: number; bytes: number }> = {};
    packets.forEach(p => {
      if (!ipStats[p.sourceIP]) {
        ipStats[p.sourceIP] = { count: 0, bytes: 0 };
      }
      ipStats[p.sourceIP].count++;
      ipStats[p.sourceIP].bytes += p.length;
    });

    const topSourceIPs = Object.entries(ipStats)
      .map(([ip, stats]) => ({ ip, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top destination ports
    const portStats: Record<number, { count: number; protocol: string }> = {};
    packets.forEach(p => {
      if (!portStats[p.destinationPort]) {
        portStats[p.destinationPort] = { count: 0, protocol: p.protocol };
      }
      portStats[p.destinationPort].count++;
    });

    const topDestinationPorts = Object.entries(portStats)
      .map(([port, stats]) => ({ port: parseInt(port), ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalPackets: packets.length,
      totalBytes: packets.reduce((sum, p) => sum + p.length, 0),
      protocolBreakdown,
      topSourceIPs,
      topDestinationPorts,
      packetsPerSecond: Math.round(lastMinutePackets.length / 60),
      bytesPerSecond: Math.round(lastMinutePackets.reduce((sum, p) => sum + p.length, 0) / 60),
    };
  };

  const stats = calculateStats();

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Packets */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Total Packets</p>
            <p className="text-2xl font-bold text-white">{stats.totalPackets.toLocaleString()}</p>
          </div>
          <ChartBarIcon className="h-8 w-8 text-blue-500" />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {stats.packetsPerSecond}/sec average
        </p>
      </div>

      {/* Total Bytes */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Total Bandwidth</p>
            <p className="text-2xl font-bold text-white">{formatBytes(stats.totalBytes)}</p>
          </div>
          <GlobeAltIcon className="h-8 w-8 text-green-500" />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {formatBytes(stats.bytesPerSecond)}/sec average
        </p>
      </div>

      {/* Active Connections */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Unique IPs</p>
            <p className="text-2xl font-bold text-white">{stats.topSourceIPs.length}</p>
          </div>
          <ServerIcon className="h-8 w-8 text-purple-500" />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Active sources
        </p>
      </div>

      {/* Protocols */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Protocols</p>
            <p className="text-2xl font-bold text-white">
              {Object.keys(stats.protocolBreakdown).length}
            </p>
          </div>
          <ClockIcon className="h-8 w-8 text-orange-500" />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Different types
        </p>
      </div>

      {/* Top Source IPs */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 md:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-4">Top Source IPs</h3>
        <div className="space-y-3">
          {stats.topSourceIPs.map((item, index) => (
            <div key={item.ip} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 w-4">#{index + 1}</span>
                <span className="font-mono text-sm text-white">{item.ip}</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-white">{item.count} packets</p>
                <p className="text-xs text-gray-400">{formatBytes(item.bytes)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Destination Ports */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 md:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-4">Top Destination Ports</h3>
        <div className="space-y-3">
          {stats.topDestinationPorts.map((item, index) => (
            <div key={item.port} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 w-4">#{index + 1}</span>
                <span className="font-mono text-sm text-white">{item.port}</span>
                <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                  {item.protocol}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-white">{item.count} connections</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};