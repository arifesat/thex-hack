import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Axios instance oluştur
const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface LeaveRequest {
  id: string;
  calisanId: string;
  requestTime: string;
  requestedDates: string | string[]; // string veya string[] olabilir
  requestStatus: string;
  requestDesc: string;
}

const LeaveRequestList: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        // Token'ı header'a ekle
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await api.get('/izin-talepleri', config);
        console.log('API Response:', response.data); // Debug için

        if (Array.isArray(response.data)) {
          // Veriyi düzenle
          const formattedRequests = response.data.map(request => ({
            ...request,
            requestedDates: Array.isArray(request.requestedDates) 
              ? request.requestedDates 
              : [request.requestedDates] // Tek tarih ise diziye çevir
          }));
          setRequests(formattedRequests);
        } else {
          console.error('Unexpected API response format:', response.data);
          setError('Sunucudan beklenmeyen yanıt formatı alındı.');
        }
      } catch (error) {
        console.error('Error fetching leave requests:', error);
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED') {
            setError('Sunucuya bağlanırken zaman aşımı oluştu. Lütfen sayfayı yenileyin.');
          } else if (error.response?.status === 401) {
            setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
            setTimeout(() => navigate('/login'), 2000);
          } else if (error.response?.status === 403) {
            setError('Bu sayfaya erişim yetkiniz yok.');
          } else {
            setError(`İzin talepleri yüklenirken bir hata oluştu: ${error.response?.data?.message || error.message}`);
          }
        } else {
          setError('Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRequests();
    } else {
      setError('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate, token]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <Alert severity="error">{error}</Alert>
        <Box mt={2} display="flex" justifyContent="center">
          <Button variant="contained" onClick={() => window.location.reload()}>
            Sayfayı Yenile
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          İzin Talepleri
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/new-request')}
        >
          Yeni İzin Talebi
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Talep Tarihi</TableCell>
              <TableCell>İzin Tarihleri</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Açıklama</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Henüz izin talebi bulunmamaktadır.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{formatDate(request.requestTime)}</TableCell>
                  <TableCell>
                    {Array.isArray(request.requestedDates) 
                      ? request.requestedDates.map(date => (
                          <div key={date}>{formatDate(date)}</div>
                        ))
                      : formatDate(request.requestedDates as string)
                    }
                  </TableCell>
                  <TableCell>{request.requestStatus}</TableCell>
                  <TableCell>{request.requestDesc}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LeaveRequestList; 