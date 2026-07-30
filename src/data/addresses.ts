import { digitsOnly } from '@utils/format';

/**
 * Endereços de entrega — mock de `/addresses`.
 *
 * `label` é o apelido que a pessoa dá ("Casa", "Trabalho"): é por ele que se
 * escolhe endereço no checkout, não pela rua. `notes` é o recado ao entregador —
 * numa entrega que exige assinatura de maior de 18 anos, "falar com a portaria"
 * é a diferença entre entregar e voltar com a caixa.
 */
export type SavedAddress = {
  id: string;
  label: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  uf: string;
  cep: string;
  notes?: string;
};

export const SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-1',
    label: 'Casa',
    street: 'Rua Harmonia',
    number: '421',
    complement: 'apto 52',
    district: 'Vila Madalena',
    city: 'São Paulo',
    uf: 'SP',
    cep: '05435-000',
    notes: 'Portaria 24h — deixar com o Seu Antônio.',
  },
  {
    id: 'addr-2',
    label: 'Trabalho',
    street: 'Avenida Paulista',
    number: '1578',
    complement: '9º andar',
    district: 'Bela Vista',
    city: 'São Paulo',
    uf: 'SP',
    cep: '01310-200',
    notes: 'Receber até as 18h.',
  },
];

/** O que uma busca por CEP devolve: tudo menos o que só a pessoa sabe. */
export type CepLookup = Pick<
  SavedAddress,
  'street' | 'district' | 'city' | 'uf'
>;

/**
 * Mock da busca por CEP (o ViaCEP entra na Fase 16, junto com o resto da API).
 *
 * Poucos CEPs de propósito, escolhidos para exercitar os dois prazos de entrega:
 * SP/RJ caem no de 24h, POA e BH no de 2 a 5 dias. CEP fora da lista devolve
 * `null` — e é justamente o caminho que a tela precisa ter, porque nenhum serviço
 * de CEP acerta 100% e o preenchimento à mão não pode ser um beco sem saída.
 */
const CEPS: Record<string, CepLookup> = {
  '05435000': {
    street: 'Rua Harmonia',
    district: 'Vila Madalena',
    city: 'São Paulo',
    uf: 'SP',
  },
  '01310200': {
    street: 'Avenida Paulista',
    district: 'Bela Vista',
    city: 'São Paulo',
    uf: 'SP',
  },
  '22071000': {
    street: 'Avenida Atlântica',
    district: 'Copacabana',
    city: 'Rio de Janeiro',
    uf: 'RJ',
  },
  '90035000': {
    street: 'Rua Ramiro Barcelos',
    district: 'Rio Branco',
    city: 'Porto Alegre',
    uf: 'RS',
  },
  '30140071': {
    street: 'Rua da Bahia',
    district: 'Centro',
    city: 'Belo Horizonte',
    uf: 'MG',
  },
};

export const lookupCep = (cep: string): CepLookup | null =>
  CEPS[digitsOnly(cep)] ?? null;
