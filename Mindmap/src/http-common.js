import axios from "axios"; // Promise based HTTP client RESTful API

export default axios.create({
    baseURL: "https://todoreactnative-v1.herokuapp.com/api",
    headers: {
        "Content-type": "application/json"
    }
});