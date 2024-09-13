import Image from "next/image";
import Layout from "@/components/Layout";
import * as React from "react";
import { Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useRouter } from "next/router";
import axios from 'axios';  // これを追加

import LoginSideImage from "../public/images/login-side-image.webp";

const LoginPage = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const router = useRouter();
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    // event.preventDefault();
  };

  const handleUsernameChange = (event) => setUsername(event.target.value);
  const handlePasswordChange = (event) => setPassword(event.target.value);
  // ローカル実行用
  // ログインボタン押下時の処理
  // const handleLogin = async () => {
  //   try {
  //     const response = await axios.post('http://127.0.0.1:5000/login', { username, password }, { withCredentials: true });
  //     if (response.status === 200) {
  //       router.push('/');
  //     }
  //   } catch (error) {
  //     console.error('ログインに失敗しました:', error);
  //     setErrorMessage("ログインに失敗しました。ユーザー名とパスワードを確認してください。");
  //   }
  // };
  const handleLogin = async () => {
    console.log("Backend URL in login.ts:", "/api/login");

    try {
      // const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, { username, password }, { withCredentials: true });
      const response = await axios.post("http://localhost:5000/api/login", { username, password }, { withCredentials: true });
      console.log("response: ", response);
      if (response.status === 200) {
        router.push('http://localhost:5000/api/');
      }
    } catch (error) {
      console.error('ログインに失敗しました:', error);
      setErrorMessage("ログインに失敗しました。ユーザー名とパスワードを確認してください。");
    }
  };
  return (
    <Layout title="ログイン | 売上速報">
      <div className="flex flex-row-reverse min-h-screen items-stretch">
        <div className="hidden md:block md:w-2/5 md:h-auto bg-gray-800 justify-center">
          <Image
            src={LoginSideImage}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-3/5 flex flex-col items-center justify-center p-10">
          <div className="text-left">
            <h1 className="text-xl md:text-2xl mb-4 md:mb-6 font-bold">
              売上速報アプリ
            </h1>
            {errorMessage && (
              <p className="text-red-600 mb-4">{errorMessage}</p> // エラーメッセージを表示
            )}
            <form action="">
              <div className="flex flex-col gap-2 md:gap-4 items-center">
                <TextField
                  id="outlined-search"
                  label="スタッフ番号"
                  type="search"
                  sx={{ width: "288px" }}
                  value={username}
                  onChange={handleUsernameChange}
                />

                <FormControl sx={{ width: "288px" }} variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-password">
                    パスワード
                  </InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="パスワード表示非表示ボタン"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Password"
                  />
                </FormControl>
                <Button
                  className="bg-accent hover:bg-accent-dark text-white transition-colors duration-200 w-full p-2 md:p-4"
                  variant="contained"
                  onClick={handleLogin}
                >
                  ログイン
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
