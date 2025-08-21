import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { NetworkPacket } from '../types/network';

interface PacketTableProps {
  packets: NetworkPacket[];
}

export const PacketTable: React.FC<PacketTableProps> = ({ packets }) => {
  const [filter, setFilter] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('');

  const filteredPackets = packets.filter(packet => {
    const matchesSearch = filter === '' || 
      packet.sourceIP.includes(filter) ||
      packet.destinationIP.includes(filter) ||
      packet.sourcePort.toString().includes(filter) ||
      packet.destinationPort.toString().includes(filter);
    
    const matchesProtocol = protocolFilter === '' || packet.protocol === protocolFilter;
    
    return matchesSearch && matchesProtocol;
  }).slice(0, 100); // Limit to last 100 packets for performance

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'TCP': return 'text-blue-400 bg-blue-500/10';
      case 'UDP': return 'text-green-400 bg-green-500/10';
      case 'ICMP': return 'text-yellow-400 bg-yellow-500/10';
      case 'HTTP': return 'text-purple-400 bg-purple-500/10';
      case 'HTTPS': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search IP addresses, ports..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <FunnelIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Protocols</option>
            <option value="TCP">TCP</option>
            <option value="UDP">UDP</option>
            <option value="ICMP">ICMP</option>
            <option value="HTTP">HTTP</option>
            <option value="HTTPS">HTTPS</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">Timestamp</th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">Source</th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">Destination</th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">Protocol</th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">Length</th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredPackets.map((packet) => (
                <tr key={packet.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                    {packet.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 text-gray-200">
                    <div className="font-mono text-xs">
                      {packet.sourceIP}:{packet.sourcePort}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-200">
                    <div className="font-mono text-xs">
                      {packet.destinationIP}:{packet.destinationPort}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProtocolColor(packet.protocol)}`}>
                      {packet.protocol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                    {packet.length}B
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-1">
                      {packet.flags.map((flag) => (
                        <span
                          key={flag}
                          className="px-1 py-0.5 text-xs bg-gray-700 text-gray-300 rounded"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-400 text-center">
        Showing {filteredPackets.length} of {packets.length} packets
      </div>
    </div>
  );
};