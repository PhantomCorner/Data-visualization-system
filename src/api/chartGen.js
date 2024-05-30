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
    url: "/chartGen/uploadChart",
    method: "post",
    data,
  });
}

export function getAllChart(data) {
  return request({
    url: "/chartGen/allCharts",
    method: "post",
    data,
  });
}

export function dropChart(data) {
  return request({
    url: "/dashboard/dropChart",
    method: "post",
    data,
  });
}
