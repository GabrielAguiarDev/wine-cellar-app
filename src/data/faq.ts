/**
 * Perguntas frequentes — conteúdo do acordeão da seção de ajuda do Perfil.
 *
 * Mora em `data/` e não na tela pelo mesmo motivo de `CURATIONS`: quando houver
 * uma tela de ajuda dedicada (ou uma busca dentro dela), a lista é a mesma. O
 * `id` é a identidade do item no acordeão (`Accordion.Item value`) e o que um dia
 * vira âncora de deep link — não derivar da pergunta, que muda de texto.
 */
export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
};

export const FAQ: FaqEntry[] = [
  {
    id: 'entrega',
    question: 'Como funciona a entrega?',
    answer:
      'Enviamos em caixa térmica própria, com transporte climatizado nas capitais. Em São Paulo e Rio de Janeiro o prazo é de 24 horas; nas demais regiões, de 2 a 5 dias úteis. Acompanhe cada etapa em "Pedidos recentes".',
  },
  {
    id: 'recebimento',
    question: 'Preciso estar em casa para receber?',
    answer:
      'Sim. A entrega é feita a maiores de 18 anos, com assinatura e conferência do documento no ato. Se ninguém puder receber, o entregador tenta mais duas vezes antes de devolver à adega.',
  },
  {
    id: 'reserva',
    question: 'Posso reservar um rótulo esgotado?',
    answer:
      'Rótulos da coleção reservada abrem lista de espera. Membros Prime e VIP têm prioridade e são avisados por notificação assim que a próxima remessa chega — antes de o rótulo voltar ao catálogo.',
  },
  {
    id: 'pontos',
    question: 'Como acumulo pontos?',
    answer:
      'São 1 ponto por real em compras, 15 pontos por avaliação publicada e 80 por indicação de amigo. Os pontos entram na conta quando o pedido é entregue e podem ser usados como desconto no fechamento da compra.',
  },
  {
    id: 'presente',
    question: 'Consigo enviar como presente?',
    answer:
      'No fechamento da compra, ative "Isso é um presente?" para escrever um cartão à mão, ocultar o preço da embalagem e escolher a data de entrega.',
  },
  {
    id: 'devolucao',
    question: 'E se a garrafa chegar com problema?',
    answer:
      'Vinho avariado, rolha comprometida ou garrafa danificada no transporte: fale com a gente em até 7 dias e trocamos ou devolvemos o valor integral, sem devolver a garrafa.',
  },
];
