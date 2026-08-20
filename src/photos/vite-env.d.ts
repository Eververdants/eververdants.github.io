/// <reference types="vite/client" />

declare module "virtual:works-index" {
  const works: import("./data/types").Work[];
  export { works };
}
