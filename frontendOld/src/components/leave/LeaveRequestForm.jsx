import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { leaveService } from '../../services/api';

const LeaveRequestForm = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      startDate: null,
      endDate: null,
      reason: ''
    },
    validationSchema: Yup.object({
      startDate: Yup.date()
        .required('Başlangıç tarihi zorunludur')
        .min(new Date(), 'Başlangıç tarihi bugünden önce olamaz'),
      endDate: Yup.date()
        .required('Bitiş tarihi zorunludur')
        .min(Yup.ref('startDate'), 'Bitiş tarihi başlangıç tarihinden önce olamaz'),
      reason: Yup.string()
        .required('İzin nedeni zorunludur')
        .min(10, 'İzin nedeni en az 10 karakter olmalıdır')
        .max(500, 'İzin nedeni en fazla 500 karakter olabilir')
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        await leaveService.createLeaveRequest(values);
        setSuccess('İzin talebiniz başarıyla oluşturuldu.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (err) {
        setError('İzin talebi oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        console.error('İzin talebi oluşturulurken hata:', err);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          İzin Talebi Oluştur
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
            <DatePicker
              label="Başlangıç Tarihi"
              value={formik.values.startDate}
              onChange={(value) => formik.setFieldValue('startDate', value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                  helperText={formik.touched.startDate && formik.errors.startDate}
                />
              )}
            />
            <DatePicker
              label="Bitiş Tarihi"
              value={formik.values.endDate}
              onChange={(value) => formik.setFieldValue('endDate', value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                  helperText={formik.touched.endDate && formik.errors.endDate}
                />
              )}
            />
          </LocalizationProvider>
          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={4}
            name="reason"
            label="İzin Nedeni"
            value={formik.values.reason}
            onChange={formik.handleChange}
            error={formik.touched.reason && Boolean(formik.errors.reason)}
            helperText={formik.touched.reason && formik.errors.reason}
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'İzin Talebi Oluştur'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LeaveRequestForm;
