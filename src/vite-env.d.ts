/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

declare module '*.csv?raw' {
  const content: string
  export default content
}
