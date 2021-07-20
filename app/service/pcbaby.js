"use strict";

const Service = require("egg").Service;
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

const cookie =
  "pcsuv=1626743643350.a.641782997; CMT4_IP_AREA=%u4E0A%u6D77%u5E02; channel=708; pcuvdata=lastAccessTime=1626747239307|visits=4";
const ua =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";

class PcbabyService extends Service {
  async bootstrap() {
    const { ctx } = this;
    const categoryMap = {
      shenhua: {
        name: "神话故事",
        entry: "https://edu.pcbaby.com.cn/book/zt/shenhua/",
        maxPage: 27,
      },
      tonghua: {
        name: "童话故事",
        entry: "https://edu.pcbaby.com.cn/book/zt/tonghua/",
        maxPage: 37,
      },
      shuiqian: {
        name: "睡前故事",
        entry: "https://edu.pcbaby.com.cn/book/zt/shuiqian/",
        maxPage: 67,
      },
      yuyan: {
        name: "寓言故事",
        entry: "https://edu.pcbaby.com.cn/book/zt/yuyan/",
        maxPage: 48,
      },
      sizichengyu: {
        name: "四字成语",
        entry: "https://edu.pcbaby.com.cn/book/zt/sizichengyu/",
        maxPage: 66,
      },
      jielong: {
        name: "接龙",
        entry: "https://edu.pcbaby.com.cn/book/zt/jielong/",
        maxPage: 32,
      },
    };

    for (const key in categoryMap) {
      const category = categoryMap[key];
      const pageUrls = this.genPageUrls(category.entry, category.maxPage);
      for (let i = 0; i < pageUrls.length; i++) {
        const pageUrl = pageUrls[i];
        const articles = await this.fetchArticlesByPageUrl(pageUrl);
        for (let j = 0; j < articles.length; j++) {
          const article = articles[j];
          console.log("==========================");
          console.log(`正在抓取: ${article.title}`);
          const content = await this.fetchStoryByArticleUrl(article.url);
          if (content) {
            await ctx.service.story.create({
              title: article.title,
              category: category.name,
              content,
            });
          }
        }
      }
    }
  }

  genPageUrls(baseUrl, maxPage) {
    const urls = [];
    for (let i = 0; i < maxPage; i++) {
      if (i > 0) {
        urls.push(`${baseUrl}index_${i}.html`);
      } else {
        urls.push(baseUrl);
      }
    }
    return urls;
  }

  async fetchArticlesByPageUrl(pageUrl) {
    const articles = [];
    try {
      const { ctx } = this;
      const res = await ctx.curl(pageUrl, {
        headers: {
          "User-Agent": ua,
          Cookie: cookie,
        },
      });
      const html = iconv.decode(res.data, "GB2312");
      const $ = cheerio.load(html, { decodeEntities: false });
      $("div.dwrapperC div.tb ul li").each(function () {
        const $a = $(this).find(".iTit a");
        const href = $a.attr("href");
        if (href) {
          articles.push({
            title: $a.text(),
            url: `https:${href}`,
          });
        }
      });
    } catch (e) {
      console.log("--------------------------");
      console.log("抓取文章列表错误: ");
      console.log(pageUrl);
      console.log(e);
      console.log("--------------------------");
    }
    return articles;
  }

  async fetchStoryByArticleUrl(articleUrl) {
    let story = "";
    try {
      const { ctx } = this;
      const res = await ctx.curl(articleUrl, {
        headers: {
          "User-Agent": ua,
          Cookie: cookie,
        },
      });
      const html = iconv.decode(res.data, "GB2312");
      const $ = cheerio.load(html, { decodeEntities: false });
      const $text = $("div.mainText");
      if ($text) {
        story = $text.html();
      }
    } catch (e) {
      console.log("--------------------------");
      console.log("抓取正文错误: ");
      console.log(articleUrl);
      console.log(e);
      console.log("--------------------------");
    }
    return story;
  }
}

module.exports = PcbabyService;
