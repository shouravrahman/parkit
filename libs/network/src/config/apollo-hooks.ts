// Re-export Apollo hooks from the v3 instance bundled with this lib.
// Import from here instead of '@apollo/client' directly to avoid
// version conflicts when the root workspace has a different Apollo version.
export {
    useQuery,
    useLazyQuery,
    useMutation,
    useSubscription,
    ApolloProvider,
} from '@apollo/client'
