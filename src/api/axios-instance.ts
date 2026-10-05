import axiosReal from "axios";
import wafIntercept from "./wafIntercept";

const axios = axiosReal.create();
axios.interceptors.response.use((response) => {
  return response;
}, wafIntercept);

export default axios;
