import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from './router';

export const trpc = createTRPCReact<AppRouter>();

// using trpc because it provides a type-safe way to interact with the backend API
// it allows us to define our API schema in one place and use it both on the client
// and server, ensuring type safety and reducing boilerplate code
// this is particularly useful in a Next.js application where we want to maintain
// a consistent API contract across server-side and client-side code
// it also integrates well with React Query for data fetching and caching, making it
// a powerful tool for building modern web applications with type safety and efficiency
// additionally, it supports features like automatic type inference and code generation,
// which can significantly speed up development and reduce runtime errors
// overall, trpc enhances the developer experience by providing a robust framework for building type-safe APIs
// that are easy to consume in React applications, making it a preferred choice for many developers.

// this allows use to avoid writing tests for the client-side code
// as the API is already tested on the server-side, ensuring that the client-side code
// is only responsible for rendering the UI and handling user interactions
// this separation of concerns allows for a more modular and maintainable codebase