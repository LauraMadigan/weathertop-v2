import { stationStore } from "../models/station-store.js";
import { readingStore } from "../models/reading-store.js";
import axios from "axios";

const APIKEY = '6f21e934296c411573a6f081d73a2e1d';

export const stationController = {
  async index(request, response) {
    const station = await stationStore.getStationById(request.params.id);
    const viewData = {
      title: "Station",
      station: station
    };
    if (station.readings.length > 0) {
      response.render("station-view", viewData);
    } else {
      response.render("station-view-no-readings", viewData);
    }
  },

  async addReading(request, response) {
    const station = await stationStore.getStationById(request.params.id);
    const newReading = {
      code: Number(request.body.code),
      temp: Number(request.body.temp),
      windSpeed: Number(request.body.windSpeed),
      windDirection: Number(request.body.windDirection),
      pressure: Number(request.body.pressure),
    };
    console.log(`adding reading ${newReading.code}`);
    await readingStore.addReading(station._id, newReading);
    response.redirect("/station/" + station._id);
  },

  async addAutoGeneratedReading(request, response) {
    const station = await stationStore.getStationById(request.params.id);
    let generatedReading = await getGeneratedReading(station);
    console.log(`adding reading from OpenWeatherMap API`);
    await readingStore.addReading(station._id, generatedReading);
    response.redirect("/station/" + station._id);
  },

  async deleteReading(request, response) {
    const station = await stationStore.getStationById(request.params.stationid);
    const reading = await readingStore.getReadingById(request.params.readingid);
    readingStore.deleteReading(reading._id);
    response.redirect("/station/" + station._id);
  },

  async delete(request, response) {
    const station = await stationStore.getStationById(request.params.id);
    stationStore.deleteStationById(station._id);
    response.redirect("/dashboard/");
  }
};


export async function getGeneratedReading(station) {
  let report = {};
  const lat = station.lat;
  const lng = station.long;
  const requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&units=metric&appid=${APIKEY}`;
  let newReading = {};
  const result = await axios.get(requestUrl);
  if (result.status == 200) {
    const data = result.data.current;
    newReading = {
      code: Number(data.weather[0].id),
      temp: Number(data.temp),
      windSpeed: Number(data.wind_speed),
      windDirection: Number(data.wind_deg),
      pressure: Number(data.pressure),
    };
  }
  return newReading;
}