import { useEffect, useState } from "react";
import { Text, View, ActivityIndicator, StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome

export default function Index() {
  const [data, setData] = useState<{ temperature: number; humidity: number; timestamp: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      fetch("http://192.168.1.6:3000/api/readings")
        .then((response) => response.json())
        .then((json) => {
          if (Array.isArray(json) && json.length > 0) {
            setData({
              temperature: json[0].temperature,
              humidity: json[0].humidity,
              timestamp: json[0].timestamp, // Assuming the API provides timestamp
            });
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setLoading(false);
        });
    };

    // Fetch immediately
    fetchData();

    // Then poll every 5 seconds
    const interval = setInterval(fetchData, 5000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Weather Data</Text>
        <View style={styles.dataContainer}>
          <View style={styles.dataItem}>
            <Icon name="thermometer-half" style={styles.icon} size={30} color="#FF6347" />  {/* FontAwesome Icon */}
            <Text style={styles.dataText}>{data.temperature} °C</Text>
          </View>
          <View style={styles.dataItem}>
            <Icon name="tint" style={styles.icon} size={30} color="#1E90FF" /> {/* FontAwesome Icon */}
            <Text style={styles.dataText}>{data.humidity} %</Text>
          </View>
          <Text style={styles.timestamp}>Last updated: {data.timestamp}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3f51b5", // A soft blue background
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 15,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3f51b5",
    marginBottom: 15,
  },
  dataContainer: {
    width: "100%",
    alignItems: "center",
  },
  dataItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  dataText: {
    fontSize: 22,
    color: "#333",
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 14,
    color: "#888",
    marginTop: 20,
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 18,
    marginTop: 10,
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 18,
  },
});
