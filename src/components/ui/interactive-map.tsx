"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface GeocodeResult {
  lat: string;
  lon: string;
}

interface InteractiveMapProps {
  city: string;
  apiKey: string;
}

const InteractiveMap = ({ city, apiKey }: InteractiveMapProps) => {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!city || !apiKey) {
        setError("City or API key is missing.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `https://geocode.maps.co/search?q=${encodeURIComponent(
            city,
          )}&api_key=${apiKey}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch coordinates");
        }
        const data = (await response.json()) as GeocodeResult[];
        if (data && data.length > 0) {
          const { lat, lon } = data[0]!;
          setCoords([parseFloat(lat), parseFloat(lon)]);
        } else {
          setError("Could not find coordinates for the city.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    void fetchCoordinates();
  }, [city, apiKey]);

  if (loading) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-secondary"></div>;
  }

  if (error) {
    return <div className="flex h-64 w-full items-center justify-center rounded-lg bg-destructive/20 text-destructive">{error}</div>;
  }

  if (!coords) {
    return <div className="flex h-64 w-full items-center justify-center rounded-lg bg-secondary">No map data.</div>;
  }

  return (
    <MapContainer center={coords} zoom={13} scrollWheelZoom={false} className="h-64 w-full rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={coords}>
        <Popup>{city}</Popup>
      </Marker>
    </MapContainer>
  );
};

export default InteractiveMap; 