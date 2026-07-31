import { type View } from 'react-native';

/** Geometria de um nó em coordenadas da JANELA. */
export type Measurement = { x: number; y: number; width: number; height: number };

/**
 * `measureInWindow` como promise.
 *
 * Existe para medir VÁRIOS nós antes de navegar: quem abre um shared element
 * precisa gravar a forma de origem e as âncoras de dentro dela num só passo
 * (`Promise.all`), e a navegação só pode acontecer depois. Ver `CurationBlock`
 * e `organisms/sommelier-story`.
 */
export function measureNode(node: View | null): Promise<Measurement | undefined> {
  return new Promise(resolve => {
    if (!node) {
      resolve(undefined);
      return;
    }
    node.measureInWindow((x, y, width, height) =>
      resolve({ x, y, width, height }),
    );
  });
}
