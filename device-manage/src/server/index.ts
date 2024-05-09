import { createAxios } from "../utils/axios";

const baseURL = 'http://localhost:9000'
const request = createAxios({
    baseURL
});

export default request;