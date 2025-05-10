import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { leaveService } from '../../services/api';

const LeaveRequestList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await leaveService.getLeaveRequests();
      console.log('İzin talepleri yanıtı:', response); // Debug için
      if (Array.isArray(response)) {
        setRequests(response);
      } else if (response && Array.isArray(response.data)) {
        setRequests(response.data);
      } else {
        console.error('Beklenmeyen yanıt formatı:', response);
        setError('Sunucudan beklenmeyen bir yanıt alındı.');
      }
    } catch (error) {
      console.error('İzin talepleri yüklenirken hata:', error.response || error);
      setError(error.response?.data?.message || 'İzin talepleri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'Onaylandı';
      case 'REJECTED':
        return 'Reddedildi';
      case 'PENDING':
        return 'Beklemede';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography component="h1" variant="h5">
            İzin Taleplerim
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/new-request')}
          >
            Yeni İzin Talebi
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {requests.length === 0 ? (
          <Alert severity="info">
            Henüz izin talebiniz bulunmamaktadır.
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Başlangıç Tarihi</TableCell>
                  <TableCell>Bitiş Tarihi</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell>Durum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {format(new Date(request.startDate), 'dd MMMM yyyy', { locale: tr })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.endDate), 'dd MMMM yyyy', { locale: tr })}
                    </TableCell>
                    <TableCell>{request.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(request.status)}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default LeaveRequestList;
