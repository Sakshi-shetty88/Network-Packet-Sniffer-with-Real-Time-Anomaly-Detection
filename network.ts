export interface NetworkPacket {
  id: string;
  timestamp: Date;
  sourceIP: string;
  destinationIP: string;
  sourcePort: number;
  destinationPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS';
  length: number;
  flags: string[];
  payloadSize: number;
  ttl: number;
}

export interface NetworkAlert {
  id: string;
  timestamp: Date;
  type: 'PORT_SCAN' | 'FLOOD_ATTACK' | 'SUSPICIOUS_TRAFFIC' | 'HIGH_BANDWIDTH' | 'UNKNOWN_PROTOCOL';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  sourceIP?: string;
  details: Record<string, any>;
  acknowledged: boolean;
}

export interface TrafficStats {
  totalPackets: number;
  totalBytes: number;
  protocolBreakdown: Record<string, number>;
  topSourceIPs: Array<{ ip: string; count: number; bytes: number }>;
  topDestinationPorts: Array<{ port: number; count: number; protocol: string }>;
  packetsPerSecond: number;
  bytesPerSecond: number;
}

export interface AnomalyThresholds {
  maxPacketsPerSecond: number;
  maxBytesPerSecond: number;
  portScanThreshold: number;
  suspiciousPortsCount: number;
  floodThresholdPerIP: number;
}