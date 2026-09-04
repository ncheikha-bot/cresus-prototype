/// <reference types="vite/client" />

/* Les exports Figma importent leurs images via un protocole virtuel,
   résolu par le plugin `figmaAssetResolver` de vite.config.ts. */
declare module 'figma:asset/*' {
  const src: string;
  export default src;
}
