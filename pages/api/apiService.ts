import axios from 'axios';
import { NextRouter } from 'next/router';

/**
 * BackAPIリクエストを接続管理
 * */
// APIURL
// const BackApiURL = "http://127.0.0.1:5000"; // ローカル実行用
// const BackApiURL = process.env.NEXT_PUBLIC_BACKEND_URL;
// const BackApiURL = "http://backend:5000/api";
const BackApiURL = "http://localhost";


console.log("Backend URL in apiService.ts :", BackApiURL);

//ENDPOINTS
export const API_ENDPOINTS = {
    login: "login",
    display_by_store: "api/display_by_store",
    display_by_date: "api/display_by_date",
    download: "download",
} 

//APIリクエスト関数
export const fetchData = async (endpoint: string, data: any, router: NextRouter) => {
  try {
    // ここのリクエストが上手くわたっていない
    console.log("receive_endpoint: ", endpoint);
    console.log("receive_data: ", data);
    console.log("receive_router: ", router);
    console.log("hogehogehogehogehogehoge");
    // console.log("post endpoint", `${BackApiURL}/${endpoint}`);

    // console.log("starting_process");
    const response = await axios.post(`${BackApiURL}/${endpoint}`, data, {
      withCredentials: true
    });
    // console.log("finished_process");
    
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);

    if (error.response && error.response.status === 401) {
      router.push('/login');
    }
    throw error;
  }
};
