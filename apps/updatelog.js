import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Handlebars from "handlebars"; // 引入 Handlebars
// 插件基类 (假设你已经导入了 plugin)
// import plugin from "./plugin.js";

export class renderTest extends plugin {
  constructor() {
    super({
      name: "1",
      event: "message",
      rule: [{ reg: "更新日志", fnc: "updateLog" }],
    });
  }

  async updateLog(e) {
    const data = {
      date: "2024年5月16日",
      features: [
        { name: "新功能1", description: "这是新功能1的详细介绍。" },
        { name: "新功能2", description: "这是新功能2的详细介绍。" },
      ],
      author: "429",
      message: "好耶，是大冒险！",
    };

    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // 设置 viewport (可选)
      await page.setViewport({ width: 500, height: 576 });

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      const htmlPath = path.resolve(
        __dirname,
        "../../../plugins/xiu-plugin/resources/updatelog.html",
      );

      // 1. 读取 HTML 文件内容
      let html = await fs.promises.readFile(htmlPath, "utf8");

      // 2. 编译 Handlebars 模板
      const template = Handlebars.compile(html);

      // 3. 渲染模板
      html = template(data);

      // 4. 设置页面内容
      await page.setContent(html);

      // 获取所有元素的 boundingBox
      const boxes = await page.evaluate(() => {
        const elements = document.querySelectorAll("*"); // 选择所有元素
        return Array.from(elements).map((element) => {
          const box = element.getBoundingClientRect();
          return {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
          };
        });
      });

      // 计算最小矩形
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const box of boxes) {
        minX = Math.min(minX, box.x);
        minY = Math.min(minY, box.y);
        maxX = Math.max(maxX, box.x + box.width);
        maxY = Math.max(maxY, box.y + box.height);
      }

      // 截图
      const screenshotPath = path.resolve(
        __dirname,
        "../../../plugins/xiu-plugin/resources/screenshot.png",
      );
      await page.screenshot({
        path: screenshotPath,
        clip: {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
        },
      });

      e.reply(`截图已保存到 ${screenshotPath}`);
      e.reply([segment.image(screenshotPath)]);
      await browser.close();
    } catch (error) {
      console.error("截图失败:", error);
      e.reply("截图失败");
    }
  }
}
