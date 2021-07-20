"use strict";

const Controller = require("egg").Controller;

class StoryController extends Controller {
  async home() {
    const { ctx } = this;
    try {
      const story = await ctx.service.story.random();
      await ctx.render("home.html", JSON.parse(JSON.stringify(story)));
    } catch (e) {
      ctx.body = "Something went wrong";
    }
  }

  async fetch() {
    const { ctx } = this;
    try {
      ctx.runInBackground(async () => {
        await ctx.service.pcbaby.bootstrap();
      });
      ctx.body = { code: 200, message: "SUCCESS" };
    } catch (e) {
      console.log(e);
      ctx.body = { code: 500, message: "Something went wrong" };
    }
  }
}

module.exports = StoryController;
