import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
} from '@mui/material';
import { leaveRequestService } from '../services/api';
import { toast } from 'react-toastify';
import type { LeaveRequestCreate } from '../types';

const validationSchema = yup.object({
  startDate: yup.date().required('Başlangıç tarihi gereklidir'),
  endDate: yup
    .date()
    .min(yup.ref('startDate'), 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır')
    .required('Bitiş tarihi gereklidir'),
  reason: yup
    .string()
    .min(10, 'İzin sebebi en az 10 karakter olmalıdır')
    .required('İzin sebebi gereklidir'),
});

const LeaveRequestForm: React.FC = () => {
  const formik = useFormik<LeaveRequestCreate>({
    initialValues: {
      startDate: '',
      endDate: '',
      reason: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await leaveRequestService.createLeaveRequest(values);
        toast.success('İzin talebi başarıyla oluşturuldu!');
        formik.resetForm();
      } catch (error) {
        toast.error('İzin talebi oluşturulurken bir hata oluştu.');
      }
    },
  });

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Yeni İzin Talebi
        </Typography>
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            id="startDate"
            name="startDate"
            label="Başlangıç Tarihi"
            type="date"
            value={formik.values.startDate}
            onChange={formik.handleChange}
            error={formik.touched.startDate && Boolean(formik.errors.startDate)}
            helperText={formik.touched.startDate && formik.errors.startDate}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            id="endDate"
            name="endDate"
            label="Bitiş Tarihi"
            type="date"
            value={formik.values.endDate}
            onChange={formik.handleChange}
            error={formik.touched.endDate && Boolean(formik.errors.endDate)}
            helperText={formik.touched.endDate && formik.errors.endDate}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            id="reason"
            name="reason"
            label="İzin Sebebi"
            multiline
            rows={4}
            value={formik.values.reason}
            onChange={formik.handleChange}
            error={formik.touched.reason && Boolean(formik.errors.reason)}
            helperText={formik.touched.reason && formik.errors.reason}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
          >
            İzin Talebi Oluştur
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LeaveRequestForm; 