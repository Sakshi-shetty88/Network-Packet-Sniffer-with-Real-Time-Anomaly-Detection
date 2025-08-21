import { NetworkPacket, NetworkAlert, AnomalyThresholds } from '../types/network';

export class AnomalyDetector {
  private packets: NetworkPacket[] = [];
  private alerts: NetworkAlert[] = [];
  private thresholds: AnomalyThresholds;
  private portScanTracker = new Map<string, Set<number>>();
  private floodTracker = new Map<string, number>();
  private packetRates: number[] = [];

  constructor(thresholds: AnomalyThresholds) {
    this.thresholds = thresholds;
  }

  addPacket(packet: NetworkPacket): NetworkAlert[] {
    this.packets.push(packet);
    this.cleanOldData();
    
    const newAlerts: NetworkAlert[] = [];
    
    // Check for port scanning
    const portScanAlert = this.checkPortScan(packet);
    if (portScanAlert) newAlerts.push(portScanAlert);
    
    // Check for flooding
    const floodAlert = this.checkFlood(packet);
    if (floodAlert) newAlerts.push(floodAlert);
    
    // Check for suspicious traffic
    const suspiciousAlert = this.checkSuspiciousTraffic(packet);
    if (suspiciousAlert) newAlerts.push(suspiciousAlert);
    
    // Check for high bandwidth usage
    const bandwidthAlert = this.checkBandwidth();
    if (bandwidthAlert) newAlerts.push(bandwidthAlert);
    
    this.alerts.push(...newAlerts);
    return newAlerts;
  }

  private checkPortScan(packet: NetworkPacket): NetworkAlert | null {
    const key = `${packet.sourceIP}->${packet.destinationIP}`;
    
    if (!this.portScanTracker.has(key)) {
      this.portScanTracker.set(key, new Set());
    }
    
    const ports = this.portScanTracker.get(key)!;
    ports.add(packet.destinationPort);
    
    if (ports.size >= this.thresholds.portScanThreshold) {
      return {
        id: `alert_${Date.now()}_portscan`,
        timestamp: new Date(),
        type: 'PORT_SCAN',
        severity: 'high',
        message: `Port scanning detected: ${packet.sourceIP} scanning ${ports.size} ports on ${packet.destinationIP}`,
        sourceIP: packet.sourceIP,
        details: {
          targetIP: packet.destinationIP,
          portsScanned: Array.from(ports),
          scanDuration: '< 1 minute'
        },
        acknowledged: false,
      };
    }
    
    return null;
  }

  private checkFlood(packet: NetworkPacket): NetworkAlert | null {
    const recentPackets = this.packets.filter(p => 
      Date.now() - p.timestamp.getTime() < 10000 && // Last 10 seconds
      p.sourceIP === packet.sourceIP
    );
    
    if (recentPackets.length >= this.thresholds.floodThresholdPerIP) {
      return {
        id: `alert_${Date.now()}_flood`,
        timestamp: new Date(),
        type: 'FLOOD_ATTACK',
        severity: 'critical',
        message: `Potential flood attack detected from ${packet.sourceIP}: ${recentPackets.length} packets in 10 seconds`,
        sourceIP: packet.sourceIP,
        details: {
          packetCount: recentPackets.length,
          timeWindow: '10 seconds',
          avgPacketSize: Math.round(recentPackets.reduce((sum, p) => sum + p.length, 0) / recentPackets.length)
        },
        acknowledged: false,
      };
    }
    
    return null;
  }

  private checkSuspiciousTraffic(packet: NetworkPacket): NetworkAlert | null {
    const suspiciousPorts = [1337, 31337, 4444, 6666, 8080, 9999, 12345, 54321];
    
    if (suspiciousPorts.includes(packet.destinationPort)) {
      return {
        id: `alert_${Date.now()}_suspicious`,
        timestamp: new Date(),
        type: 'SUSPICIOUS_TRAFFIC',
        severity: 'medium',
        message: `Suspicious traffic detected: Connection to known malicious port ${packet.destinationPort}`,
        sourceIP: packet.sourceIP,
        details: {
          suspiciousPort: packet.destinationPort,
          protocol: packet.protocol,
          destinationIP: packet.destinationIP,
          flags: packet.flags
        },
        acknowledged: false,
      };
    }
    
    return null;
  }

  private checkBandwidth(): NetworkAlert | null {
    const now = Date.now();
    const lastSecondPackets = this.packets.filter(p => now - p.timestamp.getTime() < 1000);
    
    const packetsPerSecond = lastSecondPackets.length;
    const bytesPerSecond = lastSecondPackets.reduce((sum, p) => sum + p.length, 0);
    
    this.packetRates.push(packetsPerSecond);
    if (this.packetRates.length > 60) {
      this.packetRates.shift();
    }
    
    if (packetsPerSecond > this.thresholds.maxPacketsPerSecond) {
      return {
        id: `alert_${Date.now()}_bandwidth_packets`,
        timestamp: new Date(),
        type: 'HIGH_BANDWIDTH',
        severity: 'medium',
        message: `High packet rate detected: ${packetsPerSecond} packets/second (threshold: ${this.thresholds.maxPacketsPerSecond})`,
        details: {
          currentRate: packetsPerSecond,
          threshold: this.thresholds.maxPacketsPerSecond,
          metric: 'packets per second'
        },
        acknowledged: false,
      };
    }
    
    if (bytesPerSecond > this.thresholds.maxBytesPerSecond) {
      return {
        id: `alert_${Date.now()}_bandwidth_bytes`,
        timestamp: new Date(),
        type: 'HIGH_BANDWIDTH',
        severity: 'medium',
        message: `High bandwidth usage detected: ${Math.round(bytesPerSecond / 1024)}KB/s`,
        details: {
          currentRate: bytesPerSecond,
          threshold: this.thresholds.maxBytesPerSecond,
          metric: 'bytes per second'
        },
        acknowledged: false,
      };
    }
    
    return null;
  }

  private cleanOldData(): void {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.packets = this.packets.filter(p => p.timestamp.getTime() > fiveMinutesAgo);
    
    // Clean port scan tracker
    this.portScanTracker.clear();
    
    // Clean flood tracker
    this.floodTracker.clear();
  }

  getRecentPackets(minutes: number = 5): NetworkPacket[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.packets.filter(p => p.timestamp.getTime() > cutoff);
  }

  getAlerts(): NetworkAlert[] {
    return [...this.alerts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }
}