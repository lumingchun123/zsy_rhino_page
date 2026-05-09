const loadingTitle = document.querySelector("#loadingTitle");
const loadingDetail = document.querySelector("#loadingDetail");
const progressBar = document.querySelector("#progressBar");

window.__modelShowcase = {
  status: "booting",
  url: "",
  meshCount: 0,
  triangles: 0,
};

progressBar.style.width = "8%";

const slowTimer = window.setTimeout(() => {
  if (window.__modelShowcase?.status !== "loaded") {
    loadingTitle.textContent = "模型仍在加载";
    loadingDetail.textContent = "完整模型较大，请保持页面打开；若现场网络较慢，等待时间会更长。";
  }
}, 20000);

try {
  loadingDetail.textContent = "正在启动三维视口";
  const { startViewer } = await import("./app.js?v=20260510-merge1");
  progressBar.style.width = "18%";
  await startViewer("auto");
  window.clearTimeout(slowTimer);
} catch (error) {
  console.error(error);
  window.clearTimeout(slowTimer);
  loadingTitle.textContent = "模型启动失败";
  loadingDetail.textContent = "请按 Ctrl + F5 强制刷新后再试。";
  progressBar.style.width = "0%";
}
