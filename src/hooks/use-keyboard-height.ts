import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Altura ocupada pelo teclado, em dp — 0 enquanto ele está fechado.
 *
 * Não dá para contar com o `adjustResize` do Android: a partir do SDK 54 o app
 * é sempre edge-to-edge e, nesse modo, o sistema não redimensiona mais a janela
 * quando o teclado abre — ele apenas cobre o conteúdo. Como o
 * `KeyboardAvoidingView` do React Native se apoia justamente nesse
 * redimensionamento (com `behavior` indefinido no Android, ele não faz nada), o
 * espaço é aberto pelo próprio layout: as telas somam esta altura ao
 * `paddingBottom`, o que encolhe a área de conteúdo e sobe os campos.
 *
 * A alternativa recomendada pela Expo para casos mais complexos é a
 * react-native-keyboard-controller, que não está incluída no Expo Go — e o
 * projeto roda no Expo Go.
 *
 * Na web o módulo `Keyboard` é um no-op e o valor fica sempre em 0.
 */
export function useKeyboardHeight(): number {
  const [altura, setAltura] = useState(0);

  useEffect(() => {
    // No iOS os eventos 'Will' acompanham a animação de abertura do teclado;
    // no Android só existem os 'Did'.
    const eventoAbrir = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const eventoFechar = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const inscricoes = [
      Keyboard.addListener(eventoAbrir, (e) => setAltura(e.endCoordinates.height)),
      Keyboard.addListener(eventoFechar, () => setAltura(0)),
    ];

    return () => inscricoes.forEach((inscricao) => inscricao.remove());
  }, []);

  return altura;
}
