module.exports = (app) => {
  const { INTEGER, STRING, TEXT } = app.Sequelize;

  const Story = app.model.define("story", {
    id: {
      type: INTEGER(10),
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: STRING(200),
    },

    category: {
      type: STRING(100),
    },

    content: {
      type: TEXT,
    },

    read: {
      type: INTEGER,
      defaultValue: 0,
    },
  });

  return Story;
};
