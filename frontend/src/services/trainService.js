const API_BASE_URL = "http://localhost:8000/api";

class TrainService {
  async searchTrains(fromStation, toStation, date, trainClass = "All Classes") {
    try {
      const params = new URLSearchParams({
        from_station: fromStation,
        to_station: toStation,
        date: date,
      });

      const response = await fetch(`${API_BASE_URL}/search-trains/?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch train data");
      }

      return {
        trains: data.data,
        totalTrains: data.data.length,
      };
    } catch (error) {
      console.error("Error searching trains:", error);
      throw error;
    }
  }
}

export default new TrainService();
