import { Plugin } from '@nestjs/apollo';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
const Reset = "\x1b[0m";
const Bright = "\x1b[1m";
const FgGreen = "\x1b[32m";
const FgRed = "\x1b[31m";
const FgCyan = "\x1b[36m";
const FgMagenta = "\x1b[35m";

@Plugin()
export class GraphQLLoggerPlugin implements ApolloServerPlugin {
  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    const startTime = Date.now();

    return {
      async willSendResponse(requestContext: any) {
        const { request, response, errors } = requestContext;
        const { operationName, variables } = request;

        if (operationName === 'IntrospectionQuery') {
          return;
        }

        const duration = Date.now() - startTime;
        const isError = errors && errors.length > 0;
        
        const statusColor = isError ? FgRed : FgGreen;
        const statusText = isError ? 'ERROR' : 'OK';

        console.log(`\n${Bright}${statusColor}⚡ [GraphQL] ${operationName || 'Anonymous'} ${statusText} (${duration}ms)${Reset}`);

        if (variables && Object.keys(variables).length > 0) {
          console.log(`${FgCyan}Variables:\n${JSON.stringify(variables, null, 2)}${Reset}`);
        }
        
        if (isError) {
          console.log(`${FgRed}Errors:\n${JSON.stringify(errors, null, 2)}${Reset}`);
        }
        
        if (response.body.kind === 'single' && response.body.singleResult?.data) {
          let resStr = JSON.stringify(response.body.singleResult.data, null, 2);
          if (resStr && resStr.length > 800) {
            resStr = resStr.substring(0, 800) + `\n... [TRUNCATED]`;
          }
          console.log(`${FgMagenta}Response:\n${resStr}${Reset}`);
        }
      },
    };
  }
}
