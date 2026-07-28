import { type QuizQuestion } from './types';

/** Quiz de paladar (3 perguntas) — idêntico ao protótipo (`this.quiz`). */
export const QUIZ: QuizQuestion[] = [
  {
    key: 'style',
    question: 'Você prefere vinhos secos ou suaves?',
    desc: 'Isso guia a doçura das nossas recomendações.',
    options: [
      { label: 'Secos', hint: 'Sem doçura residual, mais gastronômicos', val: 'seco' },
      { label: 'Suaves', hint: 'Levemente adocicados e macios', val: 'suave' },
    ],
  },
  {
    key: 'body',
    question: 'Tintos encorpados ou leves?',
    desc: 'O corpo define a intensidade na boca.',
    options: [
      { label: 'Encorpados', hint: 'Densos, estruturados, marcantes', val: 'encorpado' },
      { label: 'Leves', hint: 'Frescos, fáceis, delicados', val: 'leve' },
    ],
  },
  {
    key: 'moment',
    question: 'Para qual momento, normalmente?',
    desc: 'Ajustamos a curadoria à sua rotina.',
    options: [
      { label: 'Jantares & encontros', hint: 'Ocasiões para compartilhar', val: 'jantar' },
      { label: 'Um brinde a sós', hint: 'A taça do fim do dia', val: 'solo' },
    ],
  },
];
