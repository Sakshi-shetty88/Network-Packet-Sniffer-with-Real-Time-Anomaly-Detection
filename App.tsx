import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheckIcon, 
  PlayIcon, 
  PauseIcon, 
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { TrafficChart } from './components/TrafficChart';
import { AlertPanel } from './components/AlertPanel';
import { PacketTable } from './components/PacketTable';
import { StatsDashboard } from './components/StatsDashboard';
import { NetworkPacket, NetworkAlert, AnomalyThresholds } from './types/network';
import { AnomalyDetector } from './utils/anomalyDetector';
import {
  generateNormalPacket,
  generatePortScanPackets,
  generateFloodPackets,
  generateSuspiciousPackets,
} from './utils/networkGenerator';

function App() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [packets, setPackets] = useState<NetworkPacket[]>([]);
  const [alerts, setAlerts] = useState<NetworkAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'packets' | 'settings'>('dashboard');
  const [thresholds, setThresholds] = useState<AnomalyThresholds>({
    maxPacketsPerSecond: 100,
    maxBytesPerSecond: 100000,
    portScanThreshold: 10,
    suspiciousPortsCount: 5,
    floodThresholdPerIP: 50,
  });

  const detectorRef = useRef<AnomalyDetector>();

  useEffect(() => {
    detectorRef.current = new AnomalyDetector(thresholds);
  }, [thresholds]);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const detector = detectorRef.current!;
      const newPackets: NetworkPacket[] = [];

      // Generate normal traffic (80% of the time)
      if (Math.random() > 0.2) {
        for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
          newPackets.push(generateNormalPacket());
        }
      }

      // Occasionally generate suspicious activity
      if (Math.random() > 0.95) {
        // Port scan attack
        const attackerIP = `192.168.1.${Math.floor(Math.random() * 255)}`;
        const targetIP = `10.0.0.${Math.floor(Math.random() * 255)}`;
        newPackets.push(...generatePortScanPackets(attackerIP, targetIP, 15));
      }

      if (Math.random() > 0.98) {
        // Flood attack
        const attackerIP = `172.16.0.${Math.floor(Math.random() * 255)}`;
        const targetIP = `10.0.0.${Math.floor(Math.random() * 255)}`;
        newPackets.push(...generateFloodPackets(attackerIP, targetIP, 60));
      }

      if (Math.random() > 0.97) {
        // Suspicious traffic
        newPackets.push(...generateSuspiciousPackets());
      }

      // Process packets and detect anomalies
      const newAlerts: NetworkAlert[] = [];
      newPackets.forEach(packet => {
        const packetAlerts = detector.addPacket(packet);
        newAlerts.push(...packetAlerts);
      });

      setPackets(prev => [...prev, ...newPackets].slice(-1000)); // Keep last 1000 packets
      if (newAlerts.length > 0) {
        setAlerts(prev => [...prev, ...newAlerts]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const handleAcknowledgeAlert = (alertId: string) => {
    detectorRef.current?.acknowledgeAlert(alertId);
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const activeAlertCount = alerts.filter(alert => !alert.acknowledged).length;
  const recentPackets = packets.slice(-300); // Show last 300 packets for performance

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="h-8 w-8 text-green-500" />
              <div>
                <h1 className="text-xl font-bold text-white">Network Packet Sniffer</h1>
                <p className="text-sm text-gray-400">Real-time network monitoring & anomaly detection</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-300">
                  {isMonitoring ? 'Monitoring' : 'Stopped'}
                </span>
              </div>
              
              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isMonitoring 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isMonitoring ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                <span>{isMonitoring ? 'Stop' : 'Start'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/30">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
              { id: 'alerts', label: 'Alerts', icon: ExclamationTriangleIcon, badge: activeAlertCount },
              { id: 'packets', label: 'Packet Log', icon: DocumentTextIcon },
              { id: 'settings', label: 'Settings', icon: CogIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <StatsDashboard packets={recentPackets} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Traffic Timeline</h3>
                <TrafficChart packets={recentPackets} type="timeline" />
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Protocol Distribution</h3>
                <TrafficChart packets={recentPackets} type="protocol" />
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top Destination Ports</h3>
                <TrafficChart packets={recentPackets} type="ports" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Security Alerts</h2>
            <AlertPanel alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />
          </div>
        )}

        {activeTab === 'packets' && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Network Packets</h2>
            <PacketTable packets={recentPackets} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Anomaly Detection Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Packets per Second
                </label>
                <input
                  type="number"
                  value={thresholds.maxPacketsPerSecond}
                  onChange={(e) => setThresholds(prev => ({
                    ...prev,
                    maxPacketsPerSecond: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Bytes per Second
                </label>
                <input
                  type="number"
                  value={thresholds.maxBytesPerSecond}
                  onChange={(e) => setThresholds(prev => ({
                    ...prev,
                    maxBytesPerSecond: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Port Scan Threshold
                </label>
                <input
                  type="number"
                  value={thresholds.portScanThreshold}
                  onChange={(e) => setThresholds(prev => ({
                    ...prev,
                    portScanThreshold: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Flood Threshold per IP
                </label>
                <input
                  type="number"
                  value={thresholds.floodThresholdPerIP}
                  onChange={(e) => setThresholds(prev => ({
                    ...prev,
                    floodThresholdPerIP: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-400 mb-2">Note</h4>
              <p className="text-sm text-gray-300">
                Changes to thresholds take effect immediately. Lower values will trigger more alerts, 
                while higher values may miss some anomalies. Adjust based on your network's normal traffic patterns.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;