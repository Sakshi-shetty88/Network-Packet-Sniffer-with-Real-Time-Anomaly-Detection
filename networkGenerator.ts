import { NetworkPacket, NetworkAlert } from '../types/network';

const commonPorts = [80, 443, 22, 21, 25, 53, 110, 143, 993, 995, 3389, 5432, 3306, 6379, 27017];
const suspiciousPorts = [1337, 31337, 4444, 6666, 8080, 9999, 12345, 54321];
const protocols: NetworkPacket['protocol'][] = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS'];

function randomIP(): string {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function randomPort(): number {
  const isCommon = Math.random() > 0.3;
  if (isCommon) {
    return commonPorts[Math.floor(Math.random() * commonPorts.length)];
  }
  return Math.floor(Math.random() * 65535) + 1;
}

function randomSuspiciousPort(): number {
  return suspiciousPorts[Math.floor(Math.random() * suspiciousPorts.length)];
}

function generateFlags(): string[] {
  const allFlags = ['SYN', 'ACK', 'FIN', 'RST', 'PSH', 'URG'];
  const flagCount = Math.floor(Math.random() * 3) + 1;
  const selectedFlags = [];
  
  for (let i = 0; i < flagCount; i++) {
    const flag = allFlags[Math.floor(Math.random() * allFlags.length)];
    if (!selectedFlags.includes(flag)) {
      selectedFlags.push(flag);
    }
  }
  
  return selectedFlags;
}

export function generateNormalPacket(): NetworkPacket {
  return {
    id: `pkt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    sourceIP: randomIP(),
    destinationIP: randomIP(),
    sourcePort: randomPort(),
    destinationPort: randomPort(),
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    length: Math.floor(Math.random() * 1500) + 64,
    flags: generateFlags(),
    payloadSize: Math.floor(Math.random() * 1200) + 20,
    ttl: Math.floor(Math.random() * 64) + 64,
  };
}

export function generatePortScanPackets(attackerIP: string, targetIP: string, portCount: number = 20): NetworkPacket[] {
  const packets: NetworkPacket[] = [];
  const baseTime = Date.now();
  
  for (let i = 0; i < portCount; i++) {
    packets.push({
      id: `scan_${baseTime}_${i}`,
      timestamp: new Date(baseTime + i * 100),
      sourceIP: attackerIP,
      destinationIP: targetIP,
      sourcePort: Math.floor(Math.random() * 65535) + 1024,
      destinationPort: Math.floor(Math.random() * 65535) + 1,
      protocol: 'TCP',
      length: 64,
      flags: ['SYN'],
      payloadSize: 0,
      ttl: 64,
    });
  }
  
  return packets;
}

export function generateFloodPackets(attackerIP: string, targetIP: string, count: number = 100): NetworkPacket[] {
  const packets: NetworkPacket[] = [];
  const baseTime = Date.now();
  
  for (let i = 0; i < count; i++) {
    packets.push({
      id: `flood_${baseTime}_${i}`,
      timestamp: new Date(baseTime + i * 10),
      sourceIP: attackerIP,
      destinationIP: targetIP,
      sourcePort: Math.floor(Math.random() * 65535) + 1024,
      destinationPort: 80,
      protocol: 'TCP',
      length: Math.floor(Math.random() * 1500) + 1000,
      flags: ['SYN', 'ACK'],
      payloadSize: Math.floor(Math.random() * 1200) + 800,
      ttl: 64,
    });
  }
  
  return packets;
}

export function generateSuspiciousPackets(): NetworkPacket[] {
  const packets: NetworkPacket[] = [];
  const suspiciousIP = randomIP();
  
  // Generate packets targeting suspicious ports
  for (let i = 0; i < 5; i++) {
    packets.push({
      id: `sus_${Date.now()}_${i}`,
      timestamp: new Date(),
      sourceIP: suspiciousIP,
      destinationIP: randomIP(),
      sourcePort: randomPort(),
      destinationPort: randomSuspiciousPort(),
      protocol: 'TCP',
      length: Math.floor(Math.random() * 200) + 64,
      flags: ['SYN'],
      payloadSize: Math.floor(Math.random() * 100) + 20,
      ttl: Math.floor(Math.random() * 32) + 32,
    });
  }
  
  return packets;
}