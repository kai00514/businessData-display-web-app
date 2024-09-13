/**
 * APIレスポンス時のパラメーター定義
*/

// 店舗別　APIレスポンスを受け取り、合計データと店舗データに分ける処理
export const storeProcessData = (response) => {
  // UI に合わせたキー名に変更
  const totalData = {
    storeName: response.合計.base_name,
    storeNumber: response.合計.base_no,
    netSalesA: response.合計.sales_total1,
    netSalesB: response.合計.sales_total2,
    netSalesChange: response.合計.sales_total_diff,
    netSalesRatio: response.合計.sales_total_ab_ratio,
    usersA: response.合計.users1,
    usersB: response.合計.users2,
    usersChange: response.合計.users_total_diff,
    usersRatio: response.合計.users_total_ab_ratio,
    avgPriceA: response.合計.average_spend1,
    avgPriceB: response.合計.average_spend2,
    avgPriceChange: response.合計.average_spend_total_diff,
    avgPriceRatio: response.合計.average_spend_total_ab_ratio,
    newUsersA: response.合計.new_users1,
    newUsersB: response.合計.new_users2,
    newUsersChange: response.合計.new_users_total_diff,
    newUsersRatio: response.合計.new_users_total_ab_ratio,
    newUsersRateA: response.合計.new_rate1,
    newUsersRateB: response.合計.new_rate2,
    otherSalesA: response.合計.other_sales_total1,
    otherSalesB: response.合計.other_sales_total2,
    otherSalesChange: response.合計.other_sales_total_diff,
    otherSalesRatio: response.合計.other_sales_total_ab_ratio
  };

  const storeData = storeTransformData(response.店舗データ);

  return { totalData, storeData };
};

// 店舗データの変換処理
const storeTransformData = (data) => {
  return data.map(item => ({
    storeName: item.base_name,
    storeNumber: item.base_no,
    netSalesA: item.sales_total1,
    netSalesB: item.sales_total2,
    netSalesChange: item.sales_total_diff,
    netSalesRatio: item.sales_total_ab_ratio,
    usersA: item.users1,
    usersB: item.users2,
    usersChange: item.users_total_diff,
    usersRatio: item.users_total_ab_ratio,
    avgPriceA: item.average_spend1,
    avgPriceB: item.average_spend2,
    avgPriceChange: item.average_spend_total_diff,
    avgPriceRatio: item.average_spend_total_ab_ratio,
    newUsersA: item.new_users1,
    newUsersB: item.new_users2,
    newUsersChange: item.new_users_total_diff,
    newUsersRatio: item.new_users_total_ab_ratio,
    newUsersRateA: item.new_rate1,
    newUsersRateB: item.new_rate2,
    otherSalesA: item.other_sales_total1,
    otherSalesB: item.other_sales_total2,
    otherSalesChange: item.other_sales_total_diff,
    otherSalesRatio: item.other_sales_total_ab_ratio
  }));
};
// 日別　APIレスポンスを受け取り、合計データと店舗データに分ける処理
export const dateProcessData = (response) => {
  // UI に合わせたキー名に変更
  const totalData = {
    storeName: response.合計.date,
    storeNumber: response.合計.base_no,
    netSalesA: response.合計.sales_total1,
    netSalesB: response.合計.sales_total2,
    netSalesChange: response.合計.sales_total_diff,
    netSalesRatio: response.合計.sales_total_ab_ratio,
    usersA: response.合計.users1,
    usersB: response.合計.users2,
    usersChange: response.合計.users_total_diff,
    usersRatio: response.合計.users_total_ab_ratio,
    avgPriceA: response.合計.average_spend1,
    avgPriceB: response.合計.average_spend2,
    avgPriceChange: response.合計.average_spend_total_diff,
    avgPriceRatio: response.合計.average_spend_total_ab_ratio,
    newUsersA: response.合計.new_users1,
    newUsersB: response.合計.new_users2,
    newUsersChange: response.合計.new_users_total_diff,
    newUsersRatio: response.合計.new_users_total_ab_ratio,
    newUsersRateA: response.合計.new_rate1,
    newUsersRateB: response.合計.new_rate2,
    otherSalesA: response.合計.other_sales_total1,
    otherSalesB: response.合計.other_sales_total2,
    otherSalesChange: response.合計.other_sales_total_diff,
    otherSalesRatio: response.合計.other_sales_total_ab_ratio
  };

  const storeData = dateTransformData(response.店舗データ);

  return { totalData, storeData };
};

// 店舗データの変換処理
const dateTransformData = (data) => {
  return data.map(item => ({
    storeName: item.date,
    storeNumber: item.base_no,
    netSalesA: item.sales_total1,
    netSalesB: item.sales_total2,
    netSalesChange: item.sales_total_diff,
    netSalesRatio: item.sales_total_ab_ratio,
    usersA: item.users1,
    usersB: item.users2,
    usersChange: item.users_total_diff,
    usersRatio: item.users_total_ab_ratio,
    avgPriceA: item.average_spend1,
    avgPriceB: item.average_spend2,
    avgPriceChange: item.average_spend_total_diff,
    avgPriceRatio: item.average_spend_total_ab_ratio,
    newUsersA: item.new_users1,
    newUsersB: item.new_users2,
    newUsersChange: item.new_users_total_diff,
    newUsersRatio: item.new_users_total_ab_ratio,
    newUsersRateA: item.new_rate1,
    newUsersRateB: item.new_rate2,
    otherSalesA: item.other_sales_total1,
    otherSalesB: item.other_sales_total2,
    otherSalesChange: item.other_sales_total_diff,
    otherSalesRatio: item.other_sales_total_ab_ratio
  }));
};


