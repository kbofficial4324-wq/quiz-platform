import axios from "axios";

const API = axios.create({
  baseURL:
    "https://quiz-platform-backend-xi50.onrender.com/api",
});

export default API;