// index.js
import fs from "node:fs";

// 自动连接数据库
try {
  await Database.connect(); // 确保在加载插件前连接数据库
  console.log("Database connected on startup");
} catch (error) {
  console.error("Failed to connect to the database on startup:", error.message);
}
const files = fs
  .readdirSync("./plugins/xiu-plugin/apps")
  .filter((file) => file.endsWith(".js"));

let ret = [];

files.forEach((file) => {
  ret.push(import(`./apps/${file}`));
});

ret = await Promise.allSettled(ret);

let apps = {};
for (let i in files) {
  let name = files[i].replace(".js", "");

  if (ret[i].status !== "fulfilled") {
    logger.error(`载入插件错误：${logger.red(name)}`);
    logger.error(ret[i].reason);
    continue;
  }
  let app = ret[i].value[Object.keys(ret[i].value)[0]];
  apps[name] = app;
}

export { apps };
