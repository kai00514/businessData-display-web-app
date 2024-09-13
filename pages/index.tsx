import Layout from "@/components/Layout";
import axios from 'axios';  // これを追加

import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormControl,
  InputLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import IconButton from "@mui/material/IconButton";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useTheme } from "@mui/material/styles";
import Holidays from "date-holidays";
import { fetchData, API_ENDPOINTS } from "./api/apiService";
import { storeProcessData, dateProcessData } from "./api/dataTransformer";
import { initialStores } from "./shopData";

import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ja";
import { Store } from "@mui/icons-material";
// add 20240828
import { useRouter } from 'next/router';

const dayjsAdapter = new AdapterDayjs({ locale: "ja" });

const IndexPage = () => {
  //Muiのtheme設定を読み込む
  const theme = useTheme();
  const router = useRouter();
  // local executation 
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const response = await axios.get('http://127.0.0.1:5000', {
  //         withCredentials: true
  //       });
  //       console.log("User is authenticated:", response.data.user);
  //     } catch (error) {
  //       console.error("Authentication check failed:", error);
  //       router.push('/login');
  //     }
  //   };

  //   checkAuth();
  // }, [router]);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
        //   withCredentials: true
        // });
        console.log('response = await axios.get("/")');
        const response = await axios.get("/", {
          withCredentials: true
        });
        // console.log("response: ", response);
        console.log("User is authenticated:", response.data.user);
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push('/login');
      }
    };
  
    checkAuth();
  }, [router]);
  // カレンダー用状態 前日を選択させる処理含む
  const [date1, setDate1] = useState(dayjs().subtract(1, "day"));
  const [date2, setDate2] = useState(dayjs().subtract(1, "day"));
  const [date3, setDate3] = useState(dayjs().subtract(1, "day"));
  const [date4, setDate4] = useState(dayjs().subtract(1, "day"));

  // モーダル用状態
  const [openStoreModal, setOpenStoreModal] = useState(false);
  const [openPrefectureModal, setOpenPrefectureModal] = useState(false);

  const [selectedStores, setSelectedStores] = useState([]); //選択した店舗名
  //const [selectedArea, setSelectedArea] = useState("");
  const [selectedPrefecture, setSelectedPrefecture] = useState(""); //選択した都道府県名

  const [searchText, setSearchText] = useState(""); //店舗名でフィルタリング時の入力値
  const [filteredStores, setFilteredStores] = useState(initialStores); // 入力値によるフィルタリング店舗(初期値は全店)
  //const [selectedPrefectureStores, setSelectedPrefectureStores] = useState([]); // 都道府県選択によるフィルタリング店舗

  // チェックボックス用状態
  const [dailyCheck, setDailyCheck] = useState("店舗別"); //日別or店舗別
  const [compareCheck, setCompareCheck] = useState(false); //比較対象

  // 日別or店舗別でカラム名切り替え
  const [headerTitles, setHeaderTitles] = useState({
    firstColumn: "店舗名",
    secondColumn: "店番",
  });

  //ラジオボタン用状態
  const [locationValue, setLocationValue] = useState("全て"); //"全て or 駅前 or 郊外"
  const [typeValue, setTypeValue] = useState("全て"); //"全て or 直営 or FC"
  const [salesInclusionValue, setSalesInclusionValue] = useState("true"); //その他売り上げ込みかどうか

  //型指定
  interface TotalData {
    storeName: string;
    storeNumber: string;
    netSalesA: number;
    netSalesB: number;
    netSalesChange: number;
    netSalesRatio: number;
    usersA: number;
    usersB: number;
    usersChange: number;
    usersRatio: number;
    avgPriceA: number;
    avgPriceB: number;
    avgPriceChange: number;
    avgPriceRatio: number;
    newUsersA: number;
    newUsersB: number;
    newUsersChange: number;
    newUsersRatio: number;
    newUsersRateA: number;
    newUsersRateB: number;
    otherSalesA: number;
    otherSalesB: number;
    otherSalesChange: number;
    otherSalesRatio: number;
  }
  interface StoreData {
    storeName: string;
    storeNumber: string;
    netSalesA: number;
    netSalesB: number;
    netSalesChange: number;
    netSalesRatio: number;
    usersA: number;
    usersB: number;
    usersChange: number;
    usersRatio: number;
    avgPriceA: number;
    avgPriceB: number;
    avgPriceChange: number;
    avgPriceRatio: number;
    newUsersA: number;
    newUsersB: number;
    newUsersChange: number;
    newUsersRatio: number;
    newUsersRateA: number;
    newUsersRateB: number;
    otherSalesA: number;
    otherSalesB: number;
    otherSalesChange: number;
    otherSalesRatio: number;
  }
  interface StoresData {
    totalData: TotalData;
    storeData: StoreData[];
  }

  const [storesData, setStoresData] = useState<StoresData>({
    totalData: {
      storeName: "合計",
      storeNumber: "",
      netSalesA: 0,
      netSalesB: 0,
      netSalesChange: 0,
      netSalesRatio: 0,
      usersA: 0,
      usersB: 0,
      usersChange: 0,
      usersRatio: 0,
      avgPriceA: 0,
      avgPriceB: 0,
      avgPriceChange: 0,
      avgPriceRatio: 0,
      newUsersA: 0,
      newUsersB: 0,
      newUsersChange: 0,
      newUsersRatio: 0,
      newUsersRateA: 0,
      newUsersRateB: 0,
      otherSalesA: 0,
      otherSalesB: 0,
      otherSalesChange: 0,
      otherSalesRatio: 0,
    },
    storeData: [],
  });
  //昇順、降順 現在の状況
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  //ソート列　現在ソートしている列
  const [sortKey, setSortKey] = useState<string>("");

  // 店舗選択モーダルの開閉を制御
  const handleOpenStoreModal = () => setOpenStoreModal(true);
  const handleCloseStoreModal = () => setOpenStoreModal(false);

  // 都道府県選択モーダルの開閉を制御
  const handleOpenPrefectureModal = () => setOpenPrefectureModal(true);
  const handleClosePrefectureModal = () => setOpenPrefectureModal(false);

  //店舗選択クリアボタン押下
  const clearStores = () => {
    setSelectedStores([]);
  };

  //店舗検索入力値の管理ハンドラ
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };
  //入力値からフィルタリング
  const handleSelectOpen = () => {
    //let filtered = radioValueFilterStores();//ラジオボタンフィルタリング
    let filtered = initialStores;
    if (searchText) {
      filtered = filtered.filter((store) =>
        store.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredStores(filtered);
    } else {
      setFilteredStores(filtered); // 未入力の場合は全データを表示
    }
  };

  // 選択都道府県セットハンドラ
  const setPrefectureChange = (e) => {
    setSelectedPrefecture(e.target.value);
  };
  // 都道府県選択からのフィルタリング
  const handlePrefectureChange = () => {
    //let filtered = radioValueFilterStores();//ラジオボタンフィルタリング
    let filtered = initialStores;
    if (selectedPrefecture) {
      filtered = filtered.filter(
        (store) => store.prefecture === selectedPrefecture
      );
      setFilteredStores(filtered);
      setSelectedStores(filtered);
    } else {
      setFilteredStores(filtered); // 未入力の場合は全データを表示
      //setSelectedStores([]); // 選択都道府県がない場合は選択を解除
    }
  };

  //店舗名チェックボックスがチェックされたら発動するハンドラ
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;

    const selectedStoreIds =
      typeof value === "string" ? value.split(",") : value;

    const newSelectedStores = initialStores.filter((store) =>
      selectedStoreIds.includes(store.id)
    );

    setSelectedStores(newSelectedStores);
  };
  // areas オブジェクトを初期化する関数
  const generateAreasFromStores = (stores) => {
    const areas = {};

    stores.forEach((store) => {
      const { areaDivision, prefecture } = store;

      // エリアが存在しない場合、新しい配列を作成
      if (!areas[areaDivision]) {
        areas[areaDivision] = [];
      }

      // 都道府県がエリアに追加されていない場合、追加
      if (!areas[areaDivision].includes(prefecture)) {
        areas[areaDivision].push(prefecture);
      }
    });

    return areas;
  };
  // 都道府県のリストを抽出する関数
  const extractPrefecturesFromAreas = (areas) => {
    const prefectures = [];

    // 各エリアの都道府県を取得してリストに追加
    Object.keys(areas).forEach((areaDivision) => {
      areas[areaDivision].forEach((prefecture) => {
        if (!prefectures.includes(prefecture)) {
          prefectures.push(prefecture);
        }
      });
    });

    return prefectures;
  };
  // 都道府県とエリア
  const areas = generateAreasFromStores(initialStores);
  // 都道府県のリストを取得
  const prefectures = extractPrefecturesFromAreas(areas);

  //祝日取得オブジェクト作成
  const hd = new Holidays("JP");
  //祝日データ取得
  const holidays = hd.getHolidays(new Date().getFullYear());
  // 祝日リスト（祝日取得のライブラリ ）
  const japaneseHolidays = holidays.reduce((acc, holiday) => {
    const date = new Date(holiday.date);
    const dateKey = dayjs(date).startOf("day").format("YYYY-MM-DD"); // 時間部分を取り除く
    if (holiday.type === "public") {
      acc[dateKey] = holiday.name;
    }
    return acc;
  }, {});
  // 祝日かどうかを判定する関数
  const isHoliday = (day: Dayjs): boolean => {
    const formattedDate = day.format("YYYY-MM-DD");
    return Object.hasOwnProperty.call(japaneseHolidays, formattedDate);
  };

  //チェックボックス変換ハンドラ
  const handleDailyCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDailyCheck(e.target.checked ? "日別" : "店舗別");
  };

  //駅前、郊外変更ハンドラ
  const handleLocationChange = (event) => {
    setLocationValue(event.target.value);
  };
  //直営、FC変更ハンドラ
  const handleTypeChange = (event) => {
    setTypeValue(event.target.value);
  };
  const handleSalesInclusionChange = (event) => {
    setSalesInclusionValue(event.target.value);
  };

  //昇降順セット、ソート列のキー名をセット
  const handleSort = (key: string) => {
    setSortDirection((prevDirection) =>
      prevDirection === "asc" ? "desc" : "asc"
    );
    setSortKey(key);
  };

  //ソート処理
  // ソート処理
  const sortedStoresData = [...storesData.storeData].sort((a, b) => {
    const aValue = Number(a[sortKey]); // 文字列を数値に変換
    const bValue = Number(b[sortKey]); // 文字列を数値に変換
  
    if (!isNaN(aValue) && !isNaN(bValue)) { // NaNでないことを確認
      console.log("no str")
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    } else {
      // 数値以外のデータ型に対応する場合の処理
      console.log("no int")
      const aStr = String(a[sortKey]);
      const bStr = String(b[sortKey]);
      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    }
  });
  ///***<送信時データ変換処理>***///
  const createRequestData = (endpoint) => {
    let startDate3 = "";
    let endDate4 = "";
    if (compareCheck) {
      // 比較対象がある場合
      startDate3 = date3.format("YYYY-MM-DD");
      endDate4 = date4.format("YYYY-MM-DD");
    }
    return {
      displayType: dailyCheck, //  '日別' または '店舗別'

      range: {
        start: date1.format("YYYY-MM-DD"),
        end: date2.format("YYYY-MM-DD"),
      },
      comparisonRange: {
        start: startDate3,
        end: endDate4,
      },
      storeSelection: {
        selectedStore: selectedStores.map((store) => store.id).join(", "), // 店舗IDをカンマ区切りで連結
        prefecture: selectedStores.map((store) => store.prefecture).join(", "), // 選択された店舗の都道府県をカンマ区切りで連結
      },
      otherConditions: {
        storeLocation: locationValue, // 例: '全て', '駅前', '郊外'
        businessType: typeValue, // 例: '全て', '直営', 'FC'
      },
      includeSales: salesInclusionValue, // 'true' または 'false'
    };
  };
  // 初期化処理
  const initialStoresData: StoresData = {
    totalData: {
      storeName: "合計",
      storeNumber: "",
      netSalesA: 0,
      netSalesB: 0,
      netSalesChange: 0,
      netSalesRatio: 0,
      usersA: 0,
      usersB: 0,
      usersChange: 0,
      usersRatio: 0,
      avgPriceA: 0,
      avgPriceB: 0,
      avgPriceChange: 0,
      avgPriceRatio: 0,
      newUsersA: 0,
      newUsersB: 0,
      newUsersChange: 0,
      newUsersRatio: 0,
      newUsersRateA: 0,
      newUsersRateB: 0,
      otherSalesA: 0,
      otherSalesB: 0,
      otherSalesChange: 0,
      otherSalesRatio: 0,
    },
    storeData: [],
  };
  //バックエンドAPIにデータ送信、受信
  // add 20240828
  const fetchAndTransformData = async (endpoint) => {
    console.log("endpoint: ",endpoint);
    try {
      let params;
      setStoresData(initialStoresData);//初期化処理

      //日別or店舗別でカラム名変更
      setHeaderTitles({
        firstColumn: dailyCheck === "店舗別" ? "店舗名" : "日付",
        secondColumn: dailyCheck === "店舗別" ? "店番" : "店舗名",
      });

      console.log("API_ENDPOINT: ", API_ENDPOINTS);
      console.log("setHeaderTitles: ", setHeaderTitles);
      console.log("endpoint: ", endpoint);

      if (endpoint === API_ENDPOINTS.display_by_store) {
        //店舗別
        params = createRequestData(endpoint);
        const data = await fetchData(endpoint, params, router);
        setStoresData(storeProcessData(data));
      } else if (endpoint === API_ENDPOINTS.display_by_date) {
        //日別
        params = createRequestData(endpoint);
        const data = await fetchData(endpoint, params, router);
        setStoresData(dateProcessData(data));
      } else if (endpoint === API_ENDPOINTS.download) {
        //ダウンロード
        //const data = await fetchData(endpoint, params);
        //setStoresData(processData(data));
      }
    } catch (error) {
      console.error("データ取得および変換エラー:", error);
    }
  };

  return (
    <>
      <Layout title="店舗売上集計<速報> | 売上速報">
        <div className="bg-gray-50 min-h-screen flex flex-col pb-20">
          <h1 className="text-lg font-bold tracking-tighter bg-white py-1 pl-4">
            店舗売上集計{"<速報>"}
          </h1>
          <div className="flex flex-col gap-2 flex-1 p-2">
            <div className="flex flex-col md:flex-row gap-2 lg:gap-4 items-stretch">
              <div className="w-full md:w-5/12 lg:w-4/12">
                <div className="bg-white border rounded-lg p-2 px-4 py-2 h-full">
                  <h2 className="text-base font-bold mb-2 md:mb-1">対象期間</h2>
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale={dayjsAdapter.locale}
                  >
                    <div className="grid grid-cols-1 gap-2 md:gap-2">
                      <div className="flex w-full gap-2 lg:gap-4 items-center">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "45%",
                          }}
                        >
                          <DatePicker
                            label="抽出対象"
                            value={date1}
                            onChange={setDate1}
                            maxDate={dayjs()}
                            slotProps={{
                              textField: { size: "small" },
                              day: ({ day }) => ({
                                sx: {
                                  ...(isHoliday(day) && {
                                    color: theme.palette.secondary.main,
                                  }),
                                },
                              }),
                            }}
                          />
                        </Box>
                        <p>～</p>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "45%",
                          }}
                        >
                          <DatePicker
                            label=""
                            value={date2}
                            onChange={setDate2}
                            maxDate={dayjs()}
                            slotProps={{
                              textField: { size: "small" },
                              day: ({ day }) => ({
                                sx: {
                                  ...(isHoliday(day) && {
                                    color: theme.palette.secondary.main,
                                  }),
                                },
                              }),
                            }}
                          />
                        </Box>
                      </div>
                      {compareCheck && (
                        <>
                          <div className="flex w-full gap-2 lg:gap-4 items-center">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                width: "45%",
                              }}
                            >
                              <DatePicker
                                label="比較対象"
                                value={date3}
                                onChange={setDate3}
                                maxDate={dayjs()}
                                slotProps={{
                                  textField: { size: "small" },
                                  day: ({ day }) => ({
                                    sx: {
                                      ...(isHoliday(day) && {
                                        color: theme.palette.secondary.main,
                                      }),
                                    },
                                  }),
                                }}
                              />
                            </Box>
                            <p>～</p>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                width: "45%",
                              }}
                            >
                              <DatePicker
                                label=""
                                value={date4}
                                onChange={setDate4}
                                maxDate={dayjs()}
                                slotProps={{
                                  textField: { size: "small" },
                                  day: ({ day }) => ({
                                    sx: {
                                      ...(isHoliday(day) && {
                                        color: theme.palette.secondary.main,
                                      }),
                                    },
                                  }),
                                }}
                              />
                            </Box>
                          </div>
                        </>
                      )}
                      <div className="flex w-full gap-4 items-center justify-between">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={compareCheck}
                              onChange={(e) =>
                                setCompareCheck(e.target.checked)
                              }
                              sx={{
                                "& .MuiSvgIcon-root": { fontSize: 18 },
                                p: "6px",
                              }}
                            />
                          }
                          label="比較対象"
                          sx={{
                            "& .MuiFormControlLabel-label": { fontSize: 14 },
                          }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={dailyCheck === "日別"}
                              onChange={handleDailyCheckChange}
                              sx={{
                                "& .MuiSvgIcon-root": { fontSize: 18 },
                                p: "6px",
                              }}
                            />
                          }
                          label="日別"
                          sx={{
                            "& .MuiFormControlLabel-label": { fontSize: 14 },
                          }}
                        />
                      </div>
                    </div>
                  </LocalizationProvider>
                </div>
              </div>
              <div className="w-full md:w-4/12 lg:w-3/12">
                <div className="bg-white border rounded-lg p-2 px-4 py-2 h-full">
                  <h2 className="text-base font-bold mb-2 md:mb-1">対象店舗</h2>
                  <div className="mb-2">
                    {/*　選択済み店舗名をカンマ区切りで表示＆クリアボタン
                    <p className="text-sm text-gray-700">
                      {selectedStores.map((store) => store.name).join(", ")}
                    </p>
                    <Button
                      className="bg-blue-500 hover:bg-blue-800 text-white p-1 md:p-1"
                      onClick={clearStores}
                    >
                      クリア
                    </Button>
                    */}
                  </div>
                  <div className="">
                    <Button
                      onClick={handleOpenStoreModal}
                      className="bg-blue-500 hover:bg-blue-800 text-white w-full p-1 md:p-1"
                      variant="contained"
                      size="large"
                    >
                      店舗選択
                    </Button>
                    <Modal
                      open={openStoreModal}
                      onClose={handleCloseStoreModal}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: { xs: "95%", sm: 400 },
                          bgcolor: "background.paper",
                          boxShadow: 24,
                          p: { xs: 2, sm: 4 },
                          borderRadius: 2,
                          maxWidth: "95%",
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontSize: "1rem",
                          }}
                        >
                          店舗を選択してください
                        </Typography>
                        <TextField
                          margin="normal"
                          fullWidth
                          label="店舗を検索"
                          type="search"
                          value={searchText}
                          onChange={
                            //入力値セット
                            handleSearchChange
                          }
                        />
                        <FormControl fullWidth>
                          <Select
                            multiple
                            value={selectedStores.map((store) => store.id)}
                            onChange={handleChange}
                            onOpen={
                              //フィルタリング
                              handleSelectOpen
                            }
                            renderValue={(selected) =>
                              //選択ボックスに選択店舗名を表示
                              selectedStores
                                .filter((store) => selected.includes(store.id))
                                .map((store) => store.name)
                                .join(", ")
                            }
                          >
                            {filteredStores.map((store) => (
                              <MenuItem key={store.id} value={store.id}>
                                <Checkbox
                                  checked={selectedStores.some(
                                    (selectedStore) =>
                                      selectedStore.id === store.id
                                  )}
                                />
                                <ListItemText primary={store.name} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Modal>
                  </div>
                  <div className="">
                    <Button
                      onClick={handleOpenPrefectureModal}
                      className="bg-blue-500 hover:bg-blue-800 text-white w-full p-1 md:p-1 mt-2 md:mt-2"
                      variant="contained"
                      color="primary"
                      size="large"
                    >
                      都道府県検索
                    </Button>
                    <Modal
                      open={openPrefectureModal}
                      onClose={handleClosePrefectureModal}
                    >
                      <div>
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: { xs: "95%", sm: 400 },
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: { xs: 2, sm: 4 },
                            borderRadius: 2,
                            maxWidth: "95%",
                          }}
                        >
                          <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                              fontSize: "1rem",
                            }}
                          >
                            都道府県を選択してください。
                          </Typography>
                          <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>都道府県選択</InputLabel>
                            <Select
                              label="都道府県選択"
                              value={selectedPrefecture}
                              onChange={
                                //都道府県セット
                                setPrefectureChange
                              }
                            >
                              {prefectures.map((prefecture) => (
                                <MenuItem key={prefecture} value={prefecture}>
                                  {prefecture}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl sx={{ mt: 2, width: "100%" }}>
                            <InputLabel id="multiple-store-select-label">
                              店舗選択
                            </InputLabel>
                            <Select
                              labelId="multiple-store-select-label"
                              multiple
                              value={selectedStores.map((store) => store.id)}
                              input={<OutlinedInput label="店舗選択" />}
                              onChange={handleChange}
                              renderValue={(selected) =>
                                //選択ボックスに選択店舗名を表示
                                selectedStores
                                  .filter((store) =>
                                    selected.includes(store.id)
                                  )
                                  .map((store) => store.name)
                                  .join(", ")
                              }
                              onOpen={
                                //フィルタリング
                                handlePrefectureChange
                              }
                            >
                              {filteredStores.map((store) => (
                                <MenuItem key={store.id} value={store.id}>
                                  <Checkbox
                                    checked={selectedStores.some(
                                      (selectedStore) =>
                                        selectedStore.id === store.id
                                    )}
                                  />
                                  <ListItemText primary={store.name} />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </div>
                    </Modal>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-3/12 lg-1/12">
                <div className="bg-white border rounded-lg p-2 px-4 py-2 h-full min-w-32">
                  <h2 className="text-base font-bold mb-2 md:mb-1">
                    その他条件
                  </h2>
                  <div className="flex gap-4">
                    <RadioGroup
                      aria-labelledby="demo-radio-buttons-group-label"
                      defaultValue={locationValue}
                      name="radio-location-group"
                      className="flex flex-row md:flex-col mb-2 md:gap-0"
                      onChange={handleLocationChange}
                    >
                      <FormControlLabel
                        value="全て"
                        control={
                          <Radio
                            sx={{
                              "& .MuiSvgIcon-root": {
                                fontSize: 16,
                              },
                              ".MuiFormControlLabel-label": { fontSize: 14 },
                              p: "4px",
                            }}
                          />
                        }
                        label="全て"
                        sx={{
                          "& .MuiFormControlLabel-label": { fontSize: 14 },
                        }}
                      />
                      <FormControlLabel
                        value="駅前"
                        control={
                          <Radio
                            sx={{
                              "& .MuiSvgIcon-root": {
                                fontSize: 16,
                              },
                              ".MuiFormControlLabel-label": { fontSize: 14 },
                              p: "4px",
                            }}
                          />
                        }
                        label="駅前"
                        sx={{
                          "& .MuiFormControlLabel-label": { fontSize: 14 },
                        }}
                      />
                      <FormControlLabel
                        value="郊外"
                        control={
                          <Radio
                            sx={{
                              "& .MuiSvgIcon-root": {
                                fontSize: 16,
                              },
                              ".MuiFormControlLabel-label": { fontSize: 14 },
                              p: "4px",
                            }}
                          />
                        }
                        label="郊外"
                        sx={{
                          "& .MuiFormControlLabel-label": { fontSize: 14 },
                        }}
                      />
                    </RadioGroup>
                    <RadioGroup
                      aria-labelledby="demo-radio-buttons-group-label"
                      defaultValue={typeValue}
                      name="radio-type-group"
                      className="flex flex-row md:flex-col md:gap-0"
                      onChange={handleTypeChange}
                    >
                      <FormControlLabel
                        value="全て"
                        control={
                          <Radio
                            sx={{
                              "& .MuiSvgIcon-root": { fontSize: 16 },
                              p: "4px",
                            }}
                          />
                        }
                        label="全て"
                        sx={{
                          "& .MuiFormControlLabel-label": { fontSize: 14 },
                        }}
                      />
                      <FormControlLabel
                        value="直営"
                        control={
                          <Radio
                            sx={{
                              "& .MuiSvgIcon-root": { fontSize: 16 },
                              p: "4px",
                            }}
                          />
                        }
                        label="直営"
                        sx={{
                          "& .MuiFormControlLabel-label": { fontSize: 14 },
                        }}
                      />
                      <FormControlLabel
                        value="FC"
                        control={
                          <Radio
                            sx={{
                              "& .MuiSvgIcon-root": { fontSize: 16 },
                              p: "4px",
                            }}
                          />
                        }
                        label="FC"
                        sx={{
                          "& .MuiFormControlLabel-label": { fontSize: 14 },
                        }}
                      />
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-wrap gap-2 justify-between">
              <div className="bg-white border rounded-lg p-2 px-4 md:px-4 mr-0 md:mr-4 w-full md:w-auto">
                <FormControl>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-salesInclusion-group"
                    defaultValue={salesInclusionValue}
                    onChange={handleSalesInclusionChange}
                  >
                    <FormControlLabel
                      value="true"
                      control={
                        <Radio
                          sx={{
                            "& .MuiSvgIcon-root": {
                              fontSize: 16,
                            },
                            p: "4px",
                          }}
                        />
                      }
                      label="その他売上込み"
                      sx={{
                        "& .MuiFormControlLabel-label": { fontSize: 14 },
                      }}
                    />
                    <FormControlLabel
                      value="false"
                      control={
                        <Radio
                          sx={{
                            "& .MuiSvgIcon-root": {
                              fontSize: 16,
                            },
                            p: "4px",
                          }}
                        />
                      }
                      label="その他売上抜き"
                      sx={{
                        "& .MuiFormControlLabel-label": { fontSize: 14 },
                      }}
                    />
                  </RadioGroup>
                </FormControl>
              </div>
              <div className="flex gap-4 self-end w-full md:w-auto justify-end">
                <Button
                  variant="contained"
                  className="bg-blue-500 hover:bg-blue-800 text-white px-2 md:px-4 py-2"
                  startIcon={<ArrowBackIcon className="md:inline hidden" />}
                  onClick={() => {}}
                >
                  店舗別に戻る
                </Button>

                <Button
                  variant="contained"
                  className="bg-blue-500 hover:bg-blue-800 text-white px-2 md:px-4 py-2"
                  startIcon={<DownloadIcon className="md:inline hidden" />}
                  onClick={() => fetchAndTransformData(API_ENDPOINTS.download)}
                >
                  ダウンロード
                </Button>

                <Button
                  variant="contained"
                  className="bg-blue-500 hover:bg-blue-800 text-white px-2 md:px-4 py-2"
                  startIcon={<SearchIcon className="md:inline hidden" />}
                  onClick={() =>
                    fetchAndTransformData(
                      dailyCheck === "日別"
                        ? API_ENDPOINTS.display_by_date
                        : API_ENDPOINTS.display_by_store
                    )
                  }
                >
                  検索表示
                </Button>
              </div>
            </div>
            <div className="w-full">
              <div className="overflow-x-auto rounded-lg border-gray-300 shadow-sm overflow-y-auto h-[400px]">
                <table className="min-w-full divide-y divide-x divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th
                        colSpan={2}
                        className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border"
                      >
                        店舗情報
                      </th>
                      <th
                        colSpan={4}
                        className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border"
                      >
                        税抜売上
                      </th>
                      <th
                        colSpan={4}
                        className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border"
                      >
                        利用者
                      </th>
                      <th
                        colSpan={4}
                        className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border"
                      >
                        客単価
                      </th>
                      <th
                        colSpan={4}
                        className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border"
                      >
                        新規
                      </th>
                      <th
                        colSpan={2}
                        className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border"
                      >
                        新規率
                      </th>
                      <th
                        colSpan={4}
                        className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border"
                      >
                        その他売上
                      </th>
                    </tr>
                    <tr>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {headerTitles.firstColumn}
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {headerTitles.secondColumn}
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        <div className="flex items-center justify-between">
                          期間A
                          <div>
                            <IconButton
                              size="small"
                              onClick={() => handleSort("netSalesA")}
                            >
                              {sortKey === "netSalesA" &&
                              sortDirection === "asc" ? (
                                <ArrowUpwardIcon fontSize="inherit" />
                              ) : (
                                <ArrowDownwardIcon fontSize="inherit" />
                              )}
                            </IconButton>
                          </div>
                        </div>
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        期間B
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        差異
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        A/B
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        <div className="flex items-center justify-between">
                          期間A
                          <div>
                            <IconButton
                              size="small"
                              onClick={() => handleSort("usersA")}
                            >
                              {sortKey === "usersA" &&
                              sortDirection === "asc" ? (
                                <ArrowUpwardIcon fontSize="inherit" />
                              ) : (
                                <ArrowDownwardIcon fontSize="inherit" />
                              )}
                            </IconButton>
                          </div>
                        </div>
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        期間B
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        差異
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        A/B
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        <div className="flex items-center justify-between">
                          期間A
                          <div>
                            <IconButton
                              size="small"
                              onClick={() => handleSort("unitPriceA")}
                            >
                              {sortKey === "unitPriceA" &&
                              sortDirection === "asc" ? (
                                <ArrowUpwardIcon fontSize="inherit" />
                              ) : (
                                <ArrowDownwardIcon fontSize="inherit" />
                              )}
                            </IconButton>
                          </div>
                        </div>
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        期間B
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        差異
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        A/B
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        <div className="flex items-center justify-between">
                          期間A
                          <div>
                            <IconButton
                              size="small"
                              onClick={() => handleSort("newUsersA")}
                            >
                              {sortKey === "newUsersA" &&
                              sortDirection === "asc" ? (
                                <ArrowUpwardIcon fontSize="inherit" />
                              ) : (
                                <ArrowDownwardIcon fontSize="inherit" />
                              )}
                            </IconButton>
                          </div>
                        </div>
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        期間B
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        差異
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        A/B
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        期間A
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        期間B
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        期間A
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        期間B
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        差異
                      </th>
                      <th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        A/B
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-x divide-gray-200">
                    <tr>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {storesData.totalData.storeName.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {storesData.totalData.storeNumber.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                        {storesData.totalData.netSalesA.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                        {storesData.totalData.netSalesB.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                        {storesData.totalData.netSalesChange.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                        {storesData.totalData.netSalesRatio.toLocaleString()}%
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {storesData.totalData.usersA.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {storesData.totalData.usersB.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {storesData.totalData.usersChange.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {storesData.totalData.usersRatio.toLocaleString()}%
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                        {storesData.totalData.avgPriceA.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                        {storesData.totalData.avgPriceB.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                        {storesData.totalData.avgPriceChange.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                        {storesData.totalData.avgPriceRatio.toLocaleString()}%
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {storesData.totalData.newUsersA.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {storesData.totalData.newUsersB.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {storesData.totalData.newUsersChange.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {storesData.totalData.newUsersRatio.toLocaleString()}%
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                        {storesData.totalData.newUsersRateA.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                        {storesData.totalData.newUsersRateB.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {storesData.totalData.otherSalesA.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {storesData.totalData.otherSalesB.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {storesData.totalData.otherSalesChange.toLocaleString()}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                        {storesData.totalData.otherSalesRatio.toLocaleString()}%
                      </td>
                    </tr>
                    {sortedStoresData.map((store) => (
                      <tr key={store.storeNumber}>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                          {store.storeName}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                          {store.storeNumber}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                          {store.netSalesA.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                          {store.netSalesB.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                          {store.netSalesChange.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                          {store.netSalesRatio.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                          {store.usersA.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                          {store.usersB.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                          {store.usersChange.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                          {store.usersRatio.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                          {store.avgPriceA.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                          {store.avgPriceB.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                          {store.avgPriceChange.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                          {store.avgPriceRatio.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                          {store.newUsersA.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                          {store.newUsersB.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                          {store.newUsersChange.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                          {store.newUsersRatio.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                          {store.newUsersRateA.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border bg-gray-50">
                          {store.newUsersRateB.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                          {store.otherSalesA.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                          {store.otherSalesB.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                          {store.otherSalesChange.toLocaleString()}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border">
                          {store.otherSalesRatio.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default IndexPage;
