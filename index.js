const { ApolloServer, gql } = require('apollo-server');
const { tasks } = require('./src/db');

const typeDefs = gql`
  type Task {
    id: Int
    name: String
    completed: Boolean
    sequence: Int
  }

  type Query {
    tasks: [Task]
    task(id: Int!): Task
  }

  type Mutation {
    createTask(name: String!): Task!
    updateTask(id: Int!, name: String, completed: Boolean): Task!
    updateSequence(id: Int!, prev_id: Int, next_id: Int): Task!
  }
`;

const resolvers = {
  Query: {
    tasks: () => tasks.sort((a, b) => a.sequence - b.sequence),
    task: (parent, { id }, context, inf) => tasks.find((task) => task.id == id)
  },
  Mutation: {
    createTask: (parent, { name }, context, info) => {
      const id = tasks.length + 1; // 如果是数据库的话就不用管id,数据库会自己增加1
      const sequence = tasks.slice(-1)[0].sequence + 1024;
      tasks.push({id: id, name: name, completed: false, sequence: sequence})
      return tasks.slice(-1)[0]
    },
    updateTask: (parent, { id, name, completed }, context, info) => {
      let task = tasks.find((task) => task.id == id)
      if (name != undefined)  task.name = name
      if (completed != undefined) task.completed = completed
      return task
    },
    updateSequence: (parent, { id, prev_id, next_id }, context, info) => {
      let task = tasks.find((task) => task.id == id)
      const prev = tasks.find((task) => task.id == prev_id)
      const next = tasks.find((task) => task.id == next_id)
      if (prev && next) {
        task.sequence = (prev.sequence + next.sequence) / 2
      } else if (prev) {
        task.sequence = prev.sequence + 1024
      } else if (next) {
        task.sequence = next.sequence - 1024
      }
      return task
    }
  },
};


const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
