import { GraphQLClient } from "graphql-request";
import { GITHUB_GRAPHQL_ENDPOINT, PUBLIC_GITHUB_API_KEY } from "../../shared/constants/variables";

export const graphqlClient = new GraphQLClient(GITHUB_GRAPHQL_ENDPOINT,{headers:{authorization: `Bearer ${PUBLIC_GITHUB_API_KEY}`}})
