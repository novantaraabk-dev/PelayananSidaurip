'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic import untuk menghindari SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

export function VillageMap() {
  const [isClient, setIsClient] = useState(false);
  const [leafletInstance, setLeafletInstance] = useState<any>(null);

  // Koordinat Desa Sidaurip, Gandrungmangu, Cilacap
  const center: [number, number] = [-7.3889, 108.8622];
  const zoom = 15;

  useEffect(() => {
    setIsClient(true);
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);

    // Load Leaflet JS dan L untuk Marker icons
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
      import('leaflet').then(L => {
        // Setup default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
        setLeafletInstance(L);
      });
    };
    document.head.appendChild(script);

    return () => {
      link.remove();
      script.remove();
    };
  }, []);

  if (!isClient || !leafletInstance) {
    return <Skeleton className="w-full h-full rounded-3xl" />;
  }

  return (
    <div className="w-full h-full rounded-[3rem] overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <Marker position={center}>
          <Popup>
            <div className="text-center text-sm font-semibold">
              <p className="font-black text-slate-900">Desa Sidaurip</p>
              <p className="text-slate-600 text-xs">Gandrungmangu, Cilacap</p>
              <p className="text-slate-500 text-xs mt-1">
                Lat: {center[0].toFixed(4)}, Lon: {center[1].toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
