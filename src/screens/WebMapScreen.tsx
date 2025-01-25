import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { MapContainer, TileLayer, Polygon, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Point {
  lat: number;
  lng: number;
}

function MapEvents({ onMapClick }: { onMapClick: (point: Point) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function WebMapScreen() {
  const [markers, setMarkers] = useState<Point[]>([]);
  const [area, setArea] = useState<number>(0);

  const handleMapClick = useCallback((point: Point) => {
    setMarkers(prev => {
      const newMarkers = [...prev, point];
      calculateArea(newMarkers);
      return newMarkers;
    });
  }, []);

  const calculateArea = (points: Point[]) => {
    if (points.length < 3) {
      setArea(0);
      return;
    }

    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].lat * points[j].lng;
      area -= points[j].lat * points[i].lng;
    }
    area = Math.abs(area) * 111319.9 * 111319.9 / 2;
    setArea(area);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.points) {
            const convertedPoints = data.points.map((p: any) => ({
              lat: p.latitude,
              lng: p.longitude
            }));
            setMarkers(convertedPoints);
            calculateArea(convertedPoints);
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapEvents onMapClick={handleMapClick} />
          {markers.length >= 3 && (
            <Polygon
              positions={markers}
              pathOptions={{
                fillColor: '#00ff00',
                fillOpacity: 0.5,
                color: '#00ff00',
                weight: 2
              }}
            />
          )}
        </MapContainer>
      </View>
      <View style={styles.infoContainer}>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          style={{ marginBottom: 10 }}
        />
        <Text>Area: {'\n'}
          {(area * 10.764).toFixed(2)} sq ft{'\n'}
          {(area * 1.196).toFixed(2)} sq yards{'\n'}
          {(area * 0.000247105).toFixed(4)} acres
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100vh',
  },
  mapContainer: {
    flex: 1,
  },
  infoContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
});