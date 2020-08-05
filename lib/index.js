const {
  ApolloServer,
  gql
} = require('apollo-server');

const typeDefs = gql`
  type Task {
    id: Int
    name: String
    completed: Boolean
    sequence: Int
  }

  type Query {
    tasks(completed: Int): [Task]
    task(id: Int!): Task
  }

  type Mutation {
    createTask(name: String!): [Task]
    updateTask(id: Int!, name: String, completed: Boolean): Task!
    updateSequence(id: Int!, prev_id: Int, next_id: Int): Task!
  }
`;
const resolvers = {
  Query: {
    tasks: (parent, {
      completed
    }, {
      dataSources
    }, info) => {
      if (completed != undefined && completed == 1) {
        return dataSources.db.getCompletedTasks();
      } else {
        return dataSources.db.getUnCompletedTasks();
      }
    },
    task: (parent, {
      id
    }, {
      dataSources
    }, inf) => {
      return dataSources.db.getTask(id);
    }
  },
  Mutation: {
    createTask: (parent, {
      name
    }, {
      dataSources
    }, info) => {
      const res = dataSources.db.createTask(name);
      console.log(res);
      return dataSources.db.getUnCompletedTasks();
    },
    updateTask: (parent, {
      id,
      name,
      completed
    }, context, info) => {
      let task = tasks.find(task => task.id == id);
      if (name != undefined) task.name = name;
      if (completed != undefined) task.completed = completed;
      return task;
    },
    updateSequence: (parent, {
      id,
      prev_id,
      next_id
    }, context, info) => {
      let task = tasks.find(task => task.id == id);
      const prev = tasks.find(task => task.id == prev_id);
      const next = tasks.find(task => task.id == next_id);

      if (prev && next) {
        task.sequence = (prev.sequence + next.sequence) / 2;
      } else if (prev) {
        task.sequence = prev.sequence + 1024;
      } else if (next) {
        task.sequence = next.sequence - 1024;
      }

      return task;
    }
  }
};

const Database = require("./db");

const knexConfig = {
  client: "mysql",
  connection: {
    host: '127.0.0.1',
    user: "tower",
    password: "123456",
    database: "apollo-server-dev"
  },
  debug: true
};
const db = new Database(knexConfig);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    db
  })
});
server.listen().then(({
  url
}) => {
  console.log(`🚀  Server ready at ${url}`);
});