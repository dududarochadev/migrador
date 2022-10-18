import React, {useCallback, useEffect, useRef} from 'react';
import {useMutation, useQuery} from 'react-query';
import {useNavigate} from 'react-router-dom';

import {Grid, Tooltip, Typography} from '@mui/material';
import {FormHandles} from '@unform/core';
import {BaseLayout} from 'pages/Migrate/components';
import {
  Autocomplete,
  Checkbox,
  Form,
  LinearIndeterminate,
  Subtitle,
} from 'shared/components';
import getValidationErrors from 'shared/helpers/getValidationErrors';
import {useMigrate, useTitle} from 'shared/hooks';
import {feedback} from 'shared/services/alertService';
import {
  IUnidade,
  servicoDeItensParaMigrar,
} from 'shared/services/api/servicoDeItensParaMigrar';
import {IEnumerador} from 'shared/services/api/servicoDeTiposDePara';
import * as Yup from 'yup';
import {servicoDeMigracao} from 'shared/services/api/servicoDeMigracao';
import internal from 'stream';

const Itens: React.FC = () => {
  const {setTitle} = useTitle();
  const {setIsDepara, setPageDataItems, setItems, pageDataItems, setUnidades} =
    useMigrate();
  const formRef = useRef<FormHandles>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTitle('Migração');
  }, [setTitle]);

  const {data: unidades} = useQuery(
    'unidades',
    servicoDeItensParaMigrar.obterUnidades,
  );

  const {data: itensParaMigracao} = useQuery(
    'itensParaMigracao',
    servicoDeItensParaMigrar.obterItensParaMigrar,
  );

  const {
    mutate: popularCadastrosBasicos,
    isLoading: isLoadingPopularCadastrosBasicos,
  } = useMutation(servicoDeMigracao.popularCadastrosBasicos, {
    onSuccess: () => {
      setIsDepara(true);
      navigate('/deparas');
    },
    onError: (error: any) => {
      feedback(String(error), 'error');
    },
  });

  const {
    mutate: atualizarEstabelecimentosSelecionados,
    isLoading: isLoadingAtualizarEstabelecimentosSelecionados,
  } = useMutation(
    (payload: number[]) =>
      servicoDeItensParaMigrar.atualizarEstabelecimentosSelecionados(payload),
    {
      onError: (error: any) => {
        feedback(String(error), 'error');
      },
    },
  );

  const handleSubmit = useCallback(
    async (data: any) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          unidades: Yup.array().required(),
        });

        setPageDataItems(data);
        sessionStorage.setItem('itensPageParaMigracao', JSON.stringify(data));

        const items: IEnumerador[] = [];

        itensParaMigracao?.forEach((item) => {
          if (data.items[item.id]) {
            items.push({
              id: item.id,
              descricao: item.descricao,
            });
          }
        });

        if (items.length === 0) {
          feedback('Selecione ao menos um item para migrar!', 'error');
          throw new Error('Selecione ao menos um item para migrar!');
        }

        await schema.validate(data, {
          abortEarly: false,
        });

        setItems(items);
        setUnidades(data.unidades);

        sessionStorage.setItem('itensParaMigracao', JSON.stringify(items));
        sessionStorage.setItem(
          'unidadesParaMigracao',
          JSON.stringify(data.unidades),
        );

        const idsUnidades = data.unidades.map((u: any) => u.id);

        atualizarEstabelecimentosSelecionados(idsUnidades);

        if (data.items['CadastrosBasicos']) {
          popularCadastrosBasicos();
        } else {
          setIsDepara(false);
          navigate('/conclusao');
        }
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err as Yup.ValidationError);
          formRef.current?.setErrors(errors);
        }
      }
    },
    [
      setPageDataItems,
      itensParaMigracao,
      setItems,
      setUnidades,
      setIsDepara,
      navigate,
    ],
  );

  const handleContinue = useCallback(() => {
    formRef.current?.submitForm();
  }, []);

  const handleBack = useCallback(() => {
    navigate('/config');
  }, [navigate]);

  useEffect(() => {
    if (unidades?.length === 0) {
      feedback(
        'A base de dados do College (Origem) configurada não existe ou não tem unidades configuradas.',
        'error',
      );
      navigate('/config');
    }
  }, [unidades]);

  return (
    <Grid container spacing={4}>
      <BaseLayout
        step={1}
        onContinue={handleContinue}
        onBack={handleBack}
        isLoading={
          isLoadingPopularCadastrosBasicos &&
          isLoadingAtualizarEstabelecimentosSelecionados
        }>
        {itensParaMigracao ? (
          <Form
            onSubmit={handleSubmit}
            ref={formRef}
            initialData={pageDataItems}>
            <Grid container spacing={2}>
              <Subtitle
                subtitle="Unidades"
                description="Selecione as unidades que serão migradas"
              />

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  label="Unidades"
                  name="unidades"
                  options={unidades || []}
                  getOptionLabel={(opt) => opt.nome}
                />
              </Grid>

              <Subtitle
                subtitle="Itens"
                description="Selecione os itens que serão migrados"
              />

              {itensParaMigracao?.map((item) => (
                <Grid item xs={4} key={item.id}>
                  <Checkbox name={`items.${item.id}`} label={item.descricao} />
                </Grid>
              ))}
            </Grid>
          </Form>
        ) : (
          <LinearIndeterminate />
        )}
      </BaseLayout>
    </Grid>
  );
};

export default Itens;
