import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

/**
 * Abre o seletor de arquivo do navegador (teste no computador) → data URL.
 * Redimensiona (máx 1080px) e recomprime (JPEG q0.7) antes de gerar o data URL:
 * foto full-size vira vários MB de base64 e incha o payload (localStorage +
 * jsonb no banco). Fallback pra imagem original se o canvas falhar.
 */
function pickWeb(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") return resolve(null);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => {
        const original = String(reader.result);
        const img = document.createElement("img");
        img.onload = () => {
          try {
            const MAX = 1080;
            const escala = Math.min(1, MAX / Math.max(img.width, img.height));
            const w = Math.round(img.width * escala);
            const h = Math.round(img.height * escala);
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve(original);
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL("image/jpeg", 0.7));
          } catch {
            resolve(original);
          }
        };
        img.onerror = () => resolve(original);
        img.src = original;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

/**
 * Escolhe uma foto da galeria e devolve uma DATA URL base64. No web usa canvas;
 * no nativo usa expo-image-picker com `base64: true` (NÃO o file:// uri, que não
 * seria visível pro consultor em outro dispositivo). null se o usuário cancelar.
 */
export async function escolherFotoDataUrl(): Promise<string | null> {
  if (Platform.OS === "web") return pickWeb();
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.6,
    base64: true,
  });
  if (res.canceled || !res.assets?.[0]) return null;
  const a = res.assets[0];
  // Sem base64 (edge case): trata como falha em vez de guardar um file:// uri —
  // que não é visível cross-device e quebraria a view do consultor.
  return a.base64 ? `data:image/jpeg;base64,${a.base64}` : null;
}
