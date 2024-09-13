import Image from 'next/image';
import Layout from '@/components/Layout';
import * as React from 'react';
import { Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import LoginSideImage from '../../public/images/login-side-image.webp';

const AdminLoginPage = () => {
	const [showPassword, setShowPassword] = React.useState(false);

	const handleClickShowPassword = () => setShowPassword((show) => !show);

	const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	return (
		<Layout title="管理者専用ログイン | 売上速報">
			<div className="flex flex-row-reverse min-h-screen items-stretch">
				<div className="hidden md:block md:w-2/5 md:h-auto bg-gray-800 justify-center">
					<Image src={LoginSideImage} alt="" className="w-full h-full object-cover" />
				</div>
				<div className="w-full md:w-3/5 flex flex-col items-center justify-center p-10">
					<div className="text-left">
						<h1 className="text-xl md:text-2xl mb-4 md:mb-6 font-bold">
							管理者専用ログインページ
						</h1>
						<form action="">
							<div className="flex flex-col gap-2 md:gap-4 items-center">
								<TextField
									id="outlined-search"
									label="スタッフ番号"
									type="search"
									sx={{ width: '288px' }}
								/>

								{/* <FormControl variant="outlined"> */}
								<FormControl sx={{ width: '288px' }} variant="outlined">
									<InputLabel htmlFor="outlined-adornment-password">
										パスワード
									</InputLabel>
									<OutlinedInput
										id="outlined-adornment-password"
										type={showPassword ? 'text' : 'password'}
										endAdornment={
											<InputAdornment position="end">
												<IconButton
													aria-label="パスワード表示非表示ボタン"
													onClick={handleClickShowPassword}
													onMouseDown={handleMouseDownPassword}
													edge="end">
													{showPassword ? <VisibilityOff /> : <Visibility />}
												</IconButton>
											</InputAdornment>
										}
										label="Password"
									/>
								</FormControl>
								<Button
									className="bg-accent hover:bg-accent-dark text-white transition-colors duration-200 w-full p-2 md:p-4"
									variant="contained">
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

export default AdminLoginPage;
