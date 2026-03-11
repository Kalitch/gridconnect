import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';
import { ConnectionEstimateResponse } from '../../types/api';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

interface MapComponentProps {
  center: [number, number];
  selectedProject: ConnectionEstimateResponse | null;
  analysisData: ConnectionEstimateResponse | null;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  center,
  selectedProject,
  analysisData
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layersRef = useRef<Record<string, L.Layer>>({});

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView(center, 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        className: 'gc-map-tiles'
      }).addTo(map.current);
    } else {
      map.current.setView(center, 10);
    }

    // Clear previous markers
    Object.values(layersRef.current).forEach(layer => {
      if (map.current) map.current.removeLayer(layer);
    });
    layersRef.current = {};

    // Add project location marker
    if (selectedProject) {
      const marker = L.marker([selectedProject.latitude, selectedProject.longitude], {
        icon: L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjExIiByPSI4Ii8+PHBhdGggZD0iTTEyIDd2OG0tNCAyaDgiLz48L3N2Zz4=',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        })
      }).addTo(map.current!);

      marker.bindPopup(`
        <div class="gc-popup">
          <h3>${selectedProject.name}</h3>
          <p><strong>Capacity:</strong> ${selectedProject.peak_generation_mw} MW</p>
          <p><strong>Queue Time:</strong> ${selectedProject.estimated_queue_years} years</p>
        </div>
      `);
      layersRef.current.projectMarker = marker;

      // Add accessibility circle
      const circle = L.circle([selectedProject.latitude, selectedProject.longitude], {
        radius: selectedProject.estimated_connection_distance * 1000,
        color: '#3b82f6',
        weight: 2,
        opacity: 0.3,
        fillOpacity: 0.1,
        fillColor: '#3b82f6'
      }).addTo(map.current!);
      layersRef.current.accessibilityCircle = circle;
    }

    // Add nearby substations
    if (analysisData?.nearby_substations) {
      analysisData.nearby_substations.forEach(sub => {
        const subMarker = L.marker([sub.latitude, sub.longitude], {
          icon: L.icon({
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9IiM4YjVjZjYiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE0IiBoZWlnaHQ9IjE0IiBmaWxsPSJub25lIi8+PC9zdmc+',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
          })
        }).addTo(map.current!);

        subMarker.bindPopup(`
          <div class="gc-popup">
            <h4>${sub.name}</h4>
            <p><strong>Voltage:</strong> ${sub.voltage || 'Unknown'}</p>
            <p><strong>Distance:</strong> ${sub.distance_km} km</p>
          </div>
        `);
        layersRef.current[`substation-${sub.id}`] = subMarker;
      });
    }
  }, [center, selectedProject, analysisData]);

  return <div ref={mapContainer} className="gc-map-container-inner" />;
};
