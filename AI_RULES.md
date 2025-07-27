# AI Development Rules for Nexus AI

This document outlines the core technologies used in this project and provides guidelines for their usage to ensure consistency, maintainability, and best practices.

## Tech Stack Overview

*   **React**: The primary JavaScript library for building user interfaces.
*   **TypeScript**: A superset of JavaScript that adds static typing, enhancing code quality and developer experience.
*   **Vite**: A fast and efficient build tool for modern web projects.
*   **React Router**: Used for declarative routing within the application, managing navigation between different pages.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly styling components directly in your markup.
*   **shadcn/ui**: A collection of re-usable components built with Radix UI and Tailwind CSS, providing a consistent and accessible UI foundation.
*   **Supabase**: An open-source Firebase alternative used for authentication, database interactions, and serverless functions.
*   **React Query (TanStack Query)**: For managing, caching, and synchronizing server state in your React application.
*   **React Hook Form & Zod**: A powerful combination for building and validating forms efficiently.
*   **Lucide React**: A library providing a set of beautiful, customizable open-source icons.
*   **Sonner**: A modern toast notification library for displaying ephemeral messages to users.
*   **Framer Motion**: A production-ready motion library for React, making it easy to add animations to your components.

## Library Usage Guidelines

To maintain a clean and consistent codebase, please adhere to the following rules when using libraries:

*   **React**: All UI components should be built using React.
*   **TypeScript**: Always use TypeScript for new files and when modifying existing ones. Ensure proper typing for props, state, and functions.
*   **React Router**: All client-side routing should be handled by `react-router-dom`. Keep the main route definitions in `src/App.tsx`.
*   **Tailwind CSS**: All styling must be done using Tailwind CSS utility classes. Avoid writing custom CSS unless absolutely necessary for complex, non-Tailwindable styles (which should be rare).
*   **shadcn/ui**: Utilize components from `src/components/ui` (which are shadcn/ui components) whenever possible for common UI elements like buttons, cards, inputs, etc. Do **not** modify the `src/components/ui` files directly. If a shadcn/ui component needs customization beyond its props, create a new component that wraps or extends it.
*   **Lucide React**: Use icons from `lucide-react` for all graphical icons in the application.
*   **React Query**: For any data fetching from Supabase or other APIs, use `react-query` to manage the data state, caching, and revalidation.
*   **React Hook Form & Zod**: All forms should be managed using `react-hook-form` for state and validation, with `zod` for schema definition and validation.
*   **Sonner**: For displaying toast notifications, use the `useToast` hook provided in `src/hooks/use-toast.ts`, which wraps `sonner`.
*   **Supabase**: Interact with the Supabase backend using the client instance provided in `src/integrations/supabase/client.ts`.
*   **Framer Motion**: For any animations or transitions, prefer `framer-motion` to ensure smooth and performant UI animations.