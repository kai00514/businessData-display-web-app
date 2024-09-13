import Layout from '@/components/Layout';
import React, { useState } from 'react';
import { IconButton, Drawer, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import { useMobile } from '../../contexts/MobileContext';

interface StoreInfo {
	id: string;
	storeNumber: string;
	storeName: string;
	category: string;
	area: string;
	owner: string;
}

const AdminPage = () => {
	const isMobile = useMobile();

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	const stores_info_sequential: StoreInfo[] = [
		{
			id: '1',
			storeNumber: '001',
			storeName: '店舗1',
			category: 'カテゴリ1',
			area: 'エリア1',
			owner: 'オーナー1',
		},
		{
			id: '2',
			storeNumber: '002',
			storeName: '店舗2',
			category: 'カテゴリ2',
			area: 'エリア2',
			owner: 'オーナー2',
		},
		{
			id: '3',
			storeNumber: '003',
			storeName: '店舗3',
			category: 'カテゴリ3',
			area: 'エリア3',
			owner: 'オーナー3',
		},
		{
			id: '4',
			storeNumber: '004',
			storeName: '店舗4',
			category: 'カテゴリ4',
			area: 'エリア4',
			owner: 'オーナー4',
		},
		{
			id: '5',
			storeNumber: '005',
			storeName: '店舗5',
			category: 'カテゴリ5',
			area: 'エリア5',
			owner: 'オーナー5',
		},
		{
			id: '6',
			storeNumber: '006',
			storeName: '店舗6',
			category: 'カテゴリ6',
			area: 'エリア6',
			owner: 'オーナー6',
		},
		{
			id: '7',
			storeNumber: '007',
			storeName: '店舗7',
			category: 'カテゴリ7',
			area: 'エリア7',
			owner: 'オーナー7',
		},
		{
			id: '8',
			storeNumber: '008',
			storeName: '店舗8',
			category: 'カテゴリ8',
			area: 'エリア8',
			owner: 'オーナー8',
		},
		{
			id: '9',
			storeNumber: '009',
			storeName: '店舗9',
			category: 'カテゴリ9',
			area: 'エリア9',
			owner: 'オーナー9',
		},
		{
			id: '10',
			storeNumber: '010',
			storeName: '店舗10',
			category: 'カテゴリ10',
			area: 'エリア10',
			owner: 'オーナー10',
		},
		{
			id: '11',
			storeNumber: '011',
			storeName: '店舗11',
			category: 'カテゴリ11',
			area: 'エリア11',
			owner: 'オーナー11',
		},
		{
			id: '12',
			storeNumber: '012',
			storeName: '店舗12',
			category: 'カテゴリ12',
			area: 'エリア12',
			owner: 'オーナー12',
		},
		{
			id: '13',
			storeNumber: '013',
			storeName: '店舗13',
			category: 'カテゴリ13',
			area: 'エリア13',
			owner: 'オーナー13',
		},
		{
			id: '14',
			storeNumber: '014',
			storeName: '店舗14',
			category: 'カテゴリ14',
			area: 'エリア14',
			owner: 'オーナー14',
		},
		{
			id: '15',
			storeNumber: '015',
			storeName: '店舗15',
			category: 'カテゴリ15',
			area: 'エリア15',
			owner: 'オーナー15',
		},
	];

	return (
		<>
			<Layout title="管理者システム | 売上速報">
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
								<div className="px-4 md:hidden" onClick={toggleSidebar}>
									<div className="flex items-center">
										<IconButton
											edge="start"
											color="primary"
											aria-label="menu"
											onClick={toggleSidebar}>
											<MenuIcon />
										</IconButton>
									</div>
								</div>
							</div>
						)}
						{/* コンテンツ */}
						<div className="p-2 md:p-4 w-full">
							<h2 className="text-xl font-bold mb-4">管理者システム - 権限一覧</h2>
							<div className="flex flex-wrap md:flex-row md-2 md:mb-4 gap-2">
								<div className="flex gap-4 items-center md:mr-4">
									<Button
										variant="contained"
										className="bg-blue-500 hover:bg-blue-800 text-white px-2 md:px-4 py-2"
										onClick={() => {}}>
										店舗番号
									</Button>
									<Button
										variant="contained"
										className="bg-blue-500 hover:bg-blue-800 text-white px-2 md:px-4 py-2"
										startIcon={<SearchIcon className="md:inline hidden" />}
										onClick={() => {}}>
										検索表示
									</Button>
								</div>
								<div className="w-full md:w-auto bg-white px-4 py-2 rounded-lg mt-4">
									<h2 className="text-lg font-bold mb-2">インポート</h2>

									{/* ファイルアップロード */}
									<div className="flex items-start flex-col md:flex-row flex-wrap gap-2">
										<div className="flex flex-col justify-center w-full md:w-96 md:mr-8">
											<label
												htmlFor="file_input"
												className="mb-2 px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 flex-1">
												<input
													className=""
													aria-describedby="file_input_help"
													id="file_input"
													type="file"
												/>
											</label>
											{/* 最大容量などの表記が必要な場合下記を残す */}
											<p className="text-sm text-gray-500" id="file_input_help">
												SVG, PNG, JPG, or GIF (MAX. 800x400px).
											</p>
										</div>

										<div className="flex gap-4">
											<Button
												variant="contained"
												className="bg-blue-500 hover:bg-blue-800 text-white px-2 md:px-4 py-2"
												onClick={() => {}}>
												選択
											</Button>
											<Button
												variant="outlined"
												className="px-2 md:px-4 py-2 font-bold text-blue-500 border-2 border-blue-500 hover:border-2 hover:bg-blue-500 hover:border-blue-500 hover:text-white"
												onClick={() => {}}>
												インポート
											</Button>
										</div>
									</div>
								</div>
							</div>
							<div className="flex justify-between flex-col md:flex-row md-2 gap-2">
								<div className="flex items-center gap-8 ml-auto">
									<div className="flex items-center text-sm">
										<IconButton color="primary" component="span">
											<ChevronLeftIcon />
										</IconButton>
										<p>前ページ</p>
									</div>
									<div className="flex items-center text-sm">
										<p>次ページ</p>
										<IconButton color="primary" component="span">
											<ChevronRightIcon />
										</IconButton>
									</div>
								</div>
							</div>
							<div className="overflow-x-auto bg-white shadow-md rounded-lg">
								<table className="min-w-full divide-y divide-x divide-gray-200 border border-gray-300 rounded shadow-sm">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200">
												ID
											</th>
											<th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200">
												店舗番号
											</th>
											<th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200">
												店舗名
											</th>
											<th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200">
												区分
											</th>
											<th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200">
												エリア
											</th>
											<th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200">
												オーナー
											</th>
											<th className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200">
												管理
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-x divide-gray-200">
										{stores_info_sequential.map((store: StoreInfo) => (
											<tr key={store.id}>
												<td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200">
													{store.id}
												</td>
												<td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200">
													{store.storeNumber}
												</td>
												<td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200">
													{store.storeName}
												</td>
												<td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200">
													{store.category}
												</td>
												<td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200">
													{store.area}
												</td>
												<td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200">
													{store.owner}
												</td>
												<td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200 text-center">
													<IconButton
														color="primary"
														aria-label="edit"
														component="span"
														sx={{ p: '0px' }}>
														<EditIcon sx={{ fontSize: 22 }} />
													</IconButton>
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

export default AdminPage;
