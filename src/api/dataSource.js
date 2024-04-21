import request from "@/utils/request";

export function getDataSource() {
  return request({
    url: "/dataSource/allFile",
    method: "get",
  });
}
export function getFileContent(data) {
  return request({
    url: "/dataSource/getFile",
    method: "post",
    data,
  });
}

export function getAllChartPreview() {
  return request({
    url: "/dataSource/chartPreview/all",
    method: "get",
  });
}
export function getChartOption(data) {
  return request({
    url: "/dataSource/chartOption",
    method: "post",
    data,
  });
}
