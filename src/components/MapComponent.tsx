import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    description: string;
    status: string;
  }>;
}

export const MapComponent: React.FC<MapComponentProps> = ({ 
  center = [9.0820, 8.6753], // Center of Nigeria
  zoom = 6,
  markers = []
}) => {
  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-sm">{marker.title}</h3>
                <p className="text-xs text-slate-600 mb-1">{marker.description}</p>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${
                    marker.status === 'New' ? 'bg-blue-500' :
                    marker.status === 'Acknowledged' ? 'bg-amber-500' :
                    marker.status === 'En route' ? 'bg-purple-500' :
                    'bg-emerald-500'
                  }`} />
                  <span className="text-[10px] font-bold uppercase">{marker.status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
