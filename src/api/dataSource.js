import request from "@/utils/request";

export function getDataSource(token) {
  return request({
    url: "/dataSource/allFile",
    method: "get",
    params: { token },
  });
}
export function getFileContent(data) {
  return request({
    url: "/dataSource/getFile",
    method: "post",
    data,
  });
}
