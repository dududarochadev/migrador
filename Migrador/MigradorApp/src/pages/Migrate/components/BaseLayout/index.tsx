import React from 'react';

import {Divider, Grid, Paper, Stack} from '@mui/material';
import {Button} from 'shared/components';

import {StepperMigracao} from '../StepperMigracao';

interface IProps {
  step: number;
  onBack?: () => void;
  onContinue: () => void;
  isLoading?: boolean;
}

export const BaseLayout: React.FC<IProps> = ({
  children,
  step,
  onBack,
  onContinue,
  isLoading = false,
}) => {
  return (
    <Grid item xs={12}>
      <Stack component={Paper}>
        <Grid container>
          <StepperMigracao activeStep={step} loading={isLoading} />

          <Grid item xs={12} sx={{height: 600, overflowY: 'auto'}}>
            <Stack p={4} height="100%">
              {children}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={3} p={4} justifyContent="flex-end">
              {onBack && (
                <Button
                  label="Voltar"
                  variant="outlined"
                  minWidth={240}
                  onClick={onBack}
                  size="large"
                />
              )}
              <Button
                label={step === 3 ? 'Iniciar migração' : 'Avançar'}
                loading={isLoading}
                minWidth={240}
                onClick={onContinue}
                size="large"
              />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Grid>
  );
};
