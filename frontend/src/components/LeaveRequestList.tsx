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
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import type { User } from '../types';

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
  calisanId: number;
  requestTime: string;
  requestedDates: string | string[];
  requestStatus: string;
  requestDesc: string;
  employeeName?: string;
}

const LeaveRequestList: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const isHR = user?.pozisyon === 'İK Uzmanı';

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await api.get('/izin-talepleri', config);
        console.log('API Response:', response.data);

        if (Array.isArray(response.data)) {
          const formattedRequests = response.data.map(request => ({
            ...request,
            requestedDates: Array.isArray(request.requestedDates) 
              ? request.requestedDates 
              : [request.requestedDates]
          }));

          // İK Uzmanı değilse sadece kendi taleplerini göster
          const filteredRequests = isHR 
            ? formattedRequests 
            : formattedRequests.filter(request => request.calisanId === (user as User)?.calisanId);

          setRequests(filteredRequests);
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
  }, [navigate, token, user, isHR]);

  const handleApprove = async (requestId: string) => {
    try {
      await api.post(`/izin-talepleri/${requestId}/onayla`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('İzin talebi onaylandı');
      setRequests(requests.map(req => 
        req.id === requestId 
          ? { ...req, requestStatus: 'ONAYLANDI' }
          : req
      ));
    } catch (error) {
      toast.error('İzin talebi onaylanırken bir hata oluştu');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await api.post(`/izin-talepleri/${requestId}/reddet`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('İzin talebi reddedildi');
      setRequests(requests.map(req => 
        req.id === requestId 
          ? { ...req, requestStatus: 'REDDEDİLDİ' }
          : req
      ));
    } catch (error) {
      toast.error('İzin talebi reddedilirken bir hata oluştu');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONAYLANDI':
        return 'success';
      case 'REDDEDİLDİ':
        return 'error';
      case 'BEKLEMEDE':
        return 'warning';
      default:
        return 'default';
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
        <Box>
          <Typography variant="h5" component="h2">
            İzin Talepleri
          </Typography>
          {isHR && (
            <Chip 
              label="İK Uzmanı Görünümü" 
              color="primary" 
              size="small" 
              sx={{ mt: 1 }}
            />
          )}
        </Box>
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
              {isHR && <TableCell>Çalışan</TableCell>}
              <TableCell>Talep Tarihi</TableCell>
              <TableCell>İzin Tarihleri</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Açıklama</TableCell>
              {isHR && <TableCell>İşlemler</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isHR ? 6 : 4} align="center">
                  Henüz izin talebi bulunmamaktadır.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  {isHR && (
                    <TableCell>{request.employeeName || `Çalışan ID: ${request.calisanId}`}</TableCell>
                  )}
                  <TableCell>{formatDate(request.requestTime)}</TableCell>
                  <TableCell>
                    {Array.isArray(request.requestedDates) 
                      ? request.requestedDates.map(date => (
                          <div key={date}>{formatDate(date)}</div>
                        ))
                      : formatDate(request.requestedDates as string)
                    }
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={request.requestStatus} 
                      color={getStatusColor(request.requestStatus) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{request.requestDesc}</TableCell>
                  {isHR && request.requestStatus === 'BEKLEMEDE' && (
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleApprove(request.id)}
                        >
                          Onayla
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() => handleReject(request.id)}
                        >
                          Reddet
                        </Button>
                      </Box>
                    </TableCell>
                  )}
                  {isHR && request.requestStatus !== 'BEKLEMEDE' && (
                    <TableCell>-</TableCell>
                  )}
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