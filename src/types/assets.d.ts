// Permite importar arquivos de fonte como módulos (o Metro resolve para o asset).
declare module "*.ttf" {
  const asset: number;
  export default asset;
}

declare module "*.otf" {
  const asset: number;
  export default asset;
}
