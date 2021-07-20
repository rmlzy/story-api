"use strict";

const Service = require("egg").Service;
const _ = require("lodash");

class StoryService extends Service {
  async create({ title, category, content }) {
    const { ctx } = this;
    const exist = await ctx.model.Story.findOne({ where: { title } });
    if (exist) {
      console.log("已存在, 跳过");
      return;
    }
    const created = await ctx.model.Story.create({ title, category, content });
    console.log("新增了一条故事");
    return created;
  }

  async findIds() {
    const { ctx } = this;
    const rows = await ctx.model.Story.findAll({ attributes: ["id"] });
    return rows.map((item) => item.id);
  }

  async random() {
    const { ctx } = this;
    const ids = await ctx.service.story.findIds();
    const randomIndex = _.random(0, ids.length);
    return ctx.model.Story.findByPk(ids[randomIndex]);
  }
}

module.exports = StoryService;
