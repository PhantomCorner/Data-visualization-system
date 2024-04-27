import request from "@/utils/request";

export function getAllChartPreview() {
  return request({
    url: "/chartGen/chartPreview/all",
    method: "get",
  });
}
export function getChartOption(data) {
  return request({
    url: "/chartGen/chartOption",
    method: "post",
    data,
  });
}

export function passChartDetail(data) {
  return request({
    url: "/chartGen/passChartDetail",
    method: "post",
    data,
  });
}

export function getAllChart() {
  return request({
    url: "/chartGen/allCharts",
    method: "get",
  });
}
