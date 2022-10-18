import {Api} from 'shared/services/axiosConfig';

export interface IUnidade {
  id: number;
  nome: string;
}

const obterUnidades = async (): Promise<IUnidade[]> => {
  try {
    const {data} = await Api().get<IUnidade[]>(
      `api/ItensParaMigrar/ObterUnidades`,
    );
    return data;
  } catch (e: any) {
    throw new Error(e.mensagens);
  }
};

export interface IItemParaMigrar {
  id: string;
  descricao: string;
}

const obterItensParaMigrar = async (): Promise<IItemParaMigrar[]> => {
  try {
    const {data} = await Api().get<IItemParaMigrar[]>(
      `api/ItensParaMigrar/ObterItensParaMigrar`,
    );
    return data;
  } catch (e: any) {
    throw new Error(e.mensagens);
  }
};

const atualizarEstabelecimentosSelecionados = async (
  payload: number[],
): Promise<string> => {
  try {
    const {data} = await Api().post<string>(
      `api/ItensParaMigrar/AtualizarEstabelecimentosSelecionados`,
      payload,
    );
    return data;
  } catch (e: any) {
    throw new Error(e.mensagens);
  }
};

export const servicoDeItensParaMigrar = {
  obterUnidades,
  obterItensParaMigrar,
  atualizarEstabelecimentosSelecionados,
};
