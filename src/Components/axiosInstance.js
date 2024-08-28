import axios from 'axios';
import dayjs from 'dayjs';
import * as jwt_decode from 'jwt-decode';

export const baseURL = 'http://localhost:9000';

export const axiosInstance = axios.create({
  baseURL,
});

axiosInstance.interceptors.request.use((req) => {
  const authAccess = localStorage.getItem('accessToken');
  req.headers.Authorization = `Bearer ${authAccess}`;
  console.log('interceptor run');

  // const user = jwt_decode(authAccess);
  // const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;
  // console.log("isExpired:", isExpired);
  // if (!isExpired) return req;

  return req;
});

// axiosInstance.interceptors.response.use(
//   (res) => {
//     return res;
//   },
//   async (error) => {
//     console.log(error.response.status);

//     let retries = 0;
//     while (retries < 3) {
//       const errorConfig = error.config;

//       if (error.response?.status === 401 && !errorConfig._retry) {
//         const responseAxios = await axios.post(baseURL + "/refresh", "", {
//           withCredentials: true,
//         });
//         console.log(responseAxios);
//       }

//       retries = retries + 1;
//     }

//     return error;
//   }
// );

export default axiosInstance;
