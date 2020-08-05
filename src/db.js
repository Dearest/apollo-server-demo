const { SQLDataSource } = require("datasource-sql");
class Database extends SQLDataSource {
  getCompletedTasks() {
    return this.knex
      .select("*")
      .from("tasks")
      .where("completed", 1)
      .orderBy("sequence", "asc");
  };

  getUnCompletedTasks() {
    return this.knex
      .select("*")
      .from("tasks")
      .where("completed", 0)
      .orderBy("sequence", "asc");
  };

  getTask(id) {
    return this.knex("tasks").select("*").where("id", id).first();
  }

  createTask(name) {
    this.knex("tasks").select("*").orderBy("sequence", "desc").first()
        .then((row) => {
          this.knex("tasks").insert({name: name, sequence: row.sequence + 1024 })
        })
        .catch(function(error) { console.error(error); });
    // return this.knex("tasks").insert({name: name, sequence: sequence }).catch(function(error) { console.error(error); });
  };
}

module.exports = Database;
