import React from 'react';
import { ExclamationTriangleIcon, ShieldExclamationIcon, BoltIcon, EyeIcon } from '@heroicons/react/24/outline';
import { NetworkAlert } from '../types/network';

interface AlertPanelProps {
  alerts: NetworkAlert[];
  onAcknowledge: (alertId: string) => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onAcknowledge }) => {
  const getAlertIcon = (type: NetworkAlert['type']) => {
    switch (type) {
      case 'PORT_SCAN':
        return <EyeIcon className="h-5 w-5" />;
      case 'FLOOD_ATTACK':
        return <BoltIcon className="h-5 w-5" />;
      case 'SUSPICIOUS_TRAFFIC':
        return <ShieldExclamationIcon className="h-5 w-5" />;
      case 'HIGH_BANDWIDTH':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: NetworkAlert['severity']) => {
    switch (severity) {
      case 'low':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'high':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'critical':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);

  return (
    <div className="space-y-4">
      {unacknowledgedAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            Active Alerts ({unacknowledgedAlerts.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {unacknowledgedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)} transition-all duration-200 hover:bg-opacity-20`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium uppercase tracking-wide opacity-75">
                          {alert.type.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 mb-2">{alert.message}</p>
                      <p className="text-xs text-gray-400">
                        {alert.timestamp.toLocaleString()}
                      </p>
                      {alert.sourceIP && (
                        <p className="text-xs text-gray-400 mt-1">
                          Source: <span className="font-mono text-gray-200">{alert.sourceIP}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {acknowledgedAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-400 mb-3">
            Acknowledged Alerts ({acknowledgedAlerts.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {acknowledgedAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 opacity-60"
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-1 text-gray-500">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="text-center py-8">
          <ShieldExclamationIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No alerts detected</p>
          <p className="text-sm text-gray-500 mt-1">Network monitoring is active</p>
        </div>
      )}
    </div>
  );
};