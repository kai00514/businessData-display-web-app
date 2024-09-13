import Layout from '@/components/Layout';
import React, { useState } from 'react';
import { IconButton, Drawer, Button, TextField } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useMobile } from '../../contexts/MobileContext';

const AdminPage = () => {
	const isMobile = useMobile();

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<>
			<Layout title="権限編集 | 売上速報">
				<div className="bg-gray-50 min-h-screen flex">
					{/* スマホ表示時のDrawer */}
					{isMobile ? (
						<Drawer anchor="left" open={isSidebarOpen} onClose={toggleSidebar}>
							<div className="w-60">
								<h1 className="text-xl font-semibold p-4 bg-gray-500 text-white">
									管理システム
								</h1>
								<ul>
									<li className="border-t border-b border-gray-400">
										<a href="#" className="flex items-center hover:bg-gray-100 p-4">
											<DashboardIcon
												className="text-gray-700"
												style={{ fontSize: '24px' }}
											/>
											<span className="ml-4">ダッシュボード</span>
										</a>
									</li>
									<li className="border-b border-gray-400">
										<a href="#" className="flex items-center hover:bg-gray-100 p-4">
											<ReceiptIcon
												className="text-gray-700"
												style={{ fontSize: '24px' }}
											/>
											<span className="ml-4">ログ</span>
										</a>
									</li>
								</ul>
							</div>
						</Drawer>
					) : (
						// PC表示時のサイドバー
						<div className="w-60 border-r-[1px] border-gray-400">
							<h1 className="text-xl font-semibold p-4 bg-gray-500 text-white">
								管理システム
							</h1>
							<ul>
								<li className="border-t border-b border-gray-400">
									<a href="#" className="flex items-center hover:bg-gray-100 p-4">
										<DashboardIcon
											className="text-gray-700"
											style={{ fontSize: '24px' }}
										/>
										<span className="ml-4 text-sm">ダッシュボード</span>
									</a>
								</li>
								<li className="border-b border-gray-400">
									<a href="#" className="flex items-center hover:bg-gray-100 p-4">
										<ReceiptIcon className="text-gray-700" style={{ fontSize: '24px' }} />
										<span className="ml-4 text-sm">ログ</span>
									</a>
								</li>
							</ul>
						</div>
					)}

					{/* メインコンテンツ */}
					<div className="md:flex-1 w-full pb-20">
						{/* ハンバーガーメニューアイコン */}
						{isMobile && (
							<div className="bg-gray-500">
								<button className="px-4 md:hidden" onClick={toggleSidebar}>
									<div className="flex items-center">
										<IconButton
											edge="start"
											color="primary"
											aria-label="menu"
											onClick={toggleSidebar}>
											<MenuIcon />
										</IconButton>
									</div>
								</button>
							</div>
						)}
						{/* コンテンツ */}
						<div className="p-2 md:p-4 w-full">
							<h2 className="text-xl font-bold mb-4">編集</h2>
							<div className="flex flex-col md-2 md:mb-4 gap-4">
								<div className="border p-4 rounded-lg w-full">
									<div className="flex flex-col gap-4 mb-4">
										{/* 店舗番号 */}
										<div className="flex flex-wrap items-center gap-4">
											<label
												htmlFor="storeNumber"
												className="block text-gray-700 text-sm font-bold w-[70px]">
												店舗番号
											</label>
											<TextField id="storeNumber" variant="outlined" className="w-50" />
										</div>

										{/* 分類1 */}
										<div className="flex flex-wrap items-center gap-4">
											<label
												htmlFor="category1"
												className="block text-gray-700 text-sm font-bold w-[70px]">
												分類1
											</label>
											<TextField id="category1" variant="outlined" className="w-50" />
										</div>

										{/* 分類2 */}
										<div className="flex flex-wrap items-center gap-4">
											<label
												htmlFor="category2"
												className="block text-gray-700 text-sm font-bold w-[70px]">
												分類2
											</label>
											<TextField id="category2" variant="outlined" className="w-50" />
										</div>

										{/* オーナー名 */}
										<div className="flex flex-wrap items-center gap-4">
											<label
												htmlFor="ownerName"
												className="block text-gray-700 text-sm font-bold w-[70px]">
												オーナー名
											</label>
											<TextField id="ownerName" variant="outlined" className="w-50" />
										</div>
									</div>

									{/* キャンセルと変更ボタン */}
								</div>
								<div className="flex justify-end gap-4">
									<Button
										variant="outlined"
										className="px-2 md:px-4 py-2 border-blue-500 text-blue-500 hover:text-blue-800 hover:border-blue-800">
										キャンセル
									</Button>
									<Button
										variant="contained"
										className="bg-blue-500 hover:bg-blue-800 text-white px-2 md:px-4 py-2">
										変更
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Layout>
		</>
	);
};

export default AdminPage;
