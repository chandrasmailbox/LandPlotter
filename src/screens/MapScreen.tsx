import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface Point {
  latitude: number;
  longitude: number;
}

export default function MapScreen() {
  const [markers, setMarkers] = useState<Point[]>([]);
  const [area, setArea] = useState<number>(0);

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkers([...markers, { latitude, longitude }]);
    calculateArea([...markers, { latitude, longitude }]);
  };

  const calculateArea = (points: Point[]) => {
    if (points.length < 3) {
      setArea(0);
      return;
    }

    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].latitude * points[j].longitude;
      area -= points[j].latitude * points[i].longitude;
    }
    area = Math.abs(area) * 111319.9 * 111319.9 / 2;
    setArea(area);
  };

  const exportData = async () => {
    const data = {
      points: markers,
      area: {
        squareFeet: area * 10.764,
        squareYards: area * 1.196,
        acres: area * 0.000247105
      }
    };

    const filePath = `${FileSystem.documentDirectory}land-data.json`;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data));
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        onPress={handleMapPress}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker}
          />
        ))}
        {markers.length >= 3 && (
          <Polygon
            coordinates={markers}
            fillColor="rgba(0, 200, 0, 0.5)"
            strokeColor="rgba(0, 200, 0, 0.8)"
          />
        )}
      </MapView>
      <View style={styles.infoContainer}>
        <Text>Area: {'\n'}
          {(area * 10.764).toFixed(2)} sq ft{'\n'}
          {(area * 1.196).toFixed(2)} sq yards{'\n'}
          {(area * 0.000247105).toFixed(4)} acres
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={exportData}
          disabled={markers.length < 3}
        >
          <Text style={styles.buttonText}>Export Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});